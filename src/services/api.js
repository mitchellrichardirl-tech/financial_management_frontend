const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic API call handler with error handling
 */
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get all accounts
 */
export async function getAccounts() {
  const response = await apiCall('/accounts');
  return response.data; // Extract data array from success response
}

/**
 * Preview a tabular file
 */
export async function previewFile(file, numRows = 20) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('num_rows', numRows);
  formData.append('include_types', 'true');

  return await apiCall('/tabular/preview', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Import a tabular file
 */
export async function importFile(file, startRow, accountId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('start_row', startRow.toString());
  formData.append('account_id', parseInt(accountId).toString()); // Convert to int, then to string for FormData
  formData.append('has_header', 'true');
  formData.append('skip_empty_rows', 'true');
  formData.append('strip_whitespace', 'true');

  console.log('Import request:', {
    url: '/tabular/import',
    startRow,
    accountId: parseInt(accountId),
    fileName: file.name
  });

  return await apiCall('/tabular/import', {
    method: 'POST',
    body: formData,
  });
}