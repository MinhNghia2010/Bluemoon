'use client'

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Car, Bike, Motorbike } from 'lucide-react';
import { toast } from 'sonner';
import { AddSquareIcon } from '../shared/AddSquareIcon';
import type { ParkingSlot } from '../ParkingView';

interface ParkingSlotFormProps {
  slot: ParkingSlot | null;
  onSave: (data: Partial<ParkingSlot>) => void;
  onCancel: () => void;
}

export function ParkingSlotForm({ slot, onSave, onCancel }: ParkingSlotFormProps) {
  const [formData, setFormData] = useState({
    slotNumber: slot?.slotNumber || '',
    unit: slot?.unit || '',
    ownerName: slot?.ownerName || '',
    vehicleType: slot?.vehicleType || 'car',
    licensePlate: slot?.licensePlate || '',
    monthlyFee: slot?.monthlyFee?.toString() || '',
    status: slot?.status || 'active',
    phone: slot?.phone || '',
  });

  const [isVehicleTypeOpen, setIsVehicleTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const vehicleTypeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (vehicleTypeRef.current && !vehicleTypeRef.current.contains(event.target as Node)) {
        setIsVehicleTypeOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      monthlyFee: parseFloat(formData.monthlyFee),
    });
    
    if (slot) {
      toast.success('Parking slot updated successfully!');
    } else {
      toast.success('Parking slot added successfully!');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const vehicleTypes = [
    { value: 'car', label: 'Car', icon: Car },
    { value: 'motorcycle', label: 'Motorcycle', icon: Motorbike },
    { value: 'bicycle', label: 'Bicycle', icon: Bike },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-500' },
    { value: 'inactive', label: 'Inactive', color: 'bg-orange-500' },
  ];

  const getVehicleTypeLabel = () => {
    const type = vehicleTypes.find(t => t.value === formData.vehicleType);
    return type ? type.label : 'Select vehicle type';
  };

  const getStatusLabel = () => {
    const status = statusOptions.find(s => s.value === formData.status);
    return status ? status.label : 'Select status';
  };

  const getStatusColor = () => {
    const status = statusOptions.find(s => s.value === formData.status);
    return status ? status.color : 'bg-gray-500';
  };

  const VehicleIcon = vehicleTypes.find(t => t.value === formData.vehicleType)?.icon || Car;

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-text-primary mb-2">
          {slot ? 'Edit Parking Slot' : 'Add New Parking Slot'}
        </h1>
        <p className="text-base text-text-secondary">
          {slot ? 'Update parking slot information' : 'Register a new parking slot'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card max-w-[800px] border border-neutral-200">
          <div className="space-y-6">
            {/* Slot Number */}
            <div className="grid grid-cols-[200px,1fr] gap-6 items-start">
              <label className="text-sm font-medium text-text-primary pt-3">
                Slot Number *
              </label>
              <input
                type="text"
                value={formData.slotNumber}
                onChange={(e) => handleChange('slotNumber', e.target.value)}
                className="input-default text-sm"
                placeholder="e.g., P-A01"
                required
              />
            </div>

            {/* Apartment Unit */}
            <div className="grid grid-cols-[200px,1fr] gap-6 items-start">
              <label className="text-sm font-medium text-text-primary pt-3">
                Apartment Unit *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="input-default text-sm"
                placeholder="e.g., A-101"
                required
              />
            </div>

            {/* Owner Name */}
            <div className="grid grid-cols-[200px,1fr] gap-6 items-start">
              <label className="text-sm font-medium text-text-primary pt-3">
                Owner Name *
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                className="input-default text-sm"
                placeholder="Enter owner name"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-[200px,1fr] gap-6 items-start">
              <label className="text-sm font-medium text-text-primary pt-3">
                Phone Number *
                </label>
                <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input-default text-sm"
                placeholder="e.g., 555-0101"
                required
                />
              </div>

            {/* Vehicle Type */}
            <div className="grid grid-cols-[200px,1fr] gap-6 items-center">
              <label className="text-sm font-medium text-text-primary">
                Vehicle Type *
              </label>
              <div className="relative" ref={vehicleTypeRef}>
                <button
                  type="button"
                  className="input-default text-sm flex items-center justify-between"
                  onClick={() => setIsVehicleTypeOpen(!isVehicleTypeOpen)}
                >
                  <div className="flex items-center gap-2">
                    <VehicleIcon className="size-4 text-brand-primary" />
                    <span className="text-text-primary">{getVehicleTypeLabel()}</span>
                  </div>
                  <ChevronDown className={`size-4 text-text-secondary transition-transform ${isVehicleTypeOpen ? 'rotate-180' : ''}`} />
                </button>
                {isVehicleTypeOpen && (
                  <div className="absolute z-10 bg-bg-white border border-border-light rounded-lg shadow-lg w-full mt-1 overflow-hidden">
                    {vehicleTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.value}
                          className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm transition-colors flex items-center gap-3 ${
                            formData.vehicleType === type.value ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'
                          }`}
                          onClick={() => {
                            handleChange('vehicleType', type.value);
                            setIsVehicleTypeOpen(false);
                          }}
                        >
                          <Icon className="size-4" />
                          {type.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* License Plate */}
            <div className="grid grid-cols-[200px,1fr] gap-6 items-start">
              <label className="text-sm font-medium text-text-primary pt-3">
                License Plate
              </label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => handleChange('licensePlate', e.target.value)}
                className="input-default text-sm"
                placeholder="e.g., ABC-1234"
              />
            </div>

            {/* Monthly Fee */}
            <div className="grid grid-cols-[200px,1fr] gap-6 items-start">
              <label className="text-sm font-medium text-text-primary pt-3">
                Monthly Fee ($) *
              </label>
              <input
                type="number"
                value={formData.monthlyFee}
                onChange={(e) => handleChange('monthlyFee', e.target.value)}
                className="input-default text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="e.g., 50"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Status */}
            <div className="grid grid-cols-[200px,1fr] gap-6 items-center">
              <label className="text-sm font-medium text-text-primary">
                Status *
              </label>
              <div className="relative" ref={statusRef}>
                <button
                  type="button"
                  className="input-default text-sm flex items-center justify-between"
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${getStatusColor()}`} />
                    <span className="text-text-primary">{getStatusLabel()}</span>
                  </div>
                  <ChevronDown className={`size-4 text-text-secondary transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                </button>
                {isStatusOpen && (
                  <div className="absolute z-10 bg-bg-white border border-border-light rounded-lg shadow-lg w-full mt-1 overflow-hidden">
                    {statusOptions.map(status => (
                      <div
                        key={status.value}
                        className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm transition-colors flex items-center gap-3 ${
                          formData.status === status.value ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'
                        }`}
                        onClick={() => {
                          handleChange('status', status.value);
                          setIsStatusOpen(false);
                        }}
                      >
                        <div className={`size-2.5 rounded-full ${status.color}`} />
                        {status.label}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <div className="relative size-5">
                <AddSquareIcon className="relative size-5" />
              </div>
              {slot ? 'Update Slot' : 'Add Slot'}
            </button>
          <button
            type="button"
            onClick={onCancel}
              className="btn-secondary"
          >
            Cancel
          </button>
          </div>
        </div>
      </form>
    </div>
  );
}
