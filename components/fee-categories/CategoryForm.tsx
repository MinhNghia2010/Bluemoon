import { useState, useEffect, useRef } from 'react';
import { AddSquareIcon } from '../shared/AddSquareIcon';
import { ChevronDown } from 'lucide-react';
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
      <div className="card max-w-[800px] border border-neutral-200">
        <div className="space-y-6">
          {/* Category Name */}
          <div className="grid grid-cols-[200px,1fr] gap-6 items-start">
            <label className="text-sm font-medium text-text-primary pt-3">
              Category Name
            </label>
            <div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Maintenance Fee"
                className="input-default text-sm"
              />
              {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-[200px,1fr] gap-6 items-start">
            <label className="text-sm font-medium text-text-primary pt-3">
              Amount ($)
            </label>
            <div>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                onKeyDown={handleKeyDown}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              {errors.amount && <p className="text-xs text-error mt-1">{errors.amount}</p>}
            </div>
          </div>

          {/* Frequency */}
          <div className="grid grid-cols-[200px,1fr] gap-6 items-center">
            <label className="text-sm font-medium text-text-primary">
              Frequency
            </label>
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
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors"
                    onClick={() => handleFrequencySelect('monthly')}
                  >
                    Monthly
                  </div>
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors"
                    onClick={() => handleFrequencySelect('quarterly')}
                  >
                    Quarterly
                  </div>
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors"
                    onClick={() => handleFrequencySelect('annual')}
                  >
                    Annual
                  </div>
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors"
                    onClick={() => handleFrequencySelect('one-time')}
                  >
                    One-time
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-[200px,1fr] gap-6 items-start">
            <label className="text-sm font-medium text-text-primary pt-3">
              Description
            </label>
            <div>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter a detailed description"
                rows={4}
                className="input-default text-sm resize-none"
              />
              {errors.description && <p className="text-xs text-error mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Active Status */}
          <div className="grid grid-cols-[200px,1fr] gap-6 items-center">
            <label className="text-sm font-medium text-text-primary">
              Status
            </label>
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

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSubmit}
            className="btn-primary flex items-center gap-2"
          >
            <div className="relative size-5">
              <AddSquareIcon className="relative size-5" />
            </div>
            {isEditMode ? 'Update Category' : 'Add Category'}
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
