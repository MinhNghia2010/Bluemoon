'use client'

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, X, Users, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { AddSquareIcon } from '../shared/AddSquareIcon';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { householdsApi, feeCategoriesApi } from '@/lib/api';
import { toast } from 'sonner';

interface Payment {
  id?: string;
  householdId: string;
  feeCategoryId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'collected' | 'overdue';
  paymentMethod?: string;
  notes?: string;
}

interface PaymentFormProps {
  payment?: Payment | null;
  onSave: (data: Partial<Payment>) => void;
  onBulkSave?: (data: Partial<Payment>[]) => void;
  onCancel: () => void;
}

interface Household {
  id: string;
  unit: string;
  ownerName: string;
  status: string;
}

interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

interface FeeItem {
  id: string;
  feeCategoryId: string;
  amount: number;
}

export function PaymentForm({ payment, onSave, onBulkSave, onCancel }: PaymentFormProps) {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Dropdown states
  const [isHouseholdOpen, setIsHouseholdOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);

  const householdRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const bulkStatusRef = useRef<HTMLDivElement>(null);

  // Single payment form data
  const [formData, setFormData] = useState({
    householdId: payment?.householdId || '',
    feeCategoryId: payment?.feeCategoryId || '',
    amount: payment?.amount || 0,
    dueDate: payment?.dueDate || new Date().toISOString().split('T')[0],
    status: payment?.status || 'pending' as const,
    paymentMethod: payment?.paymentMethod || '',
    notes: payment?.notes || ''
  });

  // Bulk payment form data
  const [bulkData, setBulkData] = useState({
    selectedHouseholds: [] as string[],
    selectAll: false,
    fees: [{ id: '1', feeCategoryId: '', amount: 0 }] as FeeItem[],
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending' as const
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [householdsData, categoriesData] = await Promise.all([
          householdsApi.getAll(),
          feeCategoriesApi.getAll()
        ]);
        setHouseholds(householdsData.filter((h: Household) => h.status === 'active'));
        setCategories(categoriesData);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (householdRef.current && !householdRef.current.contains(event.target as Node)) {
        setIsHouseholdOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (paymentMethodRef.current && !paymentMethodRef.current.contains(event.target as Node)) {
        setIsPaymentMethodOpen(false);
      }
      if (bulkStatusRef.current && !bulkStatusRef.current.contains(event.target as Node)) {
        setIsBulkStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-fill amount when category changes (single mode)
  useEffect(() => {
    if (formData.feeCategoryId && !payment) {
      const category = categories.find(c => c.id === formData.feeCategoryId);
      if (category) {
        setFormData(prev => ({ ...prev, amount: category.amount }));
      }
    }
  }, [formData.feeCategoryId, categories, payment]);

  // Handle select all households
  useEffect(() => {
    if (bulkData.selectAll) {
      setBulkData(prev => ({
        ...prev,
        selectedHouseholds: households.map(h => h.id)
      }));
    }
  }, [bulkData.selectAll, households]);

  const handleSubmit = async () => {
    if (mode === 'single') {
      if (!formData.householdId || !formData.feeCategoryId) {
        toast.error('Please select a household and fee category');
        return;
      }
      if (formData.amount <= 0) {
        toast.error('Amount must be greater than 0');
        return;
      }
      setIsSaving(true);
      try {
        await onSave(formData);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Bulk mode
      if (bulkData.selectedHouseholds.length === 0) {
        toast.error('Please select at least one household');
        return;
      }
      const validFees = bulkData.fees.filter(f => f.feeCategoryId && f.amount > 0);
      if (validFees.length === 0) {
        toast.error('Please add at least one fee category');
        return;
      }

      setIsSaving(true);
      try {
        const payments: Partial<Payment>[] = [];
        for (const householdId of bulkData.selectedHouseholds) {
          for (const fee of validFees) {
            payments.push({
              householdId,
              feeCategoryId: fee.feeCategoryId,
              amount: fee.amount,
              dueDate: bulkData.dueDate,
              status: bulkData.status
            });
          }
        }

        if (onBulkSave) {
          await onBulkSave(payments);
        } else {
          for (const payment of payments) {
            await onSave(payment);
          }
        }
        toast.success(`Created ${payments.length} payment records`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addFeeItem = () => {
    setBulkData(prev => ({
      ...prev,
      fees: [...prev.fees, { id: Date.now().toString(), feeCategoryId: '', amount: 0 }]
    }));
  };

  const removeFeeItem = (id: string) => {
    if (bulkData.fees.length > 1) {
      setBulkData(prev => ({
        ...prev,
        fees: prev.fees.filter(f => f.id !== id)
      }));
    }
  };

  const updateFeeItem = (id: string, field: 'feeCategoryId' | 'amount', value: string | number) => {
    setBulkData(prev => ({
      ...prev,
      fees: prev.fees.map(fee => {
        if (fee.id !== id) return fee;

        if (field === 'feeCategoryId') {
          const categoryId = value as string;
          const category = categories.find(c => c.id === categoryId);
          return {
            ...fee,
            feeCategoryId: categoryId,
            amount: category?.amount ?? 0
          };
        }

        const numericAmount = typeof value === 'number' ? value : Number(value) || 0;
        return { ...fee, amount: numericAmount };
      })
    }));
  };

  const toggleHousehold = (id: string) => {
    setBulkData(prev => ({
      ...prev,
      selectAll: false,
      selectedHouseholds: prev.selectedHouseholds.includes(id)
        ? prev.selectedHouseholds.filter(h => h !== id)
        : [...prev.selectedHouseholds, id]
    }));
  };

  const getHouseholdLabel = (id: string) => {
    const household = households.find(h => h.id === id);
    return household ? `${household.unit} - ${household.ownerName}` : 'Select a household';
  };

  const getCategoryLabel = (id: string) => {
    const category = categories.find(c => c.id === id);
    return category ? `${category.name} - ${formatCurrency(category.amount)}` : 'Select a fee category';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'pending': 'Pending',
      'collected': 'Collected',
      'overdue': 'Overdue'
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      '': 'Select method',
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer',
      'card': 'Card',
      'online': 'Online Payment'
    };
    return labels[method] || method;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const bulkTotal = bulkData.selectedHouseholds.length * 
    bulkData.fees.filter(f => f.feeCategoryId).reduce((sum, f) => sum + f.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-text-primary mb-2">
            {payment ? 'Edit Payment' : 'Record New Payment'}
          </h1>
        <p className="text-base text-text-secondary">
            {payment ? 'Update payment details' : 'Create payment records for households'}
          </p>
      </div>

      {/* Mode Toggle (only for new payments) */}
      {!payment && (
        <div className="flex gap-3 mb-8">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-5 py-2.5 rounded-md font-medium text-sm transition-colors ${
              mode === 'single' 
                ? 'bg-brand-primary text-white' 
                : 'bg-neutral-100 text-text-secondary hover:bg-neutral-200'
            }`}
          >
            Single Payment
          </button>
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`px-5 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center gap-2 ${
              mode === 'bulk' 
                ? 'bg-brand-primary text-white' 
                : 'bg-neutral-100 text-text-secondary hover:bg-neutral-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Multiple Payments
          </button>
        </div>
      )}

      {/* Form */}
      <div className="max-w-[1100px]">
        <div className="space-y-6">
          {mode === 'single' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-bg-white rounded-2xl p-8 shadow-lg border border-border-light space-y-5">
                <h3 className="font-semibold text-text-primary text-lg">Household & Fee</h3>

                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Household *</label>
                  <div className="relative" ref={householdRef}>
                    <button
                      type="button"
                      className="input-default text-sm flex items-center justify-between"
                      onClick={() => setIsHouseholdOpen(!isHouseholdOpen)}
                    >
                      <span className={formData.householdId ? 'text-text-primary' : 'text-text-secondary'}>
                        {getHouseholdLabel(formData.householdId)}
                      </span>
                      <ChevronDown className={`size-4 text-text-secondary transition-transform ${isHouseholdOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isHouseholdOpen && (
                      <div className="absolute z-10 bg-bg-white border border-border-default rounded-lg shadow-lg w-full mt-1 max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {households.map(h => (
                          <button
                            key={h.id}
                            type="button"
                            className={`w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors ${formData.householdId === h.id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, householdId: h.id }));
                              setIsHouseholdOpen(false);
                            }}
                          >
                            <p className="leading-tight">{h.unit}</p>
                            <p className="text-xs text-text-secondary">{h.ownerName}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Fee Category *</label>
                  <div className="relative" ref={categoryRef}>
                    <button
                      type="button"
                      className="input-default text-sm flex items-center justify-between"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                      <span className={formData.feeCategoryId ? 'text-text-primary' : 'text-text-secondary'}>
                        {formData.feeCategoryId ? getCategoryLabel(formData.feeCategoryId) : 'Select a category'}
                      </span>
                      <ChevronDown className={`size-4 text-text-secondary transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isCategoryOpen && (
                      <div className="absolute z-10 bg-bg-white border border-border-default rounded-lg shadow-lg w-full mt-1 max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {categories.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            className={`w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors ${formData.feeCategoryId === c.id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, feeCategoryId: c.id, amount: payment ? prev.amount : c.amount }));
                              setIsCategoryOpen(false);
                            }}
                          >
                            <p className="leading-tight">{c.name}</p>
                            <p className="text-xs text-text-secondary">{c.frequency}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Amount ($) *</label>
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="1"
                    placeholder="0"
                    className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <p className="text-xs text-text-secondary mt-1">{formatCurrency(formData.amount)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Due Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="input-default text-sm flex items-center justify-between"
                      >
                        <span className="text-text-primary">
                          {formData.dueDate ? format(new Date(formData.dueDate), 'PPP') : 'Pick a date'}
                        </span>
                        <CalendarIcon className="size-4 text-text-secondary" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-bg-white" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                        onSelect={(date) => setFormData(prev => ({ 
                          ...prev, 
                          dueDate: date ? format(date, 'yyyy-MM-dd') : prev.dueDate 
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="bg-bg-white rounded-2xl p-8 shadow-lg border border-border-light space-y-5">
                <h3 className="font-semibold text-text-primary text-lg">Status & Notes</h3>

                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Status</label>
                  <div className="relative" ref={statusRef}>
                    <button
                      type="button"
                      className="input-default text-sm flex items-center justify-between"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                    >
                      {getStatusLabel(formData.status)}
                      <ChevronDown className={`size-4 text-text-secondary transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isStatusOpen && (
                      <div className="absolute z-10 bg-bg-white border border-border-default rounded-lg shadow-lg w-full mt-1 overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {['pending', 'collected', 'overdue'].map(status => (
                          <div
                            key={status}
                            className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, status: status as any }));
                              setIsStatusOpen(false);
                            }}
                          >
                            {getStatusLabel(status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {formData.status === 'collected' && (
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-2 block">Payment Method</label>
                    <div className="relative" ref={paymentMethodRef}>
                      <button
                        type="button"
                        className="input-default text-sm flex items-center justify-between"
                        onClick={() => setIsPaymentMethodOpen(!isPaymentMethodOpen)}
                      >
                        <span className={formData.paymentMethod ? 'text-text-primary' : 'text-text-secondary'}>
                          {getPaymentMethodLabel(formData.paymentMethod)}
                        </span>
                        <ChevronDown className={`size-4 text-text-secondary transition-transform ${isPaymentMethodOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isPaymentMethodOpen && (
                        <div className="absolute z-10 bg-bg-white border border-border-default rounded-lg shadow-lg w-full mt-1 overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          {['cash', 'bank_transfer', 'card', 'online'].map(method => (
                            <div
                              key={method}
                              className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, paymentMethod: method }));
                                setIsPaymentMethodOpen(false);
                              }}
                            >
                              {getPaymentMethodLabel(method)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes..."
                    rows={6}
                    className="input-default text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Bulk Payment Form */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-bg-white rounded-2xl p-8 shadow-lg border border-border-light space-y-5 h-full flex flex-col">
                <h3 className="font-semibold text-text-primary text-lg">Households</h3>
                <div className="border border-border-light rounded-lg bg-bg-white overflow-hidden">
                  <label className="flex items-center gap-3 px-4 py-3 bg-bg-hover border-b border-border-light cursor-pointer hover:bg-bg-page transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={bulkData.selectAll}
                        onChange={(e) => setBulkData(prev => ({ 
                          ...prev, 
                          selectAll: e.target.checked,
                          selectedHouseholds: e.target.checked ? households.map(h => h.id) : []
                        }))}
                        className="peer sr-only"
                      />
                      <div className="size-5 rounded border-2 border-border-light bg-bg-white peer-checked:bg-brand-primary peer-checked:border-brand-primary transition-colors flex items-center justify-center">
                        <svg className="size-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="font-medium text-sm text-text-primary">Select All ({households.length})</span>
                  </label>

                  <div className="max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="p-2 space-y-1">
                      {households.map(h => (
                        <label 
                          key={h.id} 
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                            bulkData.selectedHouseholds.includes(h.id) 
                              ? 'bg-brand-primary/10 border border-brand-primary/20' 
                              : 'hover:bg-bg-hover border border-transparent'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <input
                              type="checkbox"
                              checked={bulkData.selectedHouseholds.includes(h.id)}
                              onChange={() => toggleHousehold(h.id)}
                              className="peer sr-only"
                            />
                            <div className={`size-5 rounded border-2 transition-colors flex items-center justify-center ${
                              bulkData.selectedHouseholds.includes(h.id) 
                                ? 'bg-brand-primary border-brand-primary' 
                                : 'border-border-light bg-bg-white'
                            }`}>
                              {bulkData.selectedHouseholds.includes(h.id) && (
                                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-text-primary">{h.unit}</span>
                            <span className="text-sm text-text-secondary ml-2">- {h.ownerName}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-text-secondary">
                  <span className="font-medium text-brand-primary">{bulkData.selectedHouseholds.length}</span> of {households.length} households selected
                </p>
              </div>

              <div className="bg-bg-white rounded-2xl p-8 shadow-lg border border-border-light space-y-5 h-full flex flex-col">
                <h3 className="font-semibold text-text-primary text-lg">Fees & Details</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">Fee Categories *</span>
                    <button
                      type="button"
                      onClick={addFeeItem}
                      className="text-sm font-medium text-brand-primary hover:text-brand-primary/80 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <div className="border border-border-light rounded-lg bg-bg-white overflow-hidden">
                    <div className="divide-y divide-border-light">
                      {bulkData.fees.map((fee) => {
                        const selectedCategory = categories.find(c => c.id === fee.feeCategoryId);
                        return (
                          <div key={fee.id} className="p-3 flex gap-3 items-center hover:bg-bg-hover/50 transition-colors">
                            <div className="flex-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="w-full input-default text-sm flex items-center justify-between"
                                  >
                                    <span className={selectedCategory ? 'text-text-primary' : 'text-text-secondary'}>
                                      {selectedCategory ? `${selectedCategory.name} - ${formatCurrency(selectedCategory.amount)}` : 'Select a fee category'}
                                    </span>
                                    <ChevronDown className="size-4 text-text-secondary" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[320px] p-0 bg-bg-white" align="start">
                                  <div className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {categories.map(c => (
                                      <div
                                        key={c.id}
                                        className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm transition-colors ${
                                          fee.feeCategoryId === c.id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'
                                        }`}
                                        onClick={() => updateFeeItem(fee.id, 'feeCategoryId', c.id)}
                                      >
                                        <div className="font-medium">{c.name}</div>
                                        <div className="text-xs text-text-secondary mt-0.5">{formatCurrency(c.amount)} • {c.frequency}</div>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="w-28">
                              <input
                                type="number"
                                value={fee.amount || ''}
                                onChange={(e) => updateFeeItem(fee.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center"
                                min="0"
                                placeholder="0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFeeItem(fee.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                bulkData.fees.length === 1 
                                  ? 'opacity-30 cursor-not-allowed' 
                                  : 'hover:bg-red-50 text-red-500'
                              }`}
                              disabled={bulkData.fees.length === 1}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-text-primary">Due Date *</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="input-default text-sm flex items-center justify-between"
                        >
                          <span className="text-text-primary">
                            {bulkData.dueDate ? format(new Date(bulkData.dueDate), 'PPP') : 'Pick a date'}
                          </span>
                          <CalendarIcon className="size-4 text-text-secondary" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-bg-white" align="start">
                        <Calendar
                          mode="single"
                          selected={bulkData.dueDate ? new Date(bulkData.dueDate) : undefined}
                          onSelect={(date) => setBulkData(prev => ({ 
                            ...prev, 
                            dueDate: date ? format(date, 'yyyy-MM-dd') : prev.dueDate 
                          }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-text-primary">Initial Status</span>
                    <div className="relative" ref={bulkStatusRef}>
                      <button
                        type="button"
                        className="input-default text-sm flex items-center justify-between"
                        onClick={() => setIsBulkStatusOpen(!isBulkStatusOpen)}
                      >
                        {getStatusLabel(bulkData.status)}
                        <ChevronDown className={`size-4 text-text-secondary transition-transform ${isBulkStatusOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isBulkStatusOpen && (
                        <div className="absolute z-10 bg-bg-white border border-border-default rounded-lg shadow-lg w-full mt-1 overflow-hidden">
                          {['pending', 'overdue'].map(status => (
                            <div
                              key={status}
                              className="px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors"
                              onClick={() => {
                                setBulkData(prev => ({ ...prev, status: status as any }));
                                setIsBulkStatusOpen(false);
                              }}
                            >
                              {getStatusLabel(status)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4 border border-border-light space-y-2">
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Households</span>
                      <span className="font-medium text-text-primary">{bulkData.selectedHouseholds.length}</span>
                    </div>
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Fee Categories</span>
                      <span className="font-medium text-text-primary">{bulkData.fees.filter(f => f.feeCategoryId).length}</span>
                    </div>
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Total Records</span>
                      <span className="font-medium text-text-primary">
                        {bulkData.selectedHouseholds.length * bulkData.fees.filter(f => f.feeCategoryId).length}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border-light text-sm text-text-secondary">
                      <span>Total Amount</span>
                      <span className="font-semibold text-brand-primary text-lg">{formatCurrency(bulkTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
            <button
            onClick={handleSubmit}
            className="btn-primary flex items-center gap-2"
              disabled={isSaving}
            >
            <div className="relative size-5">
              <AddSquareIcon className="relative size-5" />
            </div>
              {isSaving ? 'Saving...' : (
                mode === 'single' 
                  ? (payment ? 'Update Payment' : 'Create Payment')
                  : `Create ${bulkData.selectedHouseholds.length * bulkData.fees.filter(f => f.feeCategoryId).length} Payments`
              )}
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
