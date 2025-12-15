import { useState, useEffect } from "react";
import { processReceiptImage, confirmReceipt, deleteReceipt, getCandidateTransactions, updateTransaction } from "../services/api";
import FileDropzone from "../components/FileDropzone";
import ImagePreview from "../components/ImagePreview";
import CandidateTransactions from "../components/CandidateTransactions";
import './ProcessReceipts.css';

function ProcessReceipts() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState(null);
  const [processResult, setProcessResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  
  const [editableData, setEditableData] = useState({
    vendor: "",
    date: "",
    amount: ""
  });

  // State for candidate transactions
  const [candidateTransactions, setCandidateTransactions] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [linkedTransactionId, setLinkedTransactionId] = useState(null);

  // Fetch candidate transactions when editableData changes
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!editableData.date && !editableData.amount) {
        setCandidateTransactions([]);
        return;
      }

      setIsLoadingCandidates(true);
      try {
        const params = {
          date: editableData.date || null,
          amount: editableData.amount ? parseFloat(editableData.amount) : null,
          vendor: editableData.vendor || null
        };

        const response = await getCandidateTransactions(params);
        
        if (response.success && response.data?.transactions) {
          setCandidateTransactions(response.data.transactions);
        } else {
          setCandidateTransactions([]);
        }
      } catch (err) {
        console.error("Failed to fetch candidate transactions:", err);
        setCandidateTransactions([]);
      } finally {
        setIsLoadingCandidates(false);
      }
    };

    const timeoutId = setTimeout(fetchCandidates, 500);
    return () => clearTimeout(timeoutId);
  }, [editableData.date, editableData.amount, editableData.vendor]);

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setProcessResult(null);
    setError(null);
    setSaveSuccess(false);
    setLinkSuccess(false);
    setEditableData({ vendor: "", date: "", amount: "" });
    setCandidateTransactions([]);
    setLinkedTransactionId(null);
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setError(null);
    setProcessResult(null);
    setSaveSuccess(false);
    setLinkSuccess(false);
    setLinkedTransactionId(null);
    setIsProcessing(true);

    try {
      const result = await processReceiptImage(file);
      setProcessResult(result);
      console.log('upload returns:', result);
      
      const receipt = result.data?.receipt;
      if (receipt) {
        setEditableData({
          vendor: receipt.vendor || "",
          date: receipt.date ? receipt.date.split('T')[0] : "",
          amount: receipt.amount?.toString() || ""
        });
      }
    } catch (err) {
      setError(err.message || "Failed to process receipt");
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to build receipt data object
  const buildReceiptData = () => {
    return {
      original_filename: selectedFile.name,
      vendor: editableData.vendor,
      amount: editableData.amount ? parseFloat(editableData.amount) : null,
      date: editableData.date || null,
      id: processResult?.data?.receipt?.id,
      stored_filename: processResult?.data?.receipt?.stored_filename,
      file_path: processResult?.data?.receipt?.file_path,
      confidence: processResult?.data?.receipt?.confidence || 0,
      selected_method: processResult?.data?.receipt?.selected_method || 'manual',
      raw_text: processResult?.data?.receipt?.extracted_text,
      page_number: processResult?.data?.receipt?.page_number || 1
    };
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const receiptData = buildReceiptData();
      console.log("Saving receipt data:", receiptData);
      
      const saveResult = await confirmReceipt(receiptData);
      console.log("Save result:", saveResult);
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        handleUploadAnother();
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Failed to save receipt");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectTransaction = async (transaction) => {
    setError(null);
    setLinkSuccess(false);
    setIsLinking(true);

    try {
      // Step 1: Save/confirm the receipt
      const receiptData = buildReceiptData();
      console.log("Saving receipt before linking:", receiptData);
      
      const saveResult = await confirmReceipt(receiptData);
      console.log("Receipt save result:", saveResult);

      // Get the receipt ID from the response
      const receiptId = saveResult.data?.receipt?.id || saveResult.receipt?.id || saveResult.id;
      
      if (!receiptId) {
        throw new Error("Failed to get receipt ID from save response");
      }

      // Step 2: Update the transaction with the receipt ID
      console.log(`Linking transaction ${transaction.id} to receipt ${receiptId}`);
      
      const updateResult = await updateTransaction(transaction.id, {
        receipt_id: receiptId
      });
      console.log("Transaction update result:", updateResult);

      // Step 3: Update UI state
      setLinkedTransactionId(transaction.id);
      setLinkSuccess(true);

      // Reset after delay
      setTimeout(() => {
        handleUploadAnother();
      }, 3000);

    } catch (err) {
      console.error("Failed to link receipt to transaction:", err);
      setError(err.message || "Failed to link receipt to transaction");
    } finally {
      setIsLinking(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const receiptData = {
        receiptId: processResult?.data?.receipt?.id
      };

      console.log("Deleting receipt:", receiptData);

      const deleteResult = await deleteReceipt(receiptData);
      
      console.log("Deletion result:", deleteResult);

      setSaveSuccess(true);

      setTimeout(() => {
        handleUploadAnother();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to delete receipt");
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = editableData.vendor.trim() !== '' && !isSaving && !isLinking;

  return (
    <div className="process-receipts">
      <h1>Process Receipts</h1>

      {error && (
        <div className="receipt-error">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="receipt-success">
          Receipt saved successfully!
        </div>
      )}

      {linkSuccess && (
        <div className="receipt-success">
          Receipt successfully linked to transaction!
        </div>
      )}

      {isProcessing && (
        <div className="receipt-processing">
          Processing receipt...
        </div>
      )}

      {isLinking && (
        <div className="receipt-processing">
          Linking receipt to transaction...
        </div>
      )}

      {selectedFile && processResult ? (
        <div className="processed-receipt-section">
          <div className="processed-receipt-layout">
            {/* Left Column - Image Preview */}
            <div className="left-column">
              <div className="receipt-image-container">
                <h3>Uploaded Receipt</h3>
                <ImagePreview 
                  src={`/api/receipts/${processResult?.data?.receipt?.id}/image`}
                  alt="Receipt image"
                  maxHeight="600px"
                />
              </div>
            </div>

            {/* Right Column - Details and Candidates */}
            <div className="right-column">
              {/* Top Right - Receipt Details Form */}
              <div className="receipt-details-section">
                <h3>Receipt Details</h3>
                
                <div className="receipt-form">
                  <div className="form-group">
                    <label htmlFor="vendor">
                      Vendor: <span className="required">*</span>
                    </label>
                    <input
                      id="vendor"
                      type="text"
                      value={editableData.vendor}
                      onChange={(e) => handleInputChange("vendor", e.target.value)}
                      placeholder="Enter vendor name"
                      required
                      disabled={isLinking}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Date:</label>
                    <input
                      id="date"
                      type="date"
                      value={editableData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      disabled={isLinking}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="amount">Amount:</label>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={editableData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      placeholder="Enter amount"
                      disabled={isLinking}
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      onClick={handleSave} 
                      className="btn-save"
                      disabled={!canSave}
                      title="Save receipt without linking to a transaction"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={handleDelete} 
                      className="btn-delete"
                      disabled={!canSave}
                    >
                      {isSaving ? 'Deleting...' : 'Delete'}
                    </button>
                    <button 
                      onClick={handleUploadAnother} 
                      className="btn-upload-another"
                      disabled={isLinking}
                    >
                      Upload Another
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Right - Candidate Transactions */}
              <div className="candidate-transactions-section">
                {isLoadingCandidates ? (
                  <div className="loading-candidates">
                    Loading candidate transactions...
                  </div>
                ) : (
                  <CandidateTransactions 
                    transactions={candidateTransactions}
                    onSelectTransaction={handleSelectTransaction}
                    linkedTransactionId={linkedTransactionId}
                    disabled={isLinking}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <FileDropzone 
          onFileSelect={handleFileSelect}
          disabled={isProcessing}
          acceptedFileTypes=".jpg,.jpeg,.png,.pdf"
          supportedFormatsText="JPG, PNG, PDF"
        />
      )}
    </div>
  );
}

export default ProcessReceipts;