import { useState } from "react";
import FileDropzone from "../components/FileDropzone";
import BulkUploadReceipts from "../components/BulkUploadReceipts";
import ReceiptTable from "../components/ReceiptTable";

function BulkReceiptProcessor() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelect = async (files) => {
    setSelectedFiles(files);
    setReceipts([]);
    setError(null);
  }

  const handleReceiptProcessed = (newReceipt) => {
    setReceipts(prev => [...prev, newReceipt]);
  };

  return (
    <div>
      <BulkUploadReceipts
        onReceiptProcessed={handleReceiptProcessed}
        onProcessingStart={() => setIsProcessing(true)}
        onProcessingComplete={() => setIsProcessing(false)}
      />
      <ReceiptTable receipts={receipts} />
    </div>
  );
}

export default BulkReceiptProcessor;