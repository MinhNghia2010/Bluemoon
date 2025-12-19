'use client'

import { useState, useEffect } from 'react';
import { Zap, Droplet, Wifi } from 'lucide-react';
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
  type: string;
  electricityUsage: number;
  electricityCost: number;
  waterUsage: number;
  waterCost: number;
  internetCost: number;
  totalCost: number;
  status: 'paid' | 'pending' | 'overdue';
  phone: string;
  householdId?: string;
}

type ViewMode = 'list' | 'add' | 'edit';

export function UtilitiesView() {
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBill, setSelectedBill] = useState<UtilityBill | null>(null);

  const fetchUtilityBills = async () => {
    try {
      setIsLoading(true);
      const data = await utilitiesApi.getAll();
      setUtilityBills(data.map((bill: any) => ({
        id: bill.id,
        unit: bill.household?.unit || 'Unknown',
        ownerName: bill.household?.ownerName || 'Unknown',
        month: new Date(bill.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        type: bill.type,
        electricityUsage: bill.type === 'electricity' ? 100 : 0,
        electricityCost: bill.type === 'electricity' ? bill.amount : 0,
        waterUsage: bill.type === 'water' ? 10 : 0,
        waterCost: bill.type === 'water' ? bill.amount : 0,
        internetCost: bill.type === 'internet' ? bill.amount : 0,
        totalCost: bill.amount,
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

  const filteredBills = filter === 'all' 
    ? utilityBills 
    : utilityBills.filter(b => b.status === filter);

  const handleSave = async (data: Partial<UtilityBill>) => {
    try {
      if (viewMode === 'edit' && selectedBill) {
        await utilitiesApi.update(selectedBill.id, {
          amount: data.totalCost,
          status: data.status
        });
        toast.success('Utility bill updated successfully');
      } else {
        await utilitiesApi.create({
          householdId: data.householdId,
          type: data.type || 'electricity',
          amount: data.totalCost,
          periodStart: new Date().toISOString(),
          periodEnd: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
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

  // Statistics
  const stats = {
    totalBills: utilityBills.length,
    paid: utilityBills.filter(b => b.status === 'paid').length,
    pending: utilityBills.filter(b => b.status === 'pending').length,
    overdue: utilityBills.filter(b => b.status === 'overdue').length,
    totalElectricity: utilityBills.filter(b => b.type === 'electricity').reduce((sum, b) => sum + b.totalCost, 0),
    totalWater: utilityBills.filter(b => b.type === 'water').reduce((sum, b) => sum + b.totalCost, 0),
    totalInternet: utilityBills.filter(b => b.type === 'internet').reduce((sum, b) => sum + b.totalCost, 0),
    totalRevenue: utilityBills.reduce((sum, b) => sum + b.totalCost, 0),
  };

  const statisticsCards = [
    {
      label: 'Electricity',
      value: formatCurrency(stats.totalElectricity),
      detail: 'This month',
      icon: Zap
    },
    {
      label: 'Water',
      value: formatCurrency(stats.totalWater),
      detail: 'This month',
      icon: Droplet
    },
    {
      label: 'Internet',
      value: formatCurrency(stats.totalInternet),
      detail: 'This month',
      icon: Wifi
    }
  ];

  const filterButtons = [
    { id: 'all' as const, label: 'All', count: utilityBills.length },
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
