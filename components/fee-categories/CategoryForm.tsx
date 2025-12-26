import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  description: string;
  active: boolean;
}

interface CategoryFormProps {
  category: FeeCategory | null;
  onSave: (data: Partial<FeeCategory>) => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const isEditMode = !!category;
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as 'monthly' | 'quarterly' | 'annual' | 'one-time',
    description: '',
    active: true
  });

  const [errors, setErrors] = useState({
    name: '',
    amount: '',
    description: ''
  });

  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        amount: category.amount.toString(),
        frequency: category.frequency,
        description: category.description,
        active: category.active
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        amount: '',
        frequency: 'monthly',
        description: '',
        active: true
      });
    }
  }, [category]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFrequencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    // Prevent negative amounts
    if (field === 'amount' && typeof value === 'string') {
      const numValue = parseFloat(value);
      if (numValue < 0 || value === '-') {
        return; // Don't update if negative
      }
    }
    
    // Clear error when user starts typing
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFrequencySelect = (frequency: string) => {
    handleInputChange('frequency', frequency);
    setIsFrequencyOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'annual': 'Annual',
      'one-time': 'One-time'
    };
    return labels[frequency] || frequency;
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      amount: '',
      description: ''
    };

    let isValid = true;

    // Validate category name
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
      isValid = false;
    }

    // Validate amount
    if (!formData.amount || formData.amount === '') {
      newErrors.amount = 'Amount is required';
      isValid = false;
    } else {
      const numAmount = parseFloat(formData.amount);
      if (isNaN(numAmount)) {
        newErrors.amount = 'Please enter a valid amount';
        isValid = false;
      } else if (numAmount < 0) {
        newErrors.amount = 'Amount must not be negative';
        isValid = false;
      } else if (numAmount === 0) {
        newErrors.amount = 'Amount must be greater than 0';
        isValid = false;
      }
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    onSave(submitData);
    
    // Show success toast
    if (isEditMode) {
      toast.success('Category updated successfully!');
    } else {
      toast.success('Category added successfully!');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-text-primary mb-2">
          {isEditMode ? 'Edit Fee Category' : 'Add New Fee Category'}
        </h1>
        <p className="text-base text-text-secondary">
          {isEditMode ? 'Update category information' : 'Create a new fee category'}
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Basics */}
        <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light space-y-5">
          <h3 className="font-semibold text-text-primary text-lg">Category Details</h3>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">Category Name</label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Maintenance Fee"
                className={`input-default text-sm pr-10 ${formData.name.trim().length > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {formData.name.trim().length > 0 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {formData.name.trim().length === 0 && errors.name && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.name && <p className="text-xs text-error mt-0.5">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">Amount ($)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                onKeyDown={handleKeyDown}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`input-default text-sm pr-10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${formData.amount && parseFloat(formData.amount) > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {formData.amount && parseFloat(formData.amount) > 0 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {formData.amount && parseFloat(formData.amount) <= 0 && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.amount && <p className="text-xs text-error mt-0.5">{errors.amount}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">Frequency</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="input-default text-sm flex items-center justify-between"
                onClick={() => setIsFrequencyOpen(!isFrequencyOpen)}
              >
                {getFrequencyLabel(formData.frequency)}
                <ChevronDown className={`size-4 text-text-secondary transition-transform ${isFrequencyOpen ? 'rotate-180' : ''}`} />
              </button>
              {isFrequencyOpen && (
                <div className="absolute z-10 bg-bg-white border border-border-default rounded-sm shadow-lg w-full mt-1 overflow-hidden">
                  <div className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors" onClick={() => handleFrequencySelect('monthly')}>
                    Monthly
                  </div>
                  <div className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors" onClick={() => handleFrequencySelect('quarterly')}>
                    Quarterly
                  </div>
                  <div className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors" onClick={() => handleFrequencySelect('annual')}>
                    Annual
                  </div>
                  <div className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors" onClick={() => handleFrequencySelect('one-time')}>
                    One-time
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description / Status */}
        <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light space-y-5">
          <h3 className="font-semibold text-text-primary text-lg">Additional Info</h3>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">Description</label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter a detailed description"
                rows={5}
                className={`input-default text-sm resize-none pr-10 ${formData.description.trim().length > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {formData.description.trim().length > 0 && (
                <Check className="absolute right-3 top-3 w-4 h-4 text-green-500" />
              )}
              {formData.description.trim().length === 0 && errors.description && (
                <X className="absolute right-3 top-3 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.description && <p className="text-xs text-error mt-0.5">{errors.description}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">Status</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="size-4 rounded text-brand-primary focus:ring-2 focus:ring-brand-primary cursor-pointer"
              />
              <span className="text-sm text-text-primary">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {isEditMode ? 'Update Category' : 'Add Category'}
        </button>
      </div>
    </div>
  );
}
