'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from './shared/PageHeader';
import { FilterButtons } from './shared/FilterButtons';
import { householdsApi, paymentsApi } from '@/lib/api';
import { toast } from 'sonner';

// Skeleton Components
const HouseholdListSkeleton = () => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
        </div>
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
        <div className="flex gap-4 mb-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map(j => (
            <div key={j} className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const HouseholdFormSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 mb-8">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-8 space-y-5">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-4"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          </div>
        ))}
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-8 space-y-5">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4"></div>
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
    <div className="flex justify-end gap-3 mt-6">
      <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-md w-24"></div>
      <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-md w-32"></div>
    </div>
  </div>
);

// Lazy load heavy components
const HouseholdList = dynamic(() => import('./households/HouseholdList').then(mod => ({ default: mod.HouseholdList })), {
  loading: () => <HouseholdListSkeleton />,
  ssr: false
});

const HouseholdForm = dynamic(() => import('./households/HouseholdForm').then(mod => ({ default: mod.HouseholdForm })), {
  loading: () => <HouseholdFormSkeleton />,
  ssr: false
});

const HouseholdDetailModal = dynamic(() => import('./households/HouseholdDetailModal').then(mod => ({ default: mod.HouseholdDetailModal })), {
  ssr: false
});

interface HouseholdMember {
  id: string;
  name: string;
  profilePic?: string | null;
}

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
  overdueCount?: number;
  members?: HouseholdMember[];
}

type ViewMode = 'list' | 'add' | 'edit';

// Get initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('bluemoon-households-state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
};

export function HouseholdsView() {
  const initialState = getInitialState();
  
  const [households, setHouseholds] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>(initialState?.filter || 'all');
  const [viewMode, setViewMode] = useState<ViewMode>(initialState?.viewMode || 'list');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [showModal, setShowModal] = useState(initialState?.showModal || false);
  const [pendingHouseholdId, setPendingHouseholdId] = useState<string | null>(initialState?.selectedHouseholdId || null);

  // Save view state to localStorage
  useEffect(() => {
    const state = {
      viewMode,
      selectedHouseholdId: selectedHousehold?.id || null,
      showModal,
      filter
    };
    localStorage.setItem('bluemoon-households-state', JSON.stringify(state));
  }, [viewMode, selectedHousehold?.id, showModal, filter]);

  // Restore selected household after data loads
  useEffect(() => {
    if (pendingHouseholdId && households.length > 0) {
      const household = households.find(h => h.id === pendingHouseholdId);
      if (household) {
        setSelectedHousehold(household);
      }
      setPendingHouseholdId(null);
    }
  }, [households, pendingHouseholdId]);

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
        <div className="animate-pulse">
          {/* Household Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48"></div>
            ))}
          </div>
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
            onMembersChange={fetchHouseholds}
          />
        </>
      )}
    </div>
  );
}
