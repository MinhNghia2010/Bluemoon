'use client'

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { AddSquareIcon } from '../shared/AddSquareIcon';
import type { UtilityBill } from '../UtilitiesView';

interface UtilityBillFormProps {
  bill: UtilityBill | null;
  onSave: (data: Partial<UtilityBill>) => void;
  onCancel: () => void;
}

export function UtilityBillForm({ bill, onSave, onCancel }: UtilityBillFormProps) {
  const [formData, setFormData] = useState({
    unit: bill?.unit || '',
    ownerName: bill?.ownerName || '',
    month: bill?.month || '',
    electricityUsage: bill?.electricityUsage?.toString() || '',
    electricityRate: '0.15', // $0.15 per kWh
    waterUsage: bill?.waterUsage?.toString() || '',
    waterRate: '1.5', // $1.5 per m³
    internetCost: bill?.internetCost?.toString() || '30',
    status: bill?.status || 'pending',
    phone: bill?.phone || '',
  });

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const [calculatedCosts, setCalculatedCosts] = useState({
    electricityCost: 0,
    waterCost: 0,
    totalCost: 0,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-calculate costs when usage changes
  useEffect(() => {
    const electricityUsage = parseFloat(formData.electricityUsage) || 0;
    const electricityRate = parseFloat(formData.electricityRate) || 0;
    const waterUsage = parseFloat(formData.waterUsage) || 0;
    const waterRate = parseFloat(formData.waterRate) || 0;
    const internetCost = parseFloat(formData.internetCost) || 0;

    const electricityCost = electricityUsage * electricityRate;
    const waterCost = waterUsage * waterRate;
    const totalCost = electricityCost + waterCost + internetCost;

    setCalculatedCosts({
      electricityCost,
      waterCost,
      totalCost,
    });
  }, [formData.electricityUsage, formData.electricityRate, formData.waterUsage, formData.waterRate, formData.internetCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      electricityUsage: parseFloat(formData.electricityUsage),
      electricityCost: calculatedCosts.electricityCost,
      waterUsage: parseFloat(formData.waterUsage),
      waterCost: calculatedCosts.waterCost,
      internetCost: parseFloat(formData.internetCost),
      totalCost: calculatedCosts.totalCost,
    });
    toast.success(bill ? 'Bill updated successfully' : 'Bill added successfully');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-orange-500' },
    { value: 'paid', label: 'Paid', color: 'bg-green-500' },
    { value: 'overdue', label: 'Overdue', color: 'bg-red-500' },
  ];

  const getStatusLabel = () => {
    const status = statusOptions.find(s => s.value === formData.status);
    return status ? status.label : 'Select status';
  };

  const getStatusColor = () => {
    const status = statusOptions.find(s => s.value === formData.status);
    return status ? status.color : 'bg-gray-500';
  };

  const basicInfoFields = [
    { name: 'unit', label: 'Apartment Unit *', type: 'text', placeholder: 'e.g., A-101' },
    { name: 'ownerName', label: 'Owner Name *', type: 'text', placeholder: 'Enter owner name' },
    { name: 'phone', label: 'Phone Number *', type: 'tel', placeholder: 'e.g., 555-0101' },
    { name: 'month', label: 'Billing Period *', type: 'text', placeholder: 'e.g., December 2025' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-text-primary mb-2">
          {bill ? 'Edit Utility Bill' : 'Add New Utility Bill'}
        </h1>
        <p className="text-base text-text-secondary">
          {bill ? 'Update utility bill information' : 'Create a new utility bill record'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light">
            <h3 className="font-semibold text-text-primary text-lg mb-6">Basic Information</h3>
            
            <div className="space-y-5">
              {basicInfoFields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="input-default text-sm"
                    placeholder={field.placeholder}
                    required
                  />
                </div>
              ))}

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Payment Status *
                </label>
                <div className="relative" ref={statusRef}>
                  <button
                    type="button"
                    className="input-default text-sm flex items-center justify-between"
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`size-2.5 rounded-full ${getStatusColor()}`} />
                      <span className="text-text-primary">{getStatusLabel()}</span>
                    </div>
                    <ChevronDown className={`size-4 text-text-secondary transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isStatusOpen && (
                    <div className="absolute z-10 bg-bg-white border border-border-light rounded-lg shadow-lg w-full mt-1 overflow-hidden">
                      {statusOptions.map(status => (
                        <div
                          key={status.value}
                          className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm transition-colors flex items-center gap-3 ${
                            formData.status === status.value ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'
                          }`}
                          onClick={() => {
                            handleChange('status', status.value);
                            setIsStatusOpen(false);
                          }}
                        >
                          <div className={`size-2.5 rounded-full ${status.color}`} />
                          {status.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Usage & Costs */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light">
            <h3 className="font-semibold text-text-primary text-lg mb-6">Usage & Costs</h3>
            
            <div className="space-y-5">
              {/* Electricity */}
              <div className="pb-5 border-b border-border-light">
                <p className="font-medium text-text-primary text-sm mb-3">Electricity</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-text-secondary mb-2">
                      Usage (kWh) *
                    </label>
                    <input
                      type="number"
                      value={formData.electricityUsage}
                      onChange={(e) => handleChange('electricityUsage', e.target.value)}
                      className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-2">
                      Rate ($/kWh)
                    </label>
                    <input
                      type="number"
                      value={formData.electricityRate}
                      onChange={(e) => handleChange('electricityRate', e.target.value)}
                      className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="0.15"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-text-secondary">Calculated Cost</p>
                  <p className="font-semibold text-brand-primary">${calculatedCosts.electricityCost.toFixed(2)}</p>
                </div>
              </div>

              {/* Water */}
              <div className="pb-5 border-b border-border-light">
                <p className="font-medium text-text-primary text-sm mb-3">Water</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-text-secondary mb-2">
                      Usage (m³) *
                    </label>
                    <input
                      type="number"
                      value={formData.waterUsage}
                      onChange={(e) => handleChange('waterUsage', e.target.value)}
                      className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-2">
                      Rate ($/m³)
                    </label>
                    <input
                      type="number"
                      value={formData.waterRate}
                      onChange={(e) => handleChange('waterRate', e.target.value)}
                      className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="1.5"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-text-secondary">Calculated Cost</p>
                  <p className="font-semibold text-brand-primary">${calculatedCosts.waterCost.toFixed(2)}</p>
                </div>
              </div>

              {/* Internet */}
              <div>
                <p className="font-medium text-text-primary text-sm mb-3">Internet</p>
                <div>
                  <label className="block text-xs text-text-secondary mb-2">
                    Monthly Cost ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.internetCost}
                    onChange={(e) => handleChange('internetCost', e.target.value)}
                    className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="30"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary text-lg mb-1">Total Amount</h3>
              <p className="text-text-secondary text-sm">Combined utilities cost</p>
            </div>
            <p className="font-semibold text-brand-primary text-4xl">${calculatedCosts.totalCost.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
          >
            <div className="relative size-5">
              <AddSquareIcon className="relative size-5" />
            </div>
            {bill ? 'Update Bill' : 'Add Bill'}
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
