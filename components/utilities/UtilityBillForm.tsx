'use client'

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { householdsApi } from '@/lib/api';
import { AddSquareIcon } from '../shared/AddSquareIcon';
import type { UtilityBill } from '../UtilitiesView';

interface UtilityBillFormProps {
  bill: UtilityBill | null;
  onSave: (data: Partial<UtilityBill>) => void;
  onCancel: () => void;
}

export function UtilityBillForm({ bill, onSave, onCancel }: UtilityBillFormProps) {
  const [formData, setFormData] = useState({
    householdId: bill?.householdId || '',
    unit: bill?.unit || '',
    ownerName: bill?.ownerName || '',
    month: bill?.month || '',
    type: bill?.type || 'electricity',
    electricityUsage: bill?.electricityUsage?.toString() || '',
    electricityRate: '0.15', // $0.15 per kWh
    waterUsage: bill?.waterUsage?.toString() || '',
    waterRate: '1.5', // $1.5 per m³
    internetCost: bill?.internetCost?.toString() || '30',
    status: bill?.status || 'pending',
    phone: bill?.phone || '',
  });

  const [households, setHouseholds] = useState<{ id: string; unit: string; ownerName: string; phone: string }[]>([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isHouseholdOpen, setIsHouseholdOpen] = useState(false);
  const householdRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [calculatedCosts, setCalculatedCosts] = useState({
    electricityCost: 0,
    waterCost: 0,
    totalCost: 0,
  });

  // Load households for selection
  useEffect(() => {
    const loadHouseholds = async () => {
      try {
        const data = await householdsApi.getAll();
        setHouseholds(data);

        // Auto-fill basic info when editing
        if (bill && bill.householdId) {
          const matched = data.find((h: any) => h.id === bill.householdId);
          if (matched) {
            setFormData(prev => ({
              ...prev,
              householdId: matched.id,
              unit: matched.unit,
              ownerName: matched.ownerName,
              phone: matched.phone,
            }));
          }
        }
      } catch (error) {
        toast.error('Failed to load households');
      }
    };

    loadHouseholds();
  }, [bill]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (householdRef.current && !householdRef.current.contains(event.target as Node)) {
        setIsHouseholdOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
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
    if (!validateForm()) return;

    onSave({
      householdId: formData.householdId,
      type: formData.type as UtilityBill['type'],
      ...formData,
      electricityUsage,
      electricityCost: calculatedCosts.electricityCost,
      waterUsage,
      waterCost: calculatedCosts.waterCost,
      internetCost: parseFloat(formData.internetCost),
      totalCost: calculatedCosts.totalCost,
    });
    toast.success(bill ? 'Bill updated successfully' : 'Bill added successfully');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

  const typeOptions = [
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water' },
    { value: 'internet', label: 'Internet' },
  ];

  const selectedHousehold = households.find(h => h.id === formData.householdId);

  const handleHouseholdSelect = (id: string) => {
    const match = households.find(h => h.id === id);
    setFormData(prev => ({
      ...prev,
      householdId: id,
      unit: match?.unit || '',
      ownerName: match?.ownerName || '',
      phone: match?.phone || '',
    }));
    setIsHouseholdOpen(false);
    if (errors.householdId) {
      setErrors(prev => ({ ...prev, householdId: '' }));
    }
  };

  const getTypeLabel = () => typeOptions.find(t => t.value === formData.type)?.label || 'Select type';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.householdId) {
      newErrors.householdId = 'Household is required';
    }

    if (!formData.month.trim()) {
      newErrors.month = 'Billing period is required';
    }

    const electricityUsage = parseFloat(formData.electricityUsage) || 0;
    const waterUsage = parseFloat(formData.waterUsage) || 0;
    const internetCost = parseFloat(formData.internetCost) || 0;

    if (formData.type === 'electricity' && electricityUsage <= 0) {
      newErrors.electricityUsage = 'Enter electricity usage';
    }
    if (formData.type === 'water' && waterUsage <= 0) {
      newErrors.waterUsage = 'Enter water usage';
    }
    if (formData.type === 'internet' && internetCost <= 0) {
      newErrors.internetCost = 'Enter internet cost';
    }

    if (calculatedCosts.totalCost <= 0 || (!electricityUsage && !waterUsage && !internetCost)) {
      newErrors.total = 'Add at least one utility amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Billing & Household */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light">
            <h3 className="font-semibold text-text-primary text-lg mb-6">Billing Details</h3>
            
            <div className="space-y-5">
              {/* Household Selector */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Household *
                </label>
                <div className="relative" ref={householdRef}>
                  <button
                    type="button"
                    className={`input-default text-sm flex items-center justify-between ${errors.householdId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    onClick={() => setIsHouseholdOpen(!isHouseholdOpen)}
                  >
                    <div className="text-left">
                      <p className="text-text-primary font-medium leading-tight">
                        {selectedHousehold ? `${selectedHousehold.unit}` : 'Select household'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {selectedHousehold ? selectedHousehold.ownerName : 'Choose a unit to link this bill'}
                      </p>
                    </div>
                    <ChevronDown className={`size-4 text-text-secondary transition-transform ${isHouseholdOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isHouseholdOpen && (
                    <div className="absolute z-10 bg-bg-white border border-border-light rounded-lg shadow-lg w-full mt-1 overflow-hidden max-h-72 overflow-y-auto">
                      {households.map(h => (
                        <button
                          type="button"
                          key={h.id}
                          className={`w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors ${formData.householdId === h.id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'}`}
                          onClick={() => handleHouseholdSelect(h.id)}
                        >
                          <p className="leading-tight">{h.unit}</p>
                          <p className="text-xs text-text-secondary">{h.ownerName}</p>
                        </button>
                      ))}
                      {households.length === 0 && (
                        <div className="px-4 py-3 text-sm text-text-secondary">No households available</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.householdId && <p className="mt-0.5 text-sm text-red-500">{errors.householdId}</p>}
              </div>

              {/* Linked details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Owner</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    disabled
                    className="input-default text-sm bg-neutral-50"
                    placeholder="Select a household"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    disabled
                    className="input-default text-sm bg-neutral-50"
                    placeholder="Select a household"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Billing Period *
                </label>
                <input
                  type="text"
                  value={formData.month}
                  onChange={(e) => handleChange('month', e.target.value)}
                  className={`input-default text-sm ${errors.month ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="e.g., December 2025"
                  required
                />
                {errors.month && <p className="mt-0.5 text-sm text-red-500">{errors.month}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Bill Type *</label>
                <div className="relative" ref={typeRef}>
                  <button
                    type="button"
                    className="input-default text-sm flex items-center justify-between"
                    onClick={() => setIsTypeOpen(!isTypeOpen)}
                  >
                    <span className="text-text-primary">{getTypeLabel()}</span>
                    <ChevronDown className={`size-4 text-text-secondary transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isTypeOpen && (
                    <div className="absolute z-10 bg-bg-white border border-border-light rounded-lg shadow-lg w-full mt-1 overflow-hidden">
                      {typeOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-bg-hover transition-colors ${formData.type === option.value ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'}`}
                          onClick={() => {
                            handleChange('type', option.value);
                            setIsTypeOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

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
                      className={`input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${errors.electricityUsage ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                    {errors.electricityUsage && <p className="mt-0.5 text-xs text-red-500">{errors.electricityUsage}</p>}
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
                      className={`input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${errors.waterUsage ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                    {errors.waterUsage && <p className="mt-0.5 text-xs text-red-500">{errors.waterUsage}</p>}
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
                      className={`input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${errors.internetCost ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="30"
                    min="0"
                    step="0.01"
                    required
                  />
                    {errors.internetCost && <p className="mt-0.5 text-xs text-red-500">{errors.internetCost}</p>}
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
          {errors.total && <p className="mt-1 text-sm text-red-500">{errors.total}</p>}
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
