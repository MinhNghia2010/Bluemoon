'use client'

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Plus, ChevronDown } from 'lucide-react';
import { SummaryCard } from './shared/SummaryCard';
import { paymentsApi, householdsApi } from '@/lib/api';
import { toast } from 'sonner';

// Skeleton Components
const HouseholdPaymentCardSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
      </div>
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
    </div>
    <div className="space-y-3">
      {[1, 2].map(j => (
        <div key={j} className="flex items-center justify-between p-3 bg-gray-300 dark:bg-gray-600 rounded-lg">
          <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-28"></div>
          <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-20"></div>
          <div className="h-6 bg-gray-400 dark:bg-gray-500 rounded-full w-16"></div>
        </div>
      ))}
    </div>
  </div>
);

const PaymentFiltersSkeleton = () => (
  <div className="animate-pulse flex gap-2 mb-6">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
    ))}
  </div>
);

const PaymentFormSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 mb-8">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-44 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
      </div>
    </div>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i}>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28 mb-2"></div>
            <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md w-24"></div>
        <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md w-32"></div>
      </div>
    </div>
  </div>
);

// Lazy load heavy components
const HouseholdPaymentCard = dynamic(() => import('./fee-collection/HouseholdPaymentCard').then(mod => ({ default: mod.HouseholdPaymentCard })), {
  loading: () => <HouseholdPaymentCardSkeleton />,
  ssr: false
});

const PaymentFilters = dynamic(() => import('./fee-collection/PaymentFilters').then(mod => ({ default: mod.PaymentFilters })), {
  loading: () => <PaymentFiltersSkeleton />,
  ssr: false
});

const PaymentForm = dynamic(() => import('./fee-collection/PaymentForm').then(mod => ({ default: mod.PaymentForm })), {
  loading: () => <PaymentFormSkeleton />,
  ssr: false
});

// Lazy card wrapper for viewport-based loading
function LazyHouseholdPaymentCard({ 
  household, 
  onMarkAsPaid 
}: { 
  household: GroupedHousehold;
  onMarkAsPaid: (paymentId: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.01 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <HouseholdPaymentCard
          unit={household.unit}
          ownerName={household.ownerName}
          balance={household.balance}
          payments={household.payments}
          onMarkAsPaid={onMarkAsPaid}
        />
      ) : (
        <HouseholdPaymentCardSkeleton />
      )}
    </div>
  );
}

interface Payment {
  id: string;
  householdId: string;
  feeCategoryId?: string;
  unit: string;
  ownerName: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'collected' | 'overdue';
  paymentDate?: string;
  method?: string;
}

interface Household {
  id: string;
  unit: string;
  ownerName: string;
  balance: number;
}

interface GroupedHousehold {
  id: string;
  unit: string;
  ownerName: string;
  balance: number;
  payments: {
    id: string;
    category: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'collected' | 'overdue';
    paymentDate?: string;
    method?: string;
  }[];
}

type ViewMode = 'list' | 'add' | 'edit';

// Get initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('bluemoon-feecollection-state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
};

export function FeeCollectionView() {
  const initialState = getInitialState();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'collected' | 'overdue'>(initialState?.filter || 'all');
  const [viewMode, setViewMode] = useState<ViewMode>(initialState?.viewMode || 'list');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(initialState?.selectedMonth ?? 'all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(initialState?.selectedYear ?? 'all');
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(initialState?.selectedPaymentId || null);

  // Save view state to localStorage
  useEffect(() => {
    const state = {
      viewMode,
      selectedPaymentId: selectedPayment?.id || null,
      filter,
      selectedMonth,
      selectedYear
    };
    localStorage.setItem('bluemoon-feecollection-state', JSON.stringify(state));
  }, [viewMode, selectedPayment?.id, filter, selectedMonth, selectedYear]);

  // Restore selected payment after data loads
  useEffect(() => {
    if (pendingPaymentId && payments.length > 0) {
      const payment = payments.find(p => p.id === pendingPaymentId);
      if (payment) {
        setSelectedPayment(payment);
      }
      setPendingPaymentId(null);
    }
  }, [payments, pendingPaymentId]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

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

  const getMonthLabel = (month: number | 'all') => {
    if (month === 'all') return 'All';
    return months[month];
  };

  const getYearLabel = (year: number | 'all') => {
    if (year === 'all') return 'All';
    return year.toString();
  };

  // Fetch data from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [paymentsData, householdsData] = await Promise.all([
        paymentsApi.getAll(),
        householdsApi.getAll()
      ]);
      
      setPayments(paymentsData.map((p: any) => ({
        id: p.id,
        householdId: p.householdId,
        feeCategoryId: p.feeCategoryId,
        unit: p.household?.unit || 'Unknown',
        ownerName: p.household?.ownerName || 'Unknown',
        category: p.feeCategory?.name || 'Unknown',
        amount: p.amount,
        dueDate: new Date(p.dueDate).toISOString().split('T')[0],
        status: p.status,
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : undefined,
        method: p.paymentMethod
      })));

      setHouseholds(householdsData.map((h: any) => ({
        id: h.id,
        unit: h.unit,
        ownerName: h.ownerName,
        balance: h.balance || 0
      })));
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await paymentsApi.update(paymentId, {
        status: 'collected',
        paymentMethod: 'cash'
      });
      toast.success('Payment marked as collected');
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment');
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (viewMode === 'edit' && selectedPayment) {
        await paymentsApi.update(selectedPayment.id, data);
        toast.success('Payment updated successfully');
      } else {
        await paymentsApi.create(data);
        toast.success('Payment created successfully');
      }
      await fetchData();
      setViewMode('list');
      setSelectedPayment(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save payment');
    }
  };

  const handleBulkSave = async (paymentsToCreate: any[]) => {
    try {
      await Promise.all(paymentsToCreate.map(p => paymentsApi.create(p)));
      toast.success(`Created ${paymentsToCreate.length} payment records`);
      await fetchData();
      setViewMode('list');
      setSelectedPayment(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payments');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedPayment(null);
  };

  // Filter payments by status and month/year
  const filteredPayments = payments.filter(p => {
    const paymentDate = new Date(p.dueDate);
    const matchesMonth = selectedMonth === 'all' || paymentDate.getMonth() === selectedMonth;
    const matchesYear = selectedYear === 'all' || paymentDate.getFullYear() === selectedYear;
    const matchesStatus = filter === 'all' || p.status === filter;
    return matchesMonth && matchesYear && matchesStatus;
  });

  // Get payments for the selected month/year (for counts)
  const monthYearPayments = payments.filter(p => {
    const paymentDate = new Date(p.dueDate);
    const matchesMonth = selectedMonth === 'all' || paymentDate.getMonth() === selectedMonth;
    const matchesYear = selectedYear === 'all' || paymentDate.getFullYear() === selectedYear;
    return matchesMonth && matchesYear;
  });

  // Group payments by household and sort by unit
  const groupedHouseholds: GroupedHousehold[] = households
    .map(household => {
      const householdPayments = filteredPayments
        .filter(p => p.householdId === household.id)
        .map(p => ({
          id: p.id,
          category: p.category,
          amount: p.amount,
          dueDate: p.dueDate,
          status: p.status,
          paymentDate: p.paymentDate,
          method: p.method
        }));

      return {
        ...household,
        payments: householdPayments
      };
    })
    .filter(h => h.payments.length > 0) // Only show households with payments matching the filter
    .sort((a, b) => a.unit.localeCompare(b.unit)); // Sort by unit number

  // Filter counts for selected month/year
  const pendingPayments = monthYearPayments.filter(p => p.status === 'pending');
  const collectedPayments = monthYearPayments.filter(p => p.status === 'collected');
  const overduePayments = monthYearPayments.filter(p => p.status === 'overdue');

  // Format currency in USD
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const summaryCards = [
    {
      title: 'Total Pending',
      value: formatCurrency(pendingPayments.reduce((sum, p) => sum + p.amount, 0)),
      subtitle: `${pendingPayments.length} payments`,
      dotColor: 'bg-[#d58d49]',
      valueColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Total Collected',
      value: formatCurrency(collectedPayments.reduce((sum, p) => sum + p.amount, 0)),
      subtitle: `${collectedPayments.length} payments`,
      dotColor: 'bg-[#7AC555]',
      valueColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Total Overdue',
      value: formatCurrency(overduePayments.reduce((sum, p) => sum + p.amount, 0)),
      subtitle: `${overduePayments.length} payments`,
      dotColor: 'bg-[#D34B5E]',
      valueColor: 'text-red-600 dark:text-red-400'
    }
  ];

  // Show form for add or edit mode
  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <PaymentForm
        payment={viewMode === 'edit' && selectedPayment ? {
          id: selectedPayment.id,
          householdId: selectedPayment.householdId || '',
          feeCategoryId: selectedPayment.feeCategoryId || '',
          amount: selectedPayment.amount,
          dueDate: selectedPayment.dueDate,
          status: selectedPayment.status,
          paymentMethod: selectedPayment.method,
          notes: ''
        } : undefined}
        onSave={handleSave}
        onBulkSave={handleBulkSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-[32px]">
        <div>
          <h1 className="font-semibold text-text-primary text-[32px] mb-[8px]">Fee Collection</h1>
          <p className="text-text-secondary text-base">Track and manage apartment fee payments</p>
        </div>
        
        <div className="flex items-center gap-[12px]">
          <button 
            onClick={() => setViewMode('add')}
            className="flex items-center gap-[8px] bg-[#5030e5] text-white px-[20px] py-[12px] rounded-[6px] hover:bg-[#4024c4] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium text-[16px]">Record Payment</span>
          </button>
        </div>
      </div>

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
              {getMonthLabel(selectedMonth)}
              <ChevronDown className={`size-4 text-text-secondary transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMonthOpen && (
              <div className="absolute z-10 bg-bg-white border border-border-default rounded-sm shadow-lg w-full mt-1 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                <div 
                  className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors ${selectedMonth === 'all' ? 'bg-bg-hover' : ''}`}
                  onClick={() => { setSelectedMonth('all'); setIsMonthOpen(false); }}
                >
                  All
                </div>
                {months.map((month, index) => (
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
              {getYearLabel(selectedYear)}
              <ChevronDown className={`size-4 text-text-secondary transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
            </button>
            {isYearOpen && (
              <div className="absolute z-10 bg-bg-white border border-border-default rounded-sm shadow-lg w-full mt-1 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                <div 
                  className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm text-text-primary transition-colors ${selectedYear === 'all' ? 'bg-bg-hover' : ''}`}
                  onClick={() => { setSelectedYear('all'); setIsYearOpen(false); }}
                >
                  All
                </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {summaryCards.map((card, index) => (
          <SummaryCard
            key={index}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            dotColor={card.dotColor}
            valueColor={card.valueColor}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <PaymentFilters 
          filter={filter} 
          onFilterChange={setFilter}
          counts={{
            all: monthYearPayments.length,
            pending: pendingPayments.length,
            collected: collectedPayments.length,
            overdue: overduePayments.length
          }}
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {/* Payment Cards Skeleton */}
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                </div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
              </div>
              <div className="space-y-3">
                {[1, 2].map(j => (
                  <div key={j} className="flex items-center justify-between p-3 bg-gray-300 dark:bg-gray-600 rounded-lg">
                    <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-28"></div>
                    <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-20"></div>
                    <div className="h-6 bg-gray-400 dark:bg-gray-500 rounded-full w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groupedHouseholds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No payments found</p>
          <button
            onClick={() => setViewMode('add')}
            className="mt-4 text-brand-primary hover:underline"
          >
            Create your first payment
          </button>
        </div>
      ) : (
        /* Households Grid - Grouped by household */
        <div className="space-y-4">
          {groupedHouseholds.map((household) => (
            <LazyHouseholdPaymentCard
              key={household.id}
              household={household}
              onMarkAsPaid={handleMarkAsPaid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
