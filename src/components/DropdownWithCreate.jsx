import Dropdown from './Dropdown';
import './DropdownWithCreate.css';

export default function DropdownWithCreate({
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = 'Select...',
  valueKey = 'id',
  labelKey = 'name',
  includeEmpty = false,
  emptyLabel = 'Please Select',
  onCreateNew = null,
  createLabel = 'Create New...'
}) {
  const handleDropdownChange = (newValue) => {
    console.log('DropdownWithCreate: handleDropdownChange called with:', newValue);
    
    if (newValue === '__CREATE_NEW__') {
      console.log('DropdownWithCreate: Create new selected');
      if (onCreateNew) {
        onCreateNew();
      }
    } else {
      onChange(newValue);
    }
  };

  // Add create option to the list
  const optionsWithCreate = onCreateNew ? [
    ...options,
    { [valueKey]: '__CREATE_NEW__', [labelKey]: createLabel }
  ] : options;

  return (
    <div className="dropdown-with-create">
      <Dropdown
        value={value}
        onChange={handleDropdownChange}
        options={optionsWithCreate}
        disabled={disabled && !onCreateNew} // Only disable if no create option
        placeholder={placeholder}
        valueKey={valueKey}
        labelKey={labelKey}
        includeEmpty={includeEmpty}
        emptyLabel={emptyLabel}
      />
    </div>
  );
}