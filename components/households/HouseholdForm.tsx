'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

interface Household {
  id: string;
  unit: string;
  ownerName: string;
  residents: number;
  status: 'paid' | 'pending' | 'overdue';
  balance: number;
  phone: string;
  email: string;
}

interface HouseholdFormProps {
  household: Household | null;
  onSave: (data: Partial<Household>) => void;
  onCancel: () => void;
}

export function HouseholdForm({ household, onSave, onCancel }: HouseholdFormProps) {
  const [formData, setFormData] = useState({
    unit: '',
    ownerName: '',
    residents: 1,
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (household) {
      setFormData({
        unit: household.unit,
        ownerName: household.ownerName,
        residents: household.residents,
        phone: household.phone,
        email: household.email
      });
    }
  }, [household]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit number is required';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (formData.residents < 1) {
      newErrors.residents = 'At least 1 resident is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {household ? 'Edit Household' : 'Add Household'}
          </h1>
          <p className="text-sm text-text-secondary">
            {household ? 'Update household information' : 'Register a new household'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-bg-white rounded-2xl p-6 shadow-lg border border-border-light">
        <div className="space-y-6">
          {/* Unit Number */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Unit Number *
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g., A-101"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.unit ? 'border-red-500' : 'border-border-light'
              } bg-bg-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent`}
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-500">{errors.unit}</p>
            )}
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Owner Name *
            </label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Full name"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.ownerName ? 'border-red-500' : 'border-border-light'
              } bg-bg-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent`}
            />
            {errors.ownerName && (
              <p className="mt-1 text-sm text-red-500">{errors.ownerName}</p>
            )}
          </div>

          {/* Number of Residents */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Number of Residents *
            </label>
            <input
              type="number"
              name="residents"
              value={formData.residents}
              onChange={handleChange}
              min="1"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.residents ? 'border-red-500' : 'border-border-light'
              } bg-bg-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent`}
            />
            {errors.residents && (
              <p className="mt-1 text-sm text-red-500">{errors.residents}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., 123-456-7890"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.phone ? 'border-red-500' : 'border-border-light'
              } bg-bg-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., john@example.com"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-border-light'
              } bg-bg-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-border-light">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg border border-border-light text-text-secondary hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-primary text-white hover:bg-brand-secondary transition-colors"
          >
            <Save className="w-4 h-4" />
            {household ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}



