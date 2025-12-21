'use client'

import { useState, useEffect } from 'react';
import { Car, Plus } from 'lucide-react';
import { PageHeader } from './shared/PageHeader';
import { FilterButtons } from './shared/FilterButtons';
import { StatsGrid } from './shared/StatsGrid';
import { ParkingSlotList } from './parking/ParkingSlotList';
import { ParkingSlotForm } from './parking/ParkingSlotForm';
import { parkingApi, householdsApi } from '@/lib/api';
import { toast } from 'sonner';

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
}

type ViewMode = 'list' | 'add' | 'edit';

export function ParkingView() {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'car' | 'motorcycle' | 'bicycle'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const fetchParkingSlots = async () => {
    try {
      setIsLoading(true);
      const data = await parkingApi.getAll();
      setParkingSlots(data.map((slot: any) => ({
        id: slot.id,
        slotNumber: slot.slotNumber,
        unit: slot.household?.unit || 'Unassigned',
        ownerName: slot.household?.ownerName || 'N/A',
        vehicleType: slot.type as 'car' | 'motorcycle' | 'bicycle',
        licensePlate: slot.licensePlate || 'N/A',
        monthlyFee: slot.monthlyFee,
        status: slot.status === 'occupied' ? 'active' : 'inactive',
        phone: slot.household?.phone || '',
        householdId: slot.householdId
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
        await parkingApi.update(selectedSlot.id, {
          type: data.vehicleType,
          licensePlate: data.licensePlate,
          monthlyFee: data.monthlyFee,
          householdId: data.householdId
        });
        toast.success('Parking slot updated successfully');
      } else {
        await parkingApi.create({
          slotNumber: data.slotNumber,
          type: data.vehicleType,
          licensePlate: data.licensePlate,
          monthlyFee: data.monthlyFee,
          householdId: data.householdId
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
    if (!confirm('Are you sure you want to delete this parking slot?')) return;
    
    try {
      await parkingApi.delete(id);
      toast.success('Parking slot deleted successfully');
      await fetchParkingSlots();
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

  // Show form for add or edit mode
  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <ParkingSlotForm
        slot={viewMode === 'edit' ? selectedSlot : null}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // Statistics - all vehicles (active and inactive) occupy slots
  const MAX_PARKING_SLOTS = 500;
  const MAX_PARKING_HOUSEHOLDS = 100;
  
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
        onButtonClick={() => setViewMode('add')}
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        /* Parking Slot List */
        <ParkingSlotList 
          slots={filteredSlots} 
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
