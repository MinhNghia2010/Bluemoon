'use client'

import { useState, useEffect, useRef } from 'react';
import { Zap, Droplet, Wifi, ChevronDown } from 'lucide-react';
import { PageHeader } from './shared/PageHeader';
import { FilterButtons } from './shared/FilterButtons';
import { StatsGrid } from './shared/StatsGrid';
import { UtilityBillList } from './utilities/UtilityBillList';
import { UtilityBillForm } from './utilities/UtilityBillForm';
import { utilitiesApi } from '@/lib/api';
import { toast } from 'sonner';

export interface UtilityBill {
  id: string;
  unit: string;
  ownerName: string;
  month: string;
  electricityUsage: number;
  electricityRate: number;
  electricityCost: number;
  waterUsage: number;
  waterRate: number;
  waterCost: number;
  internetCost: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue';
  phone: string;
  householdId?: string;
}

type ViewMode = 'list' | 'add' | 'edit';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Get initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('bluemoon-utilities-state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
};

export function UtilitiesView() {
  const initialState = getInitialState();
  const currentDate = new Date();
  
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>(initialState?.filter || 'all');
  const [viewMode, setViewMode] = useState<ViewMode>(initialState?.viewMode || 'list');
  const [selectedBill, setSelectedBill] = useState<UtilityBill | null>(null);
  const [pendingBillId, setPendingBillId] = useState<string | null>(initialState?.selectedBillId || null);
  
  // Month/Year filter with current month/year as default
  const [selectedMonth, setSelectedMonth] = useState<number>(initialState?.selectedMonth ?? currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(initialState?.selectedYear ?? currentDate.getFullYear());
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // Generate years array (current year and 5 years back)
  const years = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - 5 + i);

  // Save view state to localStorage
  useEffect(() => {
    const state = {
      viewMode,
      selectedBillId: selectedBill?.id || null,
      filter,
      selectedMonth,
      selectedYear
    };
    localStorage.setItem('bluemoon-utilities-state', JSON.stringify(state));
  }, [viewMode, selectedBill?.id, filter, selectedMonth, selectedYear]);

  // Restore selected bill after data loads
  useEffect(() => {
    if (pendingBillId && utilityBills.length > 0) {
      const bill = utilityBills.find(b => b.id === pendingBillId);
      if (bill) {
        setSelectedBill(bill);
      }
      setPendingBillId(null);
    }
  }, [utilityBills, pendingBillId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUtilityBills = async () => {
    try {
      setIsLoading(true);
      const data = await utilitiesApi.getAll();
      setUtilityBills(data.map((bill: any) => ({
        id: bill.id,
        unit: bill.household?.unit || 'Unknown',
        ownerName: bill.household?.ownerName || 'Unknown',
        month: bill.month || new Date(bill.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        electricityUsage: bill.electricityUsage || 0,
        electricityRate: bill.electricityRate || 0.15,
        electricityCost: bill.electricityCost || 0,
        waterUsage: bill.waterUsage || 0,
        waterRate: bill.waterRate || 1.5,
        waterCost: bill.waterCost || 0,
        internetCost: bill.internetCost || 0,
        totalAmount: bill.totalAmount || 0,
        status: bill.status,
        phone: bill.household?.phone || '',
        householdId: bill.householdId
      })));
    } catch (error) {
      toast.error('Failed to load utility bills');
      console.error('Error fetching utility bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilityBills();
  }, []);

  // Filter bills by selected month/year
  const monthYearFilteredBills = utilityBills.filter(bill => {
    const billMonth = `${monthNames[selectedMonth]} ${selectedYear}`;
    return bill.month === billMonth;
  });

  const filteredBills = filter === 'all' 
    ? monthYearFilteredBills 
    : monthYearFilteredBills.filter(b => b.status === filter);

  const handleSave = async (data: Partial<UtilityBill>) => {
    try {
      if (viewMode === 'edit' && selectedBill) {
        await utilitiesApi.update(selectedBill.id, {
          month: data.month,
          electricityUsage: data.electricityUsage,
          electricityRate: data.electricityRate,
          electricityCost: data.electricityCost,
          waterUsage: data.waterUsage,
          waterRate: data.waterRate,
          waterCost: data.waterCost,
          internetCost: data.internetCost,
          totalAmount: data.totalAmount,
          status: data.status
        });
        toast.success('Utility bill updated successfully');
      } else {
        await utilitiesApi.create({
          householdId: data.householdId,
          month: data.month,
          electricityUsage: data.electricityUsage,
          electricityRate: data.electricityRate,
          electricityCost: data.electricityCost,
          waterUsage: data.waterUsage,
          waterRate: data.waterRate,
          waterCost: data.waterCost,
          internetCost: data.internetCost,
          totalAmount: data.totalAmount,
          status: data.status
        });
        toast.success('Utility bill created successfully');
      }
      await fetchUtilityBills();
      setViewMode('list');
      setSelectedBill(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save utility bill');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await utilitiesApi.update(id, { status: 'paid' });
      toast.success('Bill marked as paid');
      await fetchUtilityBills();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update bill');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this utility bill?')) return;
    
    try {
      await utilitiesApi.delete(id);
      toast.success('Utility bill deleted successfully');
      await fetchUtilityBills();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete utility bill');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedBill(null);
  };

  const handleEdit = (bill: UtilityBill) => {
    setSelectedBill(bill);
    setViewMode('edit');
  };

  // Show form for add or edit mode
  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <UtilityBillForm
        bill={viewMode === 'edit' ? selectedBill : null}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // Format currency in USD
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Statistics (based on filtered month/year)
  const stats = {
    totalBills: monthYearFilteredBills.length,
    paid: monthYearFilteredBills.filter(b => b.status === 'paid').length,
    pending: monthYearFilteredBills.filter(b => b.status === 'pending').length,
    overdue: monthYearFilteredBills.filter(b => b.status === 'overdue').length,
    totalElectricity: monthYearFilteredBills.reduce((sum, b) => sum + (b.electricityCost || 0), 0),
    totalWater: monthYearFilteredBills.reduce((sum, b) => sum + (b.waterCost || 0), 0),
    totalInternet: monthYearFilteredBills.reduce((sum, b) => sum + (b.internetCost || 0), 0),
    totalRevenue: monthYearFilteredBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
  };

  const statisticsCards = [
    {
      label: 'Electricity',
      value: formatCurrency(stats.totalElectricity),
      detail: `${monthNames[selectedMonth]} ${selectedYear}`,
      icon: Zap
    },
    {
      label: 'Water',
      value: formatCurrency(stats.totalWater),
      detail: `${monthNames[selectedMonth]} ${selectedYear}`,
      icon: Droplet
    },
    {
      label: 'Internet',
      value: formatCurrency(stats.totalInternet),
      detail: `${monthNames[selectedMonth]} ${selectedYear}`,
      icon: Wifi
    }
  ];

  const filterButtons = [
    { id: 'all' as const, label: 'All', count: monthYearFilteredBills.length },
    { id: 'paid' as const, label: 'Paid', count: stats.paid },
    { id: 'pending' as const, label: 'Pending', count: stats.pending },
    { id: 'overdue' as const, label: 'Overdue', count: stats.overdue }
  ];

  // Show list view
  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Utilities Collection"
        description="Manage electricity, water, and internet bills"
        buttonLabel="Add Utility Bill"
        onButtonClick={() => setViewMode('add')}
      />

      {/* Month/Year Filter */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Select month</label>
          <div className="relative" ref={monthDropdownRef}>
            <button
              type="button"
              className="input-default text-sm flex items-center justify-between w-full"
              onClick={() => setIsMonthOpen(!isMonthOpen)}
            >
              {monthNames[selectedMonth]}
              <ChevronDown className={`size-4 text-text-secondary transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMonthOpen && (
              <div className="absolute z-10 bg-bg-white border border-border-default rounded-sm shadow-lg w-full mt-1 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                {monthNames.map((month, index) => (
                  <div 
                    key={month}
                    className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors ${selectedMonth === index ? 'bg-bg-hover' : ''}`}
                    onClick={() => { setSelectedMonth(index); setIsMonthOpen(false); }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Select year</label>
          <div className="relative" ref={yearDropdownRef}>
            <button
              type="button"
              className="input-default text-sm flex items-center justify-between w-full"
              onClick={() => setIsYearOpen(!isYearOpen)}
            >
              {selectedYear}
              <ChevronDown className={`size-4 text-text-secondary transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
            </button>
            {isYearOpen && (
              <div className="absolute z-10 bg-bg-white border border-border-default rounded-sm shadow-lg w-full mt-1 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                {years.map((year) => (
                  <div 
                    key={year}
                    className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors ${selectedYear === year ? 'bg-bg-hover' : ''}`}
                    onClick={() => { setSelectedYear(year); setIsYearOpen(false); }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsGrid stats={statisticsCards} />

      {/* Filters */}
      <FilterButtons
        filters={filterButtons}
        activeFilter={filter}
        onFilterChange={(id) => setFilter(id as typeof filter)}
        variant="primary"
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        /* Utility Bill List */
        <UtilityBillList 
          bills={filteredBills} 
          onEdit={handleEdit}
          onMarkAsPaid={handleMarkAsPaid}
        />
      )}
    </div>
  );
}
