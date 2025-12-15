import { useState } from "react";
import ReceiptThumbnail  from "./Thumbnail";

export default function ReceiptRow({
  receipt
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const formatAmount = (amount) => {
    if (amount == null) return '';
    return parseFloat(amount).toFixed(2);
  };

  // Render helpers
  const renderViewCell = (value) => (
    <span className="view-value">{value || '-'}</span>
  );

  console.log('Trying to render row from:', receipt);
  return (
    <tr className={`receipt-row ${isEditing ? 'editing' : ''} ${isLinked ? 'linked' : ''} ${error ? 'has-error' : ''} }`}>
      <td className="vendor-cell">{receipt.extracted_data.vendor}</td>
      <td className="date_cell">{formatDate(receipt.extracted_data.date)}</td>
      <td className="amount_cell">{formatAmount(receipt.extracted_data.amount)}</td>
      <td className="receipt-thumbnail">
        <ReceiptThumbnail
          src={`/api/receipts/${receipt.receipt_id}/image`}
          alt="Receipt Thumbnail"
        />
      </td>
    </tr>
  );
}