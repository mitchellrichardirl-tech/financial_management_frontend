import { useState, useMemo } from 'react';
import DropdownWithCreate from './DropdownWithCreate';
import Checkbox from './Checkbox';
import './TransactionRow.css';

export default function TransactionRow({ 
  transaction, 
  accounts,
  allCategories,
  allSubCategories,
  allTypes,
  allParties,
  onUpdate,
  onOpenCreateModal,
  isSelected,
  onSelectionChange
}) {
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Draft state - only used while editing
  const [draft, setDraft] = useState(null);

  // Initialize draft when entering edit mode
  const startEditing = () => {
    setDraft({
      category_id: allCategories.find(c => c.category === transaction.category_name)?.id || null,
      sub_category_id: allSubCategories.find(sc => sc.sub_category === transaction.sub_category_name)?.id || null,
      type_id: allTypes.find(t => t.type === transaction.type_name)?.id || null,
      party_id: transaction.party_id || null,
      is_kids: transaction.is_kids || false,
      is_one_off: transaction.is_one_off || false,
      cleaned_description: transaction.cleaned_description || '',
      is_credit: transaction.is_credit || false,
    });
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(null);
    setError(null);
    setIsEditing(false);
  };

  const saveChanges = async () => {
    if (!draft) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await onUpdate(transaction.id, {
        party_id: draft.party_id,
        is_kids: draft.is_kids,
        is_one_off: draft.is_one_off,
        cleaned_description: draft.cleaned_description,
        is_credit: draft.is_credit,
      });
      
      setIsEditing(false);
      setDraft(null);
    } catch (err) {
      console.error('Failed to save:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Computed filtered options based on draft selections
  const filteredSubCategories = useMemo(() => {
    if (!isEditing || !draft?.category_id) return allSubCategories;
    return allSubCategories.filter(sc => sc.category_id === draft.category_id);
  }, [isEditing, draft?.category_id, allSubCategories]);

  const filteredTypes = useMemo(() => {
    if (!isEditing) return allTypes;
    
    if (draft?.sub_category_id) {
      return allTypes.filter(t => t.sub_category_id === draft.sub_category_id);
    }
    
    if (draft?.category_id) {
      const subCatIds = filteredSubCategories.map(sc => sc.id);
      return allTypes.filter(t => subCatIds.includes(t.sub_category_id));
    }
    
    return allTypes;
  }, [isEditing, draft?.category_id, draft?.sub_category_id, filteredSubCategories, allTypes]);

  const filteredParties = useMemo(() => {
    if (!isEditing) return allParties;
    
    if (draft?.type_id) {
      return allParties.filter(p => p.type_id === draft.type_id);
    }
    
    if (draft?.sub_category_id || draft?.category_id) {
      const typeIds = filteredTypes.map(t => t.id);
      return allParties.filter(p => typeIds.includes(p.type_id));
    }
    
    return allParties;
  }, [isEditing, draft?.category_id, draft?.sub_category_id, draft?.type_id, filteredTypes, allParties]);

  // Draft update handlers with bi-directional sync
  const handleCategoryChange = (categoryId) => {
    const id = categoryId ? parseInt(categoryId) : null;
    setDraft(prev => ({
      ...prev,
      category_id: id,
      // Clear lower levels when category changes
      sub_category_id: null,
      type_id: null,
      party_id: null,
    }));
  };

  const handleSubCategoryChange = (subCategoryId) => {
    const id = subCategoryId ? parseInt(subCategoryId) : null;
    const subCategory = allSubCategories.find(sc => sc.id === id);
    
    setDraft(prev => ({
      ...prev,
      // Sync upward
      category_id: subCategory?.category_id || prev.category_id,
      sub_category_id: id,
      // Clear lower levels
      type_id: null,
      party_id: null,
    }));
  };

  const handleTypeChange = (typeId) => {
    const id = typeId ? parseInt(typeId) : null;
    const type = allTypes.find(t => t.id === id);
    const subCategory = type ? allSubCategories.find(sc => sc.id === type.sub_category_id) : null;
    
    setDraft(prev => ({
      ...prev,
      // Sync upward
      category_id: subCategory?.category_id || prev.category_id,
      sub_category_id: type?.sub_category_id || prev.sub_category_id,
      type_id: id,
      // Clear lower level
      party_id: null,
    }));
  };

  const handlePartyChange = (partyId) => {
    const id = partyId ? parseInt(partyId) : null;
    const party = allParties.find(p => p.id === id);
    const type = party ? allTypes.find(t => t.id === party.type_id) : null;
    const subCategory = type ? allSubCategories.find(sc => sc.id === type.sub_category_id) : null;
    
    setDraft(prev => ({
      ...prev,
      // Sync all higher levels
      category_id: subCategory?.category_id || prev.category_id,
      sub_category_id: type?.sub_category_id || prev.sub_category_id,
      type_id: party?.type_id || prev.type_id,
      party_id: id,
    }));
  };

  // Create handlers - these open the modal and provide a callback
  const handleCreateCategory = () => {
    onOpenCreateModal('category', null, '', (newCategory) => {
      if (newCategory?.id) {
        setDraft(prev => ({
          ...prev,
          category_id: newCategory.id,
          sub_category_id: null,
          type_id: null,
          party_id: null,
        }));
      }
    });
  };

  const handleCreateSubCategory = () => {
    const category = allCategories.find(c => c.id === draft?.category_id);
    if (!category) {
      setError('Please select a category first');
      return;
    }
    
    onOpenCreateModal('sub_category', category.id, category.category, (newSubCategory) => {
      if (newSubCategory?.id) {
        setDraft(prev => ({
          ...prev,
          sub_category_id: newSubCategory.id,
          type_id: null,
          party_id: null,
        }));
      }
    });
  };

  const handleCreateType = () => {
    const subCategory = allSubCategories.find(sc => sc.id === draft?.sub_category_id);
    if (!subCategory) {
      setError('Please select a sub-category first');
      return;
    }
    
    onOpenCreateModal('type', subCategory.id, subCategory.sub_category, (newType) => {
      if (newType?.id) {
        setDraft(prev => ({
          ...prev,
          type_id: newType.id,
          party_id: null,
        }));
      }
    });
  };

  const handleCreateParty = () => {
    const type = allTypes.find(t => t.id === draft?.type_id);
    if (!type) {
      setError('Please select a type first');
      return;
    }
    
    onOpenCreateModal('party', type.id, type.type, (newParty) => {
      if (newParty?.id) {
        setDraft(prev => ({
          ...prev,
          party_id: newParty.id,
        }));
      }
    });
  };

  // Get display values
  const getDisplayValue = (list, id, labelKey) => {
    if (!id) return '-';
    const item = list.find(i => i.id === id);
    return item ? item[labelKey] : '-';
  };

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

  const renderCheckboxCell = (value) => (
    <span className={`check-indicator ${value ? 'checked' : ''}`}>
      {value ? '✓' : ''}
    </span>
  );

  return (
    <tr className={`transaction-row ${isEditing ? 'editing' : ''} ${isSelected ? 'selected' : ''} ${error ? 'has-error' : ''}`}>
      {/* Selection checkbox */}
      <td className="select-cell">
        <Checkbox checked={isSelected} onChange={onSelectionChange} disabled={isEditing} />
      </td>
      
      {/* Description - read only */}
      <td className="description-cell" title={transaction.description}>
        {transaction.description}
      </td>
      
      {/* Cleaned Description */}
      <td className="cleaned-description-cell">
        {isEditing ? (
          <input
            type="text"
            className="edit-input"
            value={draft.cleaned_description}
            onChange={(e) => setDraft(prev => ({ ...prev, cleaned_description: e.target.value }))}
            placeholder="Cleaned description"
          />
        ) : (
          renderViewCell(transaction.cleaned_description)
        )}
      </td>
      
      {/* Date - read only */}
      <td className="date-cell">
        {formatDate(transaction.transaction_date)}
      </td>
      
      {/* Amount - read only */}
      <td className="amount-cell">
        {formatAmount(transaction.amount)}
      </td>
      
      {/* Is Credit / Lodgment */}
      <td className="lodgment-cell">
        {isEditing ? (
          <Checkbox
            checked={draft.is_credit}
            onChange={(value) => setDraft(prev => ({ ...prev, is_credit: value }))}
          />
        ) : (
          renderCheckboxCell(transaction.is_credit)
        )}
      </td>
      
      {/* Account - read only */}
      <td className="account-cell">
        {transaction.account_name || '-'}
      </td>
      
      {/* Party */}
      <td className="party-cell">
        {isEditing ? (
          <DropdownWithCreate
            value={draft.party_id}
            onChange={handlePartyChange}
            options={filteredParties}
            valueKey="id"
            labelKey="name"
            includeEmpty={true}
            emptyLabel="-"
            placeholder="Select party"
            onCreateNew={draft.type_id ? handleCreateParty : null}
            createLabel="➕ Create New Party..."
          />
        ) : (
          renderViewCell(transaction.party_name)
        )}
      </td>
      
      {/* Type */}
      <td className="type-cell">
        {isEditing ? (
          <DropdownWithCreate
            value={draft.type_id}
            onChange={handleTypeChange}
            options={filteredTypes}
            valueKey="id"
            labelKey="type"
            includeEmpty={true}
            emptyLabel="-"
            placeholder="Select type"
            onCreateNew={draft.sub_category_id ? handleCreateType : null}
            createLabel="➕ Create New Type..."
          />
        ) : (
          renderViewCell(transaction.type_name)
        )}
      </td>
      
      {/* Sub-Category */}
      <td className="sub-category-cell">
        {isEditing ? (
          <DropdownWithCreate
            value={draft.sub_category_id}
            onChange={handleSubCategoryChange}
            options={filteredSubCategories}
            valueKey="id"
            labelKey="sub_category"
            includeEmpty={true}
            emptyLabel="-"
            placeholder="Select sub-category"
            onCreateNew={draft.category_id ? handleCreateSubCategory : null}
            createLabel="➕ Create New Sub-Category..."
          />
        ) : (
          renderViewCell(transaction.sub_category_name)
        )}
      </td>
      
      {/* Category */}
      <td className="category-cell">
        {isEditing ? (
          <DropdownWithCreate
            value={draft.category_id}
            onChange={handleCategoryChange}
            options={allCategories}
            valueKey="id"
            labelKey="category"
            includeEmpty={true}
            emptyLabel="-"
            placeholder="Select category"
            onCreateNew={handleCreateCategory}
            createLabel="➕ Create New Category..."
          />
        ) : (
          renderViewCell(transaction.category_name)
        )}
      </td>
      
      {/* Is Kids */}
      <td className="kids-cell">
        {isEditing ? (
          <Checkbox
            checked={draft.is_kids}
            onChange={(value) => setDraft(prev => ({ ...prev, is_kids: value }))}
          />
        ) : (
          renderCheckboxCell(transaction.is_kids)
        )}
      </td>
      
      {/* Is One-Off */}
      <td className="one-off-cell">
        {isEditing ? (
          <Checkbox
            checked={draft.is_one_off}
            onChange={(value) => setDraft(prev => ({ ...prev, is_one_off: value }))}
          />
        ) : (
          renderCheckboxCell(transaction.is_one_off)
        )}
      </td>
      
      {/* Action buttons */}
      <td className="actions-cell">
        {error && <span className="row-error" title={error}>⚠</span>}
        
        {isEditing ? (
          <div className="edit-actions">
            <button 
              onClick={saveChanges} 
              disabled={isSaving}
              className="btn-save"
              title="Save changes"
            >
              {isSaving ? '...' : '✓'}
            </button>
            <button 
              onClick={cancelEditing} 
              disabled={isSaving}
              className="btn-cancel"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        ) : (
          <button 
            onClick={startEditing}
            className="btn-edit"
            title="Edit transaction"
          >
            ✎
          </button>
        )}
      </td>
    </tr>
  );
}