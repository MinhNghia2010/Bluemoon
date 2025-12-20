'use client'

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Car, Bike, Motorbike, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { AddSquareIcon } from '../shared/AddSquareIcon';
import type { ParkingSlot } from '../ParkingView';

interface Member {
  id: string;
  name: string;
  cccd: string;
  householdId?: string | null;
  household?: { unit: string; phone: string } | null;
}

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

  const [members, setMembers] = useState<Member[]>([]);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [isVehicleTypeOpen, setIsVehicleTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const ownerRef = useRef<HTMLDivElement>(null);
  const vehicleTypeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Fetch members on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/members');
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    };
    fetchMembers();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ownerRef.current && !ownerRef.current.contains(event.target as Node)) {
        setIsOwnerOpen(false);
      }
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

  const handleOwnerSelect = (member: Member) => {
    setFormData(prev => ({
      ...prev,
      ownerName: member.name,
      unit: member.household?.unit || prev.unit,
      phone: member.household?.phone || prev.phone,
    }));
    setIsOwnerOpen(false);
    if (errors.ownerName) {
      setErrors(prev => ({ ...prev, ownerName: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.slotNumber.trim()) newErrors.slotNumber = 'Slot number is required';
    if (!formData.unit.trim()) newErrors.unit = 'Apartment unit is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    const fee = parseFloat(formData.monthlyFee);
    if (!formData.monthlyFee || isNaN(fee) || fee <= 0) {
      newErrors.monthlyFee = 'Monthly fee must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Apartment / Owner Column */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light space-y-5">
            <h3 className="font-semibold text-text-primary text-lg">Apartment & Owner</h3>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Slot Number *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.slotNumber}
                  onChange={(e) => handleChange('slotNumber', e.target.value)}
                  className={`input-default text-sm pr-10 ${formData.slotNumber.trim().length > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.slotNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="e.g., P-A01"
                  required
                />
                {formData.slotNumber.trim().length > 0 && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {formData.slotNumber.trim().length === 0 && errors.slotNumber && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {errors.slotNumber && <p className="text-xs text-red-500 mt-0.5">{errors.slotNumber}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Vehicle Owner (Resident) *</label>
              <div className="relative" ref={ownerRef}>
                <button
                  type="button"
                  className={`input-default text-sm flex items-center justify-between ${formData.ownerName ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.ownerName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  onClick={() => setIsOwnerOpen(!isOwnerOpen)}
                >
                  <span className={formData.ownerName ? 'text-text-primary' : 'text-text-secondary'}>
                    {formData.ownerName || 'Select a resident'}
                  </span>
                  <div className="flex items-center gap-2">
                    {formData.ownerName && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    <ChevronDown className={`size-4 text-text-secondary transition-transform ${isOwnerOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {isOwnerOpen && (
                  <div className="absolute z-10 bg-bg-white border border-border-light rounded-lg shadow-lg w-full mt-1 max-h-[260px] overflow-y-auto scrollbar-hide">
                    {members.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-text-secondary">No residents found</div>
                    ) : (
                      members.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          className={`w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors ${formData.ownerName === member.name ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'}`}
                          onClick={() => handleOwnerSelect(member)}
                        >
                          <p className="leading-tight font-medium">{member.name}</p>
                          <p className="text-xs text-text-secondary">
                            {member.household?.unit ? `Unit ${member.household.unit}` : 'No unit assigned'} • CCCD: {member.cccd}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors.ownerName && <p className="text-xs text-red-500 mt-0.5">{errors.ownerName}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Apartment Unit *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.unit}
                  readOnly
                  className={`input-default text-sm pr-10 bg-bg-hover cursor-not-allowed ${formData.unit.trim().length > 0 ? 'border-green-500' : errors.unit ? 'border-red-500' : ''}`}
                  placeholder="Auto-filled from resident"
                />
                {formData.unit.trim().length > 0 && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {formData.unit.trim().length === 0 && errors.unit && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {errors.unit && <p className="text-xs text-red-500 mt-0.5">{errors.unit}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Phone Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleChange('phone', value);
                  }}
                  className={`input-default text-sm pr-16 ${formData.phone.length >= 10 && formData.phone.length <= 11 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Auto-filled from resident"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className={`text-xs ${formData.phone.length >= 10 && formData.phone.length <= 11 ? 'text-green-500' : 'text-text-muted'}`}>
                    {formData.phone.length}/10-11
                  </span>
                  {formData.phone.length >= 10 && formData.phone.length <= 11 && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {formData.phone.length > 0 && (formData.phone.length < 10 || formData.phone.length > 11) && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>}
            </div>
          </div>

          {/* Vehicle Column */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light space-y-5">
            <h3 className="font-semibold text-text-primary text-lg">Vehicle Details</h3>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Vehicle Type *</label>
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

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">License Plate</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => handleChange('licensePlate', e.target.value.toUpperCase())}
                  className={`input-default text-sm pr-10 ${formData.licensePlate.trim().length > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                  placeholder="e.g., ABC-1234"
                />
                {formData.licensePlate.trim().length > 0 && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Monthly Fee ($) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.monthlyFee}
                  onChange={(e) => handleChange('monthlyFee', e.target.value)}
                  className={`input-default text-sm pr-10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${formData.monthlyFee && parseFloat(formData.monthlyFee) > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.monthlyFee ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="e.g., 50"
                  min="0"
                  step="0.01"
                  required
                />
                {formData.monthlyFee && parseFloat(formData.monthlyFee) > 0 && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {formData.monthlyFee && parseFloat(formData.monthlyFee) <= 0 && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {errors.monthlyFee && <p className="text-xs text-red-500 mt-0.5">{errors.monthlyFee}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Status *</label>
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
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
          >
            <div className="relative size-5">
              <AddSquareIcon className="relative size-5" />
            </div>
            {slot ? 'Update Slot' : 'Add Slot'}
          </button>
        </div>
      </form>
    </div>
  );
}
