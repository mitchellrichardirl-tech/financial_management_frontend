import { useState } from "react";
import { processReceiptImage, confirmReceipt, deleteReceipt } from "../services/api";
import FileDropzone from "../components/FileDropzone";
import ImagePreview from "../components/ImagePreview";

function ProcessReceipts() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [processResult, setProcessResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [editableData, setEditableData] = useState({
    vendor: "",
    date: "",
    amount: ""
  });

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setProcessResult(null);
    setError(null);
    setSaveSuccess(false);
    setEditableData({ vendor: "", date: "", amount: "" });
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setError(null);
    setProcessResult(null);
    setSaveSuccess(false);
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

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      // Prepare data for the confirm endpoint
      const receiptData = {
        original_filename: selectedFile.name,
        vendor: editableData.vendor,
        amount: editableData.amount ? parseFloat(editableData.amount) : null,
        date: editableData.date || null,
        
        // From the process result
        id: processResult?.data?.receipt?.id,
        stored_filename: processResult?.data?.receipt?.stored_filename,
        file_path: processResult?.data?.receipt?.file_path,
        confidence: processResult?.data?.receipt?.confidence || 0,
        selected_method: processResult?.data?.receipt?.selected_method || 'manual',
        raw_text: processResult?.data?.receipt?.extracted_text,
        page_number: processResult?.data?.receipt?.page_number || 1
      };

      console.log("Saving receipt data:", receiptData);
      
      const saveResult = await confirmReceipt(receiptData);
      console.log("Save result:", saveResult);
      
      setSaveSuccess(true);
      
      // Optional: Clear form after successful save or show success message
      setTimeout(() => {
        handleUploadAnother();
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Failed to save receipt");
    } finally {
      setIsSaving(false);
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
  }
  // Validation to ensure vendor is filled
  const canSave = editableData.vendor.trim() !== '' && !isSaving;

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

      {isProcessing && (
        <div className="receipt-processing">
          Processing receipt...
        </div>
      )}

      {selectedFile && processResult ? (
        <div className="processed-receipt-section">
          <div className="processed-receipt-container">
            {/* Image Preview */}
            <div className="receipt-image-container">
              <h3>Uploaded Receipt</h3>
              <ImagePreview 
                src={`/api/receipts/${processResult?.data?.receipt?.id}/image`}
                alt="Receipt image"
                maxHeight="500px"
              />
            </div>

            {/* Editable Form */}
            <div className="processed-receipt-result">
              <h2>Receipt Details</h2>
              
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
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Date:</label>
                  <input
                    id="date"
                    type="date"
                    value={editableData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
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
                  />
                </div>

                <div className="form-actions">
                  <button 
                    onClick={handleSave} 
                    className="btn-save"
                    disabled={!canSave}
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
                  <button onClick={handleUploadAnother} className="btn-upload-another">
                    Upload Another
                  </button>
                </div>
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