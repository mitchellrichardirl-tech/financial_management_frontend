import { useState } from 'react';
import { getAccounts, previewFile, importFile } from '../services/api';
import FileDropzone from '../components/FileDropzone';
import PreviewTable from '../components/PreviewTable';
import ImportResult from '../components/ImportResult';
import './UploadStatement.css';

function UploadStatement() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startRow, setStartRow] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setSelectedAccountId('');
    setStartRow(1);
    setImportResult(null);
    setError(null);
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setError(null);
    setPreviewData(null);
    setImportResult(null);
    setIsLoading(true);

    try {
      const preview = await previewFile(file);
      setPreviewData(preview);
      
      const accountsData = await getAccounts();
      setAccounts(accountsData);
    } catch (err) {
      setError(err.message || 'Failed to preview file');
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountCreated = (newAccount) => {
    setAccounts([...accounts, newAccount]);
  };

  const handleImport = async () => {
    if (selectedAccountId === '') {
      setError('Please select an account');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await importFile(selectedFile, startRow, selectedAccountId);
      
      // Debug: Log the actual response
      console.log('Import API response:', result);
      console.log('Response type:', typeof result);
      console.log('Response keys:', result ? Object.keys(result) : 'null');
      
      setImportResult(result);
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import file');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toUpperCase();
  };

  return (
    <div className="upload-statement">
      <h1>Upload Bank Statement</h1>
      
      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="upload-loading">
          Loading...
        </div>
      )}

      {importResult ? (
        <div className="import-result-section">
          <ImportResult 
            result={importResult}
            onUploadAnother={handleUploadAnother}
            showHeader={true}
          />
        </div>
      ) : (
        <>
          {!previewData && !isLoading && (
            <div className="dropzone-section">
              <FileDropzone 
                onFileSelect={handleFileSelect}
                disabled={isLoading}
              />
            </div>
          )}

          {selectedFile && previewData && (
            <>
              <div className="file-info">
                <div className="file-info-item">
                  <span className="file-info-label">File:</span>
                  <span className="file-info-value">{selectedFile.name}</span>
                </div>
                <div className="file-info-divider"></div>
                <div className="file-info-item">
                  <span className="file-info-label">Type:</span>
                  <span className="file-info-value">{getFileExtension(selectedFile.name)}</span>
                </div>
                <div className="file-info-divider"></div>
                <div className="file-info-item">
                  <span className="file-info-label">Size:</span>
                  <span className="file-info-value">{formatFileSize(selectedFile.size)}</span>
                </div>
                <button className="file-remove-btn" onClick={handleUploadAnother}>
                  Remove
                </button>
              </div>

              <div className="preview-section">
                <div className="preview-table-container">
                  <PreviewTable 
                    previewData={previewData}
                    startRow={startRow}
                    onStartRowChange={setStartRow}
                    compact={true}
                  />
                </div>

                <div className="import-controls">
                  <div className="start-row-control">
                    <label>Start Row:</label>
                    <input
                      type="number"
                      min="1"
                      value={startRow}
                      onChange={(e) => setStartRow(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="account-control">
                    <label>Account:</label>
                    <select
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="">-- Select Account --</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name || account.account_name || account.title || `Account ${account.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="import-btn"
                    onClick={handleImport}
                    disabled={isLoading || selectedAccountId === ''}
                  >
                    {isLoading ? 'Importing...' : 'Import Transactions'}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default UploadStatement;