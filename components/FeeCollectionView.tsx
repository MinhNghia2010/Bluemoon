'use client'

import { useState, useEffect } from 'react';
import { AddSquareIcon } from './shared/AddSquareIcon';
import { SummaryCard } from './shared/SummaryCard';
import { HouseholdPaymentCard } from './fee-collection/HouseholdPaymentCard';
import { PaymentFilters } from './fee-collection/PaymentFilters';
import { PaymentForm } from './fee-collection/PaymentForm';
import { paymentsApi, householdsApi } from '@/lib/api';
import { toast } from 'sonner';

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

export function FeeCollectionView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'collected' | 'overdue'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

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

  // Filter payments
  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

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

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const collectedPayments = payments.filter(p => p.status === 'collected');
  const overduePayments = payments.filter(p => p.status === 'overdue');

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
            <div className="relative size-[20px]">
              <AddSquareIcon className="relative size-[20px]" />
            </div>
            <span className="font-medium text-[16px]">Record Payment</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-[20px] mb-[32px]">
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
      <div className="mb-[24px]">
        <PaymentFilters filter={filter} onFilterChange={setFilter} />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
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
            <HouseholdPaymentCard
              key={household.id}
              unit={household.unit}
              ownerName={household.ownerName}
              balance={household.balance}
              payments={household.payments}
              onMarkAsPaid={handleMarkAsPaid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
