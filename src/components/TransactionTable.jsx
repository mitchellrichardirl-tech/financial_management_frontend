import { useState, useMemo } from 'react';
import TransactionRow from './TransactionRow';
import CreateCategoryModal from './CreateCategoryModal';
import './TransactionTable.css';

export default function TransactionTable({ 
  transactions,
  accounts,
  categories,
  subCategories,
  types,
  parties,
  onUpdate,
  onCategoryCreated,
  onSubCategoryCreated,
  onTypeCreated,
  onPartyCreated,
  selectedTransactions,
  onSelectionChange
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Modal state
  const [createModalState, setCreateModalState] = useState({
    isOpen: false,
    type: null,
    parentId: null,
    parentName: '',
    onSuccess: null, // Callback when item is created
  });

  const transactionArray = Array.isArray(transactions) ? transactions : [];

  const sortedTransactions = useMemo(() => {
    if (!sortConfig.key || transactionArray.length === 0) return transactionArray;

    return [...transactionArray].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (sortConfig.key === 'transaction_date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortConfig.key === 'amount') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactionArray, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(transactionArray.map(t => t.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleRowSelection = (transactionId, checked) => {
    if (checked) {
      onSelectionChange([...selectedTransactions, transactionId]);
    } else {
      onSelectionChange(selectedTransactions.filter(id => id !== transactionId));
    }
  };

  // Unified create handler - called by TransactionRow
  const handleOpenCreateModal = (type, parentId, parentName, onSuccess) => {
    console.log('Opening create modal:', { type, parentId, parentName });
    setCreateModalState({
      isOpen: true,
      type,
      parentId,
      parentName,
      onSuccess,
    });
  };

  const handleCloseModal = () => {
    setCreateModalState({
      isOpen: false,
      type: null,
      parentId: null,
      parentName: '',
      onSuccess: null,
    });
  };

  const handleSaveNewItem = async (name, parentId, description) => {
    const { type, onSuccess } = createModalState;
    
    try {
      let newItem;
      
      switch (type) {
        case 'category':
          newItem = await onCategoryCreated(name, description);
          break;
        case 'sub_category':
          newItem = await onSubCategoryCreated(name, parentId, description);
          break;
        case 'type':
          newItem = await onTypeCreated(name, parentId, description);
          break;
        case 'party':
          newItem = await onPartyCreated(name, parentId, description);
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }
      
      console.log('Created new item:', newItem);
      
      // Call the success callback to update the draft in TransactionRow
      if (onSuccess && newItem) {
        onSuccess(newItem);
      }
      
      handleCloseModal();
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  };

  const allSelected = transactionArray.length > 0 && 
    selectedTransactions.length === transactionArray.length;

  const SortableHeader = ({ field, children }) => (
    <th onClick={() => handleSort(field)} className="sortable-header">
      {children}
      {sortConfig.key === field && (
        <span className="sort-indicator">
          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
        </span>
      )}
    </th>
  );

  return (
    <>
      <div className="transaction-table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th className="select-header">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <SortableHeader field="description">Description</SortableHeader>
              <th>Cleaned Description</th>
              <SortableHeader field="transaction_date">Date</SortableHeader>
              <SortableHeader field="amount">Amount</SortableHeader>
              <SortableHeader field="is_credit">Lodgment</SortableHeader>
              <SortableHeader field="account_name">Account</SortableHeader>
              <SortableHeader field="party_name">Party</SortableHeader>
              <SortableHeader field="type_name">Type</SortableHeader>
              <SortableHeader field="sub_category_name">Sub-Category</SortableHeader>
              <SortableHeader field="category_name">Category</SortableHeader>
              <SortableHeader field="is_kids">Kid's</SortableHeader>
              <SortableHeader field="is_one_off">One-Off</SortableHeader>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map(transaction => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                accounts={accounts}
                allCategories={categories}
                allSubCategories={subCategories}
                allTypes={types}
                allParties={parties}
                onUpdate={onUpdate}
                onOpenCreateModal={handleOpenCreateModal}
                isSelected={selectedTransactions.includes(transaction.id)}
                onSelectionChange={(checked) => handleRowSelection(transaction.id, checked)}
              />
            ))}
          </tbody>
        </table>
        
        {transactionArray.length === 0 && (
          <div className="no-transactions">
            No transactions found
          </div>
        )}
      </div>
      
      <CreateCategoryModal
        isOpen={createModalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNewItem}
        type={createModalState.type}
        parentName={createModalState.parentName}
        parentId={createModalState.parentId}
      />
    </>
  );
}