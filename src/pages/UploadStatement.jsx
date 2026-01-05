import { useState } from 'react';
import { getAccounts, previewFile, importFile } from '../services/api';
import FileDropzone from '../components/FileDropzone';
import PreviewTable from '../components/PreviewTable';
import ImportResult from '../components/ImportResult';
import AccountSelector from '../components/AccountSelector';
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
      setPreviewData(preview.data);
      
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

  const handleAccountChange = (accountId) => {
    setSelectedAccountId(accountId);
    if (accountId && error === 'Please select an account') {
      setError(null);
    }
  };

  const handleImport = async () => {
    if (selectedAccountId === '' || !selectedAccountId) {
      setError('Please select an account');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await importFile(selectedFile, startRow, selectedAccountId);
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

          <div className="preview-section">
              {/* File Info Table - Fixed at top */}
              <div className="file-info-table">
                <table>
                  <tbody>
                    <tr>
                      <td className="info-label">File Name:</td>
                      <td className="info-value">{selectedFile.name}</td>
                      <td className="info-label">Type:</td>
                      <td className="info-value">{getFileExtension(selectedFile.name)}</td>
                      <td className="info-label">Size:</td>
                      <td className="info-value">{formatFileSize(selectedFile.size)}</td>
                      <td className="info-label">Total Rows:</td>
                      <td className="info-value">{previewData.total_rows}</td>
                      <td className="info-actions">
                        <button className="btn-remove" onClick={handleUploadAnother}>
                          Remove File
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Import Controls - Fixed below file info */}
              <div className="import-controls">
                <div className="control-group">
                  <label htmlFor="start-row">Start Row:</label>
                  <input
                    id="start-row"
                    type="number"
                    min="1"
                    max={previewData.total_rows}
                    value={startRow}
                    onChange={(e) => setStartRow(parseInt(e.target.value) || 1)}
                    className="control-input"
                  />
                </div>

                <div className="control-group account-group">
                  <AccountSelector
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                    onAccountChange={handleAccountChange}
                    onAccountCreated={handleAccountCreated}
                    disabled={isLoading}
                  />
                </div>

                <div className="control-group btn-group">
                  <button
                    className="btn-import"
                    onClick={handleImport}
                    disabled={isLoading || !selectedAccountId}
                  >
                    {isLoading ? 'Importing...' : 'Import Transactions'}
                  </button>
                </div>
              </div>

              {/* Preview Table - Scrollable */}
              <div className="preview-table-wrapper">
                <PreviewTable 
                  previewData={previewData}
                  startRow={startRow}
                  onStartRowChange={setStartRow}
                  compact={true}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UploadStatement;