'use client'

import { Car, Bike, Motorbike } from 'lucide-react';
import type { ParkingSlot } from '../ParkingView';

interface ParkingSlotListProps {
  slots: ParkingSlot[];
  onEdit: (slot: ParkingSlot) => void;
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

  return (
    <div className="grid grid-cols-3 gap-[20px]">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="bg-bg-white rounded-[16px] p-[24px] shadow-lg border border-border-light hover:border-[#5030e5] transition-colors cursor-pointer"
          onClick={() => onEdit(slot)}
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
              <p className="text-text-secondary text-sm">{slot.unit}</p>
            </div>
            <div className={`w-[8px] h-[8px] rounded-full ${getStatusColor(slot.status)}`} />
          </div>

          {/* Owner Info */}
          <div className="mb-[16px]">
            <p className="font-medium text-text-primary text-sm mb-[4px]">{slot.ownerName}</p>
            <p className="text-text-secondary text-xs">{slot.phone}</p>
          </div>

          {/* Vehicle Info */}
          <div className="mb-[16px] pb-[16px] border-b border-border-light">
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
          <div className="flex items-center justify-between">
            <p className="text-text-secondary text-xs">Monthly Fee</p>
            <p className="font-semibold text-[#5030e5] text-base">${slot.monthlyFee}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
