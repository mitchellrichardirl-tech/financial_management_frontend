import { useState } from "react";
import { processReceiptImage, getReceiptImage } from "../services/api";
import FileDropzone from "../components/FileDropzone";
import ImagePreview from "../components/ImagePreview";

function ProcessReceipts() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [processResult, setProcessResult] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  
  const [editableData, setEditableData] = useState({
    vendor: "",
    date: "",
    amount: ""
  });

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setProcessResult(null);
    setImageUrl(null);
    setError(null);
    setEditableData({ vendor: "", date: "", amount: "" });
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setError(null);
    setProcessResult(null);
    setImageUrl(null);
    setIsProcessing(true);

    try {
      const result = await processReceiptImage(file);
      setProcessResult(result);
      console.log('upload returns: ', result);
      console.log('receipt id', result.data.receipt.id);
      setSelectedFile(file);
      const image_result = await getReceiptImage(result.data.receipt.id);
      console.log('Image path: ', image_result.data.file_path)
      setImageUrl(image_result.data.file_path);
      console.log("Image URL: ", imageUrl);
      if (result.extracted_data) {
        setEditableData({
          vendor: result.extracted_data.vendor || "",
          date: result.extracted_data.date ? 
            result.extracted_data.date.split('T')[0] : "",
          amount: result.extracted_data.amount?.toString() || ""
        });
      }
    } catch (err) {
      setError(err.message || "Failed to process receipt");
      setSelectedFile(null);
      setImageUrl(null);
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

  const handleSave = () => {
    console.log("Saving edited data:", editableData);
  };

  return (
    <div className="process-receipts">
      <h1>Process Receipts</h1>

      {error && (
        <div className="receipt-error">
          {error}
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
                file={imageUrl} 
                alt="Receipt image"
                maxHeight="500px"
              />
            </div>

            {/* Editable Form */}
            <div className="processed-receipt-result">
              <h2>Receipt Details</h2>
              
              <div className="receipt-form">
                <div className="form-group">
                  <label htmlFor="vendor">Vendor:</label>
                  <input
                    id="vendor"
                    type="text"
                    value={editableData.vendor}
                    onChange={(e) => handleInputChange("vendor", e.target.value)}
                    placeholder="Enter vendor name"
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
                  <button onClick={handleSave} className="btn-save">
                    Save
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