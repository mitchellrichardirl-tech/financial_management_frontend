import { useState } from 'react';
import ReceiptRow from './ReceiptRow';
// import './ReceiptTable.css';

export default function ReceiptTable({
  receipts = []
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc'});

  const SortableHeader = ({ field, children }) => (
  <th
    onClick={() => handleSort(field)}
    style={{cursor: 'pointer'}}
  >
    {children}
    {sortConfig.key === field && (
      <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
    )}
  </th>
  );

  return (
    <div className="receipt-table-container">
      <table className="receipt-table">
        <thead>
          <tr className="header-row">
            <SortableHeader field="vendor">Vendor</SortableHeader>
            <SortableHeader field="date">Date</SortableHeader>
            <SortableHeader field="amount">Amount</SortableHeader>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map(receipt => (
            <ReceiptRow
              key={receipt.receipt_id}
              receipt={receipt}
            />
          ))}
        </tbody>
      </table>
      {receipts.length === 0 && (
        <div className='empty-state'>
          No receipts processed yet
        </div>
      )}
    </div>
  );
}