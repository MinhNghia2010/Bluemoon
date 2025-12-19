'use client'

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

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
    moveInDate: '',
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
        moveInDate: household.moveInDate ? new Date(household.moveInDate).toISOString().split('T')[0] : '',
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
        moveInDate: formData.moveInDate || null
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
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., 101"
                className={`input-default text-sm ${errors.unit ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.unit && (
                <p className="mt-0.5 text-sm text-red-500">{errors.unit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Owner Name *</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Full name"
                className={`input-default text-sm ${errors.ownerName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.ownerName && (
                <p className="mt-0.5 text-sm text-red-500">{errors.ownerName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Area (m²)</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., 70"
                  className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Floor</label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="e.g., 1"
                  min="1"
                  className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Move-in Date</label>
              <input
                type="date"
                name="moveInDate"
                value={formData.moveInDate}
                onChange={handleChange}
                className="input-default text-sm"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light space-y-5">
            <h3 className="font-semibold text-text-primary text-lg">Contact</h3>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., 123-456-7890"
                className={`input-default text-sm ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.phone && (
                <p className="mt-0.5 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., john@example.com"
                className={`input-default text-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.email && (
                <p className="mt-0.5 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {household ? 'Update Household' : 'Add Household'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}



