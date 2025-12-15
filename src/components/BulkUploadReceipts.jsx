import { useState } from "react";
import FilePreview from "./FilePreview";
import FileDropzone from "./FileDropzone";

function BulkUploadReceipts(
  {onReceiptProcessed,
    onProcessingStart,
    onProcessingComplete
  }
) {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const processReceipts = async () => {
    setIsProcessing(true);
    setResults([]);

    const formData = new FormData();
    files.forEach((file) => {
      console.log(`Adding file ${file.name} to payload`)
      formData.append('files', file);
    });

    const response = await fetch('/api/receipts/upload-stream', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          const result = JSON.parse(jsonStr);
          console.log('Receipt result', result)
          if (result.status === 'success') {
            onReceiptProcessed(result);
          }
        }
      }
    }
    setIsProcessing(false);
  };
    
  return (
    <div className="receipt-uploader">
      <div className="dropzone-section">
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />

        {files.length > 0 && (
          <>
            <FilePreview files={files} onRemove={removeFile} />
            <button
              onClick={processReceipts}
              disabled={isProcessing || files.length === 0}
            >
              {isProcessing ? 'Processing...': `Process ${files.length} Receipt(s)`}
            </button>
          </>
        )}
      </div>
      {(isProcessing || results.length > 0) && (
        <BulkUploadReceipts results={results} totalFiles={files.length} />
      )}
    </div>
  );
}

export default BulkUploadReceipts;