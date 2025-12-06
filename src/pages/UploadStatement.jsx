import { useState } from 'react';
import { getAccounts, previewFile, importFile } from '../services/api';
import FileDropzone from '../components/FileDropzone';
import PreviewTable from '../components/PreviewTable';
import AccountSelector from '../components/AccountSelector';

function UploadStatement() {
  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startRow, setStartRow] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  // Handle file selection and trigger preview
  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setError(null);
    setPreviewData(null);
    setImportResult(null);
    setIsLoading(true);

    try {
        const preview = await previewFile(file);
        setPreviewData(preview);
        
        // Fetch accounts
        const accountsData = await getAccounts();
        console.log('Available accounts:', accountsData); // Debug line
        setAccounts(accountsData);
    } catch (err) {
        setError(err.message || 'Failed to preview file');
        setSelectedFile(null);
    } finally {
        setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (selectedAccountId === '') {
      setError('Please select an account');
      return;
    }

    console.log('Starting import:', {
      file: selectedFile,
      startRow,
      accountId: selectedAccountId
    });

    setIsLoading(true);
    setError(null);

    try {
        const result = await importFile(selectedFile, startRow, selectedAccountId);
        console.log('Import result:', result);
        setImportResult(result);
        
        alert(`Successfully imported ${result.rows_imported || 'data'} rows!`);
        
        // Reset form
        setSelectedFile(null);
        setPreviewData(null);
        setSelectedAccountId('');
        setStartRow(0);
    } catch (err) {
        console.error('Import error:', err);
        setError(err.message || 'Failed to import file');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Upload Bank Statement</h1>
      
      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          border: '1px solid red', 
          borderRadius: '4px',
          marginBottom: '20px',
          backgroundColor: '#ffe6e6'
        }}>
          {error}
        </div>
      )}

      {isLoading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          fontSize: '18px',
          color: '#007bff'
        }}>
          Loading...
        </div>
      )}

      {!previewData && !isLoading && (
        <FileDropzone 
          onFileSelect={handleFileSelect}
          disabled={isLoading}
        />
      )}

      {selectedFile && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px',
          backgroundColor: '#e7f3ff',
          borderRadius: '4px'
        }}>
          <strong>Selected file:</strong> {selectedFile.name}
        </div>
      )}

      {previewData && (
        <>
          <PreviewTable 
            previewData={previewData}
            startRow={startRow}
            onStartRowChange={setStartRow}
          />
          
          <AccountSelector
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onAccountChange={setSelectedAccountId}
            disabled={isLoading}
          />

          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
            <p>Debug - Selected Account ID: {selectedAccountId} (type: {typeof selectedAccountId})</p>
            <p>Is empty string: {selectedAccountId === '' ? 'YES' : 'NO'}</p>
            <p>Is Loading: {isLoading ? 'true' : 'false'}</p>
            <p>Button should be enabled: {!isLoading && selectedAccountId !== '' ? 'YES' : 'NO'}</p>
          </div>
          
          <button
            onClick={handleImport}
            disabled={isLoading || selectedAccountId === ''}  // Changed this line
            style={{
              marginTop: '20px',
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: selectedAccountId === '' ? '#6c757d' : '#28a745',  // And this
              border: 'none',
              borderRadius: '4px',
              cursor: selectedAccountId === '' || isLoading ? 'not-allowed' : 'pointer',  // And this
              opacity: selectedAccountId === '' || isLoading ? 0.6 : 1  // And this
            }}
          >
            {isLoading ? 'Importing...' : 'Import Transactions'}
          </button>
        </>
      )}
    </div>
  );
}

export default UploadStatement;