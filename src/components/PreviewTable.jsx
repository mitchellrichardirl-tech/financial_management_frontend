function PreviewTable({ previewData, startRow, onStartRowChange }) {
  if (!previewData) return null;

  const { columns, data, total_rows, column_types } = previewData;

  if (!columns || !data) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Invalid preview data structure</p>
        <pre>{JSON.stringify(previewData, null, 2)}</pre>
      </div>
    );
  }

  // Preview treats row 1 as header, so data starts at row 2
  const ROW_OFFSET = 1;

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>File Preview</h2>
      
      {/* File info */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <p><strong>File:</strong> {previewData.file_name}</p>
        <p><strong>Type:</strong> {previewData.file_type}</p>
        <p><strong>Total Rows:</strong> {total_rows}</p>
        <p><strong>Columns:</strong> {columns.length}</p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          Note: Preview shows rows 2 onwards (row 1 was used as column headers)
        </p>
      </div>

      {/* Start row selector */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="startRow" style={{ marginRight: '10px' }}>
          <strong>Start importing from row:</strong>
        </label>
        <input
          id="startRow"
          type="number"
          min="1"
          max={total_rows}
          value={startRow}
          onChange={(e) => onStartRowChange(parseInt(e.target.value))}
          style={{
            padding: '5px 10px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '80px'
          }}
        />
        <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
          (Row {startRow} in the original file)
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                borderBottom: '2px solid #dee2e6',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                backgroundColor: '#f8f9fa'
              }}>
                Row
              </th>
              {columns.map((col, idx) => (
                <th key={idx} style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: 'bold'
                }}>
                  <div>{col}</div>
                  {column_types && column_types[col] && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#6c757d',
                      fontWeight: 'normal',
                      marginTop: '4px'
                    }}>
                      {column_types[col]}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => {
              // This row is actually row (rowIdx + 2) in the original file
              const actualRowNum = rowIdx + ROW_OFFSET + 1;
              return (
                <tr key={rowIdx} style={{
                  backgroundColor: actualRowNum === startRow 
                    ? '#fff3cd' 
                    : actualRowNum < startRow 
                      ? '#f8d7da' 
                      : 'white',
                  opacity: actualRowNum < startRow ? 0.6 : 1
                }}>
                  <td style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #dee2e6',
                    fontWeight: 'bold',
                    color: '#6c757d'
                  }}>
                    {actualRowNum}
                  </td>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      {row[col] !== null && row[col] !== undefined 
                        ? String(row[col]) 
                        : ''}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: '15px', 
        fontSize: '14px',
        display: 'flex',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#f8d7da',
            border: '1px solid #dee2e6',
            marginRight: '8px'
          }}></div>
          <span>Rows to skip</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#fff3cd',
            border: '1px solid #dee2e6',
            marginRight: '8px'
          }}></div>
          <span>Start row (will be header)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            marginRight: '8px'
          }}></div>
          <span>Data rows</span>
        </div>
      </div>
    </div>
  );
}

export default PreviewTable;