'use client'

import { useState, useEffect } from 'react';
import { Save, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { DatePickerInput } from '../shared/DatePickerInput';

interface Household {
  id: string;
  unit: string;
  ownerName: string;
  residents: number;
  area?: number | null;
  floor?: number | null;
  moveInDate?: string | null;
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
    area: '',
    floor: '',
    moveInDate: undefined as Date | undefined,
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (household) {
      setFormData({
        unit: household.unit,
        ownerName: household.ownerName,
        area: household.area?.toString() || '',
        floor: household.floor?.toString() || '',
        moveInDate: household.moveInDate ? new Date(household.moveInDate) : undefined,
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
      onSave({
        ...formData,
        area: formData.area ? parseFloat(formData.area) : null,
        floor: formData.floor ? parseInt(formData.floor) : null,
        moveInDate: formData.moveInDate ? format(formData.moveInDate, 'yyyy-MM-dd') : null
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-text-primary mb-2">
          {household ? 'Edit Household' : 'Add New Household'}
        </h1>
        <p className="text-base text-text-secondary">
          {household ? 'Update household information' : 'Register a new household'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Household Details */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light space-y-5">
            <h3 className="font-semibold text-text-primary text-lg">Household Details</h3>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Unit Number *</label>
              <div className="relative">
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g., 101"
                  className={`input-default text-sm pr-10 ${formData.unit.trim().length > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.unit ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formData.unit.trim().length > 0 && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {formData.unit.trim().length === 0 && errors.unit && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {errors.unit && (
                <p className="mt-0.5 text-sm text-red-500">{errors.unit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Owner Name *</label>
              <div className="relative">
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={`input-default text-sm pr-10 ${formData.ownerName.trim().length >= 2 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.ownerName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {formData.ownerName.trim().length >= 2 && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {formData.ownerName.trim().length < 2 && errors.ownerName && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {errors.ownerName && (
                <p className="mt-0.5 text-sm text-red-500">{errors.ownerName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Area (m²)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g., 70"
                    className={`input-default text-sm pr-10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${formData.area && parseFloat(formData.area) > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                  />
                  {formData.area && parseFloat(formData.area) > 0 && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Floor</label>
                <div className="relative">
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    placeholder="e.g., 1"
                    min="1"
                    className={`input-default text-sm pr-10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${formData.floor && parseInt(formData.floor) > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                  />
                  {formData.floor && parseInt(formData.floor) > 0 && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Move-in Date</label>
              <DatePickerInput
                value={formData.moveInDate}
                onChange={(date) => setFormData(prev => ({ ...prev, moveInDate: date }))}
                placeholder="dd/mm/yyyy"
                showValidation={true}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light space-y-5">
            <h3 className="font-semibold text-text-primary text-lg">Contact</h3>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Phone Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, phone: value }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="e.g., 0912345678"
                  className={`input-default text-sm pr-16 ${formData.phone.length >= 10 && formData.phone.length <= 11 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className={`text-xs ${formData.phone.length >= 10 && formData.phone.length <= 11 ? 'text-green-500' : 'text-text-muted'}`}>
                    {formData.phone.length}/10-11
                  </span>
                  {formData.phone.length >= 10 && formData.phone.length <= 11 && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {formData.phone.length > 0 && (formData.phone.length < 10 || formData.phone.length > 11) && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {errors.phone && (
                <p className="mt-0.5 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., john@example.com"
                  className={`input-default text-sm pr-10 ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {formData.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {errors.email && (
                <p className="mt-0.5 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {household ? 'Update Household' : 'Add Household'}
          </button>
        </div>
      </form>
    </div>
  );
}



