const FilePreview = ({ files, onRemove }) => {
  return (
    <div className="file-preview-container">
      {files.map((file, index) => (
        <div key={index} className="file-preview-item">
          <span>{file.name}</span>
          <span>{(file.size / 1024).toFixed(2)} KB</span>
          <button onClick={() => onRemove(index)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default FilePreview;