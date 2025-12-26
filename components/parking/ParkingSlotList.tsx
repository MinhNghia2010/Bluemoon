'use client'

import { useState, useEffect, useRef } from 'react';
import { Car, Bike, Motorbike } from 'lucide-react';
import type { ParkingSlot } from '../ParkingView';

interface ParkingSlotListProps {
  slots: ParkingSlot[];
  onEdit: (slot: ParkingSlot) => void;
}

// Skeleton for a single parking slot card
const ParkingSlotCardSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl p-6 h-full flex flex-col">
    <div className="flex justify-between mb-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
      </div>
      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
    </div>
    <div className="mb-4">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
    </div>
    <div className="mb-4 pb-4 border-b border-gray-300 dark:border-gray-600 space-y-2 flex-grow">
      <div className="flex justify-between">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
    </div>
    <div className="flex justify-between mt-auto">
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
    </div>
  </div>
);

// Lazy card wrapper
function LazyParkingSlotCard({ 
  slot, 
  onEdit,
  renderCard 
}: { 
  slot: ParkingSlot; 
  onEdit: (slot: ParkingSlot) => void;
  renderCard: (slot: ParkingSlot, onEdit: (slot: ParkingSlot) => void) => React.ReactNode;
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
    <div ref={ref} className="h-full">
      {isVisible ? renderCard(slot, onEdit) : <ParkingSlotCardSkeleton />}
    </div>
  );
}

export function ParkingSlotList({ slots, onEdit }: ParkingSlotListProps) {
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <Car className="size-[20px]" />;
      case 'motorcycle':
        return <Motorbike className="size-[20px]" />;
      case 'bicycle':
        return <Bike className="size-[20px]" />;
      default:
        return <Car className="size-[20px]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#7AC555]';
      case 'inactive':
        return 'bg-[#D58D49]';
      default:
        return 'bg-[#787486]';
    }
  };

  const renderCard = (slot: ParkingSlot, onEditFn: (s: ParkingSlot) => void) => (
    <div
      className="bg-bg-white rounded-[16px] p-[24px] shadow-lg border border-border-light hover:border-[#5030e5] transition-colors cursor-pointer h-full flex flex-col"
      onClick={() => onEditFn(slot)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-[16px]">
        <div>
          <div className="flex items-center gap-[8px] mb-[4px]">
            <div className="text-[#5030e5]">
              {getVehicleIcon(slot.vehicleType)}
            </div>
            <p className="font-semibold text-text-primary text-base">{slot.slotNumber}</p>
          </div>
          <p className="text-text-secondary text-sm min-h-[20px]">{slot.unit || '\u00A0'}</p>
        </div>
        <div className={`w-[8px] h-[8px] rounded-full ${getStatusColor(slot.status)}`} />
      </div>

      {/* Owner Info */}
      <div className="mb-[16px]">
        <p className="font-medium text-text-primary text-sm mb-[4px] min-h-[20px]">{slot.ownerName || '\u00A0'}</p>
        <p className="text-text-secondary text-xs min-h-[16px]">{slot.phone || '\u00A0'}</p>
      </div>

      {/* Vehicle Info */}
      <div className="mb-[16px] pb-[16px] border-b border-border-light flex-grow">
        <div className="flex items-center justify-between mb-[8px]">
          <p className="text-text-secondary text-xs">Vehicle Type</p>
          <p className="text-text-primary text-xs font-medium capitalize">{slot.vehicleType}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-xs">License Plate</p>
          <p className="text-text-primary text-xs font-medium">{slot.licensePlate}</p>
        </div>
      </div>

      {/* Monthly Fee */}
      <div className="flex items-center justify-between mt-auto">
        <p className="text-text-secondary text-xs">Monthly Fee</p>
        <p className="font-semibold text-[#5030e5] text-base">${slot.monthlyFee}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-[20px]">
      {slots.map((slot) => (
        <LazyParkingSlotCard
          key={slot.id}
          slot={slot}
          onEdit={onEdit}
          renderCard={renderCard}
        />
      ))}
    </div>
  );
}
