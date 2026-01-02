'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Car, Plus, AlertCircle } from 'lucide-react';
import { PageHeader } from './shared/PageHeader';
import { FilterButtons } from './shared/FilterButtons';
import { StatsGrid } from './shared/StatsGrid';
import { parkingApi, householdsApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

// Skeleton Components
const ParkingSlotListSkeleton = () => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-5">
        <div className="flex justify-between mb-3">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-300 dark:border-gray-600">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
);

const ParkingSlotFormSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 mb-8">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
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
const ParkingSlotList = dynamic(() => import('./parking/ParkingSlotList').then(mod => ({ default: mod.ParkingSlotList })), {
  loading: () => <ParkingSlotListSkeleton />,
  ssr: false
});

const ParkingSlotForm = dynamic(() => import('./parking/ParkingSlotForm').then(mod => ({ default: mod.ParkingSlotForm })), {
  loading: () => <ParkingSlotFormSkeleton />,
  ssr: false
});

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  unit: string;
  ownerName: string;
  vehicleType: 'car' | 'motorcycle' | 'bicycle';
  licensePlate: string;
  monthlyFee: number;
  status: 'active' | 'inactive';
  phone: string;
  householdId?: string;
  memberId?: string;
}

type ViewMode = 'list' | 'add' | 'edit';

// Constants for parking limits
const MAX_PARKING_SLOTS = 500;
const MAX_PARKING_HOUSEHOLDS = 100;

// Get initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('bluemoon-parking-state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
};

export function ParkingView() {
  const initialState = getInitialState();
  
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'car' | 'motorcycle' | 'bicycle'>(initialState?.filter || 'all');
  const [viewMode, setViewMode] = useState<ViewMode>(initialState?.viewMode || 'list');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [pendingSlotId, setPendingSlotId] = useState<string | null>(initialState?.selectedSlotId || null);
  const [showParkingFullAlert, setShowParkingFullAlert] = useState(false);

  // Save view state to localStorage
  useEffect(() => {
    const state = {
      viewMode,
      selectedSlotId: selectedSlot?.id || null,
      filter
    };
    localStorage.setItem('bluemoon-parking-state', JSON.stringify(state));
  }, [viewMode, selectedSlot?.id, filter]);

  // Restore selected slot after data loads
  useEffect(() => {
    if (pendingSlotId && parkingSlots.length > 0) {
      const slot = parkingSlots.find(s => s.id === pendingSlotId);
      if (slot) {
        setSelectedSlot(slot);
      }
      setPendingSlotId(null);
    }
  }, [parkingSlots, pendingSlotId]);

  const fetchParkingSlots = async () => {
    try {
      setIsLoading(true);
      const data = await parkingApi.getAll();
      setParkingSlots(data.map((slot: any) => ({
        id: slot.id,
        slotNumber: slot.slotNumber,
        unit: slot.vehicleOwner?.household?.unit || slot.household?.unit || 'Unassigned',
        ownerName: slot.vehicleOwner?.name || (slot.memberId ? 'Unknown' : 'No Owner'),
        vehicleType: slot.type as 'car' | 'motorcycle' | 'bicycle',
        licensePlate: slot.licensePlate || 'N/A',
        monthlyFee: slot.monthlyFee,
        status: slot.status === 'occupied' ? 'active' : 'inactive',
        phone: slot.vehicleOwner?.household?.phone || slot.household?.phone || '',
        householdId: slot.householdId,
        memberId: slot.memberId
      })));
    } catch (error) {
      toast.error('Failed to load parking slots');
      console.error('Error fetching parking slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingSlots();
  }, []);

  const filteredSlots = filter === 'all' 
    ? parkingSlots 
    : parkingSlots.filter(s => s.vehicleType === filter);

  const handleSave = async (data: Partial<ParkingSlot>) => {
    try {
      if (viewMode === 'edit' && selectedSlot) {
        // Always pass memberId (even if empty/null) so API knows to clear owner
        await parkingApi.update(selectedSlot.id, {
          slotNumber: data.slotNumber,
          type: data.vehicleType,
          licensePlate: data.licensePlate,
          monthlyFee: data.monthlyFee,
          householdId: data.householdId || null,
          memberId: data.memberId || null // Pass null explicitly to clear owner
        });
        toast.success('Parking slot updated successfully');
      } else {
        await parkingApi.create({
          slotNumber: data.slotNumber,
          type: data.vehicleType,
          licensePlate: data.licensePlate,
          monthlyFee: data.monthlyFee,
          householdId: data.householdId,
          memberId: data.memberId
        });
        toast.success('Parking slot created successfully');
      }
      await fetchParkingSlots();
      setViewMode('list');
      setSelectedSlot(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save parking slot');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await parkingApi.delete(id);
      toast.success('Parking slot deleted successfully');
      await fetchParkingSlots();
      setViewMode('list');
      setSelectedSlot(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete parking slot');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedSlot(null);
  };

  const handleEdit = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setViewMode('edit');
  };

  const handleAddParkingSlot = () => {
    if (parkingSlots.length >= MAX_PARKING_SLOTS) {
      setShowParkingFullAlert(true);
      return;
    }
    setViewMode('add');
  };

  // Show form for add or edit mode
  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <ParkingSlotForm
        slot={viewMode === 'edit' ? selectedSlot : null}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
        totalSlots={parkingSlots.length}
        maxSlots={MAX_PARKING_SLOTS}
      />
    );
  }

  // Statistics - all vehicles (active and inactive) occupy slots
  // Count unique households
  const uniqueHouseholds = new Set(parkingSlots.filter(s => s.householdId).map(s => s.householdId)).size;
  
  const stats = {
    total: parkingSlots.length,
    active: parkingSlots.filter(s => s.status === 'active').length,
    inactive: parkingSlots.filter(s => s.status === 'inactive').length,
    cars: parkingSlots.filter(s => s.vehicleType === 'car').length,
    motorcycles: parkingSlots.filter(s => s.vehicleType === 'motorcycle').length,
    bicycles: parkingSlots.filter(s => s.vehicleType === 'bicycle').length,
    monthlyRevenue: parkingSlots.reduce((sum, s) => sum + s.monthlyFee, 0), // All vehicles count
    availableSlots: MAX_PARKING_SLOTS - parkingSlots.length,
    householdsWithParking: uniqueHouseholds,
    availableHouseholdSlots: MAX_PARKING_HOUSEHOLDS - uniqueHouseholds
  };

  // Format currency in USD
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statisticsCards = [
    {
      label: 'Vehicle Slots',
      value: `${stats.total}/${MAX_PARKING_SLOTS}`,
      detail: `${stats.availableSlots} Available`,
      icon: Car
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      detail: `From ${stats.total} vehicles`,
      icon: Plus
    }
  ];

  const filterButtons = [
    { id: 'all' as const, label: 'All', count: parkingSlots.length },
    { id: 'car' as const, label: 'Cars', count: stats.cars },
    { id: 'motorcycle' as const, label: 'Motorcycles', count: stats.motorcycles },
    { id: 'bicycle' as const, label: 'Bicycles', count: stats.bicycles }
  ];

  // Show list view
  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Parking Management"
        description="Manage parking slots and vehicle registration"
        buttonLabel="Add Parking Slot"
        onButtonClick={handleAddParkingSlot}
      />

      {/* Statistics Cards */}
      <StatsGrid stats={statisticsCards} columns={2} />

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
          {/* Parking Slot Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-5 h-40">
                <div className="flex justify-between mb-3">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
                </div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-3"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Parking Slot List */
        <ParkingSlotList 
          slots={filteredSlots} 
          onEdit={handleEdit}
        />
      )}

      {/* Parking Full Alert */}
      <AlertDialog open={showParkingFullAlert} onOpenChange={setShowParkingFullAlert}>
        <AlertDialogContent className="bg-bg-white border-border-light p-0 overflow-hidden">
          <div className="bg-orange-500 px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <AlertDialogTitle className="text-white text-lg font-semibold">
                Parking Full
              </AlertDialogTitle>
              <p className="text-white/80 text-sm">Maximum capacity reached</p>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <AlertDialogDescription className="text-text-secondary text-sm leading-relaxed">
              The parking area has reached its maximum capacity of <span className="font-semibold text-text-primary">{MAX_PARKING_SLOTS}</span> vehicles.
              <br /><br />
              Currently registered: <span className="font-semibold text-text-primary">{parkingSlots.length}</span> vehicles
              <br /><br />
              Please remove an existing vehicle before adding a new one, or contact building management to increase the parking capacity.
            </AlertDialogDescription>
          </div>

          <AlertDialogFooter className="px-6 py-4 bg-bg-hover border-t border-border-light">
            <AlertDialogAction
              onClick={() => setShowParkingFullAlert(false)}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
