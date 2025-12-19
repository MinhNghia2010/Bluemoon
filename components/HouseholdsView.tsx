'use client'

import { useState, useEffect } from 'react';
import { PageHeader } from './shared/PageHeader';
import { FilterButtons } from './shared/FilterButtons';
import { HouseholdList } from './households/HouseholdList';
import { HouseholdForm } from './households/HouseholdForm';
import { HouseholdDetailModal } from './households/HouseholdDetailModal';
import { householdsApi, paymentsApi } from '@/lib/api';
import { toast } from 'sonner';

interface Household {
  id: string;
  unit: string;
  ownerName: string;
  residents: number;
  status: 'paid' | 'pending' | 'overdue';
  balance: number;
  phone: string;
  email: string;
  overdueCount?: number;
}

type ViewMode = 'list' | 'add' | 'edit';

export function HouseholdsView() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch households and their payment status from API
  const fetchHouseholds = async () => {
    try {
      setIsLoading(true);
      const [householdsData, paymentsData] = await Promise.all([
        householdsApi.getAll(),
        paymentsApi.getAll()
      ]);

      // Calculate payment status for each household
      const householdsWithStatus = householdsData.map((h: any) => {
        const householdPayments = paymentsData.filter((p: any) => p.household?.id === h.id);
        const overduePayments = householdPayments.filter((p: any) => p.status === 'overdue');
        const pendingPayments = householdPayments.filter((p: any) => p.status === 'pending');
        
        let status: 'paid' | 'pending' | 'overdue' = 'paid';
        if (overduePayments.length > 0) {
          status = 'overdue';
        } else if (pendingPayments.length > 0 || h.balance > 0) {
          status = 'pending';
        }

        return {
          ...h,
          status,
          overdueCount: overduePayments.length,
          balance: h.balance || 0
        };
      });

      setHouseholds(householdsWithStatus);
    } catch (error) {
      toast.error('Failed to load households');
      console.error('Error fetching households:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  // Filter households based on payment status
  const filteredHouseholds = filter === 'all' 
    ? households 
    : households.filter(h => h.status === filter);

  const handleHouseholdClick = (household: Household) => {
    setSelectedHousehold(household);
    setShowModal(true);
  };

  const handleEditFromModal = () => {
    setShowModal(false);
    setViewMode('edit');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHousehold(null);
  };

  const handleSave = async (data: Partial<Household>) => {
    try {
      if (viewMode === 'edit' && selectedHousehold) {
        // Update existing household
        await householdsApi.update(selectedHousehold.id, data);
        toast.success('Household updated successfully');
      } else {
        // Create new household
        await householdsApi.create(data);
        toast.success('Household created successfully');
      }
      
      // Refresh list
      await fetchHouseholds();
      setViewMode('list');
      setSelectedHousehold(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save household');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await householdsApi.delete(id);
      toast.success('Household deleted successfully');
      setShowModal(false);
      setSelectedHousehold(null);
      await fetchHouseholds();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete household');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedHousehold(null);
  };

  // Statistics for filter counts based on payment status
  const stats = {
    all: households.length,
    paid: households.filter(h => h.status === 'paid').length,
    pending: households.filter(h => h.status === 'pending').length,
    overdue: households.filter(h => h.status === 'overdue').length
  };

  const filterButtons = [
    { id: 'all', label: 'All', count: stats.all },
    { id: 'paid', label: 'Paid', count: stats.paid },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'overdue', label: 'Overdue', count: stats.overdue }
  ];

  // Show form for add or edit mode
  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <HouseholdForm
        household={viewMode === 'edit' ? selectedHousehold : null}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // Show list view
  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Households"
        description="Manage apartment residents and payment status"
        buttonLabel="Add Household"
        onButtonClick={() => setViewMode('add')}
      />

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
        <>
          {/* Households Grid */}
          <HouseholdList 
            households={filteredHouseholds}
            onHouseholdClick={handleHouseholdClick}
          />

          {/* Detail Modal */}
          <HouseholdDetailModal 
            household={selectedHousehold}
            onClose={handleCloseModal}
            onEdit={handleEditFromModal}
            onDelete={() => selectedHousehold && handleDelete(selectedHousehold.id)}
          />
        </>
      )}
    </div>
  );
}
