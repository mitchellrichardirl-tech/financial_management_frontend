import { useState, useEffect } from 'react';
import { getTransactions } from '../services/api';

function ImportResult({ result, onUploadAnother }) {
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result?.upload_id) {
      fetchTransactions();
    }
  }, [result?.upload_id]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions({ 
        upload_id: result.upload_id,
        limit: 500 // Get all transactions from this upload
      });
      setTransactions(data.transactions);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!result) return null;

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{
        padding: '20px',
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#155724', marginTop: 0 }}>✓ Import Successful!</h2>
        <div style={{ fontSize: '14px' }}>
          <p><strong>File:</strong> {result.file_name}</p>
          <p><strong>Rows imported:</strong> {result.rows_imported}</p>
          <p><strong>Upload ID:</strong> {result.upload_id}</p>
        </div>
      </div>

      <button
        onClick={onUploadAnother}
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Upload Another Statement
      </button>

      {/* Transactions Table */}
      <div style={{ marginTop: '30px' }}>
        <h3>Imported Transactions</h3>
        
        {loading && <p>Loading transactions...</p>}
        
        {error && (
          <div style={{ color: 'red', padding: '10px' }}>
            {error}
          </div>
        )}
        
        {transactions && !loading && (
          <>
            <p style={{ marginBottom: '20px' }}>
              Showing {transactions.length} processed transactions
            </p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                      Date
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                      Description
                    </th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>
                      Amount
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                      Party
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                      Category
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '10px' }}>
                        {new Date(txn.transaction_date).toLocaleDateString('en-IE')}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {txn.description}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        textAlign: 'right',
                        color: txn.amount > 0 ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        €{Math.abs(txn.amount).toFixed(2)}
                        {txn.amount > 0 ? ' ↑' : ' ↓'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {txn.party_name || '-'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {txn.category_name ? (
                          <span>
                            {txn.category_name}
                            {txn.sub_category_name && (
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                {' → ' + txn.sub_category_name}
                              </span>
                            )}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {txn.type_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div style={{ 
              marginTop: '30px', 
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              <h4>Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <strong>Total Income:</strong> €{
                    transactions
                      .filter(t => t.amount > 0)
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)
                  }
                </div>
                <div>
                  <strong>Total Expenses:</strong> €{
                    Math.abs(
                      transactions
                        .filter(t => t.amount < 0)
                        .reduce((sum, t) => sum + t.amount, 0)
                    ).toFixed(2)
                  }
                </div>
                <div>
                  <strong>Categorized:</strong> {
                    transactions.filter(t => t.party_id).length
                  } / {transactions.length}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ImportResult;