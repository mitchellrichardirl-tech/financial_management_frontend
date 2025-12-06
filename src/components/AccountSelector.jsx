function AccountSelector({ accounts, selectedAccountId, onAccountChange, disabled }) {
  const handleChange = (e) => {
    const value = e.target.value;
    // If empty string, keep it as empty string
    // Otherwise convert to number
    if (value === '') {
      onAccountChange('');
    } else {
      onAccountChange(parseInt(value, 10));
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <label htmlFor="account" style={{ 
        display: 'block',
        marginBottom: '10px',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        Select Account:
      </label>
      <select
        id="account"
        value={selectedAccountId}
        onChange={handleChange}
        disabled={disabled}
        style={{
          padding: '10px',
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '400px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#f5f5f5' : 'white'
        }}
      >
        <option value="">-- Select an account --</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.account_name} ({account.account_type})
          </option>
        ))}
      </select>
      
      {(selectedAccountId === '' || selectedAccountId === null || selectedAccountId === undefined) && (
        <div style={{ 
          marginTop: '8px', 
          fontSize: '13px', 
          color: '#dc3545' 
        }}>
          Please select an account before importing
        </div>
      )}
    </div>
  );
}

export default AccountSelector;