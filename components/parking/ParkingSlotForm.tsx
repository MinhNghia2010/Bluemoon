'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Car, Bike, Motorbike, Check, X, Plus, AlertCircle, User, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { ParkingSlot } from '../ParkingView';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface Member {
  id: string;
  name: string;
  cccd: string;
  status: string;
  residenceType: string;
  householdId?: string | null;
  household?: { id: string; unit: string; phone: string } | null;
}

// Vehicle pricing
const VEHICLE_PRICES = {
  car: 20,
  motorcycle: 5,
  bicycle: 0
};

interface ParkingSlotFormProps {
  slot: ParkingSlot | null;
  onSave: (data: Partial<ParkingSlot>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  totalSlots?: number;
  maxSlots?: number;
}

export function ParkingSlotForm({ slot, onSave, onCancel, onDelete, totalSlots = 0, maxSlots = 500 }: ParkingSlotFormProps) {
  const [formData, setFormData] = useState({
    slotNumber: slot?.slotNumber || '',
    unit: slot?.unit || '',
    ownerName: slot?.ownerName || '',
    vehicleType: slot?.vehicleType || 'car',
    licensePlate: slot?.licensePlate || '',
    monthlyFee: slot?.monthlyFee?.toString() || VEHICLE_PRICES.car.toString(),
    status: slot?.status || 'active',
    phone: slot?.phone || '',
    householdId: slot?.householdId || '',
    memberId: '',
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [isVehicleTypeOpen, setIsVehicleTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [slotDuplicateError, setSlotDuplicateError] = useState<string | null>(null);
  const [isCheckingSlot, setIsCheckingSlot] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showParkingFullAlert, setShowParkingFullAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const memberRef = useRef<HTMLDivElement>(null);
  const vehicleTypeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Fetch members on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/members');
        if (res.ok) {
          const data = await res.json();
          // Include all members - any resident can own a vehicle
          setMembers(data);
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    };
    fetchMembers();
  }, []);

  // Check for duplicate slot number
  const checkDuplicateSlot = useCallback(async (slotNumber: string) => {
    if (!slotNumber.trim()) {
      setSlotDuplicateError(null);
      return;
    }

    setIsCheckingSlot(true);
    try {
      const url = slot?.id 
        ? `/api/parking?checkSlot=${encodeURIComponent(slotNumber)}&excludeId=${slot.id}`
        : `/api/parking?checkSlot=${encodeURIComponent(slotNumber)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setSlotDuplicateError('This slot number already exists');
        } else {
          setSlotDuplicateError(null);
        }
      }
    } catch (error) {
      console.error('Failed to check slot:', error);
    } finally {
      setIsCheckingSlot(false);
    }
  }, [slot?.id]);

  // Debounce slot number check
  useEffect(() => {
    const timer = setTimeout(() => {
      checkDuplicateSlot(formData.slotNumber);
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.slotNumber, checkDuplicateSlot]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (memberRef.current && !memberRef.current.contains(event.target as Node)) {
        setIsMemberOpen(false);
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

  const handleMemberSelect = (member: Member) => {
    setFormData(prev => ({
      ...prev,
      memberId: member.id,
      ownerName: member.name,
      unit: member.household?.unit || '',
      phone: member.household?.phone || '',
      householdId: member.householdId || '',
    }));
    setIsMemberOpen(false);
    if (errors.memberId) {
      setErrors(prev => ({ ...prev, memberId: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (slotDuplicateError) {
      toast.error('Please fix the duplicate slot number error');
      return;
    }

    // Check if parking is full when adding a new slot
    if (!slot && totalSlots >= maxSlots) {
      setShowParkingFullAlert(true);
      return;
    }

    onSave({
      ...formData,
      monthlyFee: parseFloat(formData.monthlyFee),
      householdId: formData.householdId || undefined,
      memberId: formData.memberId || undefined,
    });
    
    if (slot) {
      toast.success('Parking slot updated successfully!');
    } else {
      toast.success('Parking slot added successfully!');
    }
  };

  const handleDeleteSlot = async () => {
    if (!slot || !onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(slot.id);
      toast.success('Parking slot deleted successfully!');
      setShowDeleteAlert(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete parking slot');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle vehicle type change - auto-update price
  const handleVehicleTypeChange = (type: 'car' | 'motorcycle' | 'bicycle') => {
    const price = VEHICLE_PRICES[type];
    setFormData(prev => ({
      ...prev,
      vehicleType: type,
      monthlyFee: price.toString()
    }));
    setIsVehicleTypeOpen(false);
  };

  // Handle slot number change with format validation A-000
  const handleSlotNumberChange = (value: string) => {
    // Auto-format to A-000 pattern
    let formatted = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Auto-insert hyphen after first letter
    if (formatted.length === 1 && /[A-Z]/.test(formatted)) {
      formatted = formatted;
    } else if (formatted.length === 2 && /^[A-Z][0-9]$/.test(formatted)) {
      formatted = formatted.charAt(0) + '-' + formatted.charAt(1);
    } else if (formatted.length > 1 && !formatted.includes('-') && /^[A-Z]/.test(formatted)) {
      formatted = formatted.charAt(0) + '-' + formatted.slice(1);
    }
    
    // Limit to A-000 format (max 5 chars)
    if (formatted.length > 5) {
      formatted = formatted.slice(0, 5);
    }
    
    handleChange('slotNumber', formatted);
  };

  // Validate slot number format A-000
  const isValidSlotFormat = (slot: string) => {
    return /^[A-Z]-\d{3}$/.test(slot);
  };

  const vehicleTypes = [
    { value: 'car', label: 'Car', icon: Car, price: VEHICLE_PRICES.car },
    { value: 'motorcycle', label: 'Motorcycle', icon: Motorbike, price: VEHICLE_PRICES.motorcycle },
    { value: 'bicycle', label: 'Bicycle', icon: Bike, price: VEHICLE_PRICES.bicycle },
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

    if (!formData.slotNumber.trim()) {
      newErrors.slotNumber = 'Slot number is required';
    } else if (!isValidSlotFormat(formData.slotNumber)) {
      newErrors.slotNumber = 'Slot must be in format A-000 (e.g., A-001)';
    }
    if (!formData.memberId) {
      newErrors.memberId = 'Vehicle owner is required';
    }
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';

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
          {/* Slot & Owner Column */}
          <div className="bg-bg-white rounded-2xl p-8 shadow-lg border border-border-light space-y-5">
            <h3 className="font-semibold text-text-primary text-lg">Slot & Owner</h3>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Slot Number * <span className="text-text-secondary font-normal">(Format: A-000)</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.slotNumber}
                  onChange={(e) => handleSlotNumberChange(e.target.value)}
                  className={`input-default text-sm pr-10 ${
                    slotDuplicateError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : isValidSlotFormat(formData.slotNumber) 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : errors.slotNumber 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : ''
                  }`}
                  placeholder="e.g., A-001"
                  required
                />
                {isCheckingSlot && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                )}
                {!isCheckingSlot && isValidSlotFormat(formData.slotNumber) && !slotDuplicateError && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {!isCheckingSlot && (slotDuplicateError || (formData.slotNumber && !isValidSlotFormat(formData.slotNumber))) && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {slotDuplicateError && <p className="text-xs text-red-500 mt-2">{slotDuplicateError}</p>}
              {!slotDuplicateError && errors.slotNumber && <p className="text-xs text-red-500 mt-2">{errors.slotNumber}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Vehicle Owner *</label>
              <div className="relative" ref={memberRef}>
                <button
                  type="button"
                  className={`input-default text-sm flex items-center justify-between ${formData.ownerName ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.memberId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  onClick={() => setIsMemberOpen(!isMemberOpen)}
                >
                  <div className="flex items-center gap-2">
                    {formData.ownerName ? (
                      <>
                        <User className="w-4 h-4 text-brand-primary" />
                        <span className="text-text-primary">{formData.ownerName}</span>
                        {formData.unit && (
                          <span className="text-text-secondary text-xs">(Room {formData.unit})</span>
                        )}
                      </>
                    ) : (
                      <span className="text-text-secondary">Select vehicle owner</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.ownerName && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    <ChevronDown className={`size-4 text-text-secondary transition-transform ${isMemberOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {isMemberOpen && (
                  <div className="absolute z-10 bg-bg-white border border-border-light rounded-lg shadow-lg w-full mt-1 max-h-[260px] overflow-y-auto scrollbar-hide">
                    {members.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-text-secondary">No members found</div>
                    ) : (
                      members.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          className={`w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors ${formData.memberId === member.id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'}`}
                          onClick={() => handleMemberSelect(member)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-brand-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="leading-tight font-medium">{member.name}</p>
                                {member.status === 'moved_out' && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Moved Out</span>
                                )}
                                {member.residenceType === 'temporary' && (
                                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Temp</span>
                                )}
                              </div>
                              <p className="text-xs text-text-secondary">
                                {member.household?.unit ? `Room ${member.household.unit}` : member.status === 'moved_out' ? 'No current room' : 'No room assigned'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors.memberId && <p className="text-xs text-red-500 mt-0.5">{errors.memberId}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Phone</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.phone}
                  readOnly
                  className="input-default text-sm bg-bg-hover cursor-not-allowed"
                  placeholder="Auto-filled from owner"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Column */}
          <div className="bg-bg-white rounded-2xl p-8 shadow-lg border border-border-light space-y-5">
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
                    <span className="text-text-secondary text-xs">
                      (${VEHICLE_PRICES[formData.vehicleType as keyof typeof VEHICLE_PRICES]}/month)
                    </span>
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
                          className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm transition-colors flex items-center justify-between ${
                            formData.vehicleType === type.value ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'
                          }`}
                          onClick={() => handleVehicleTypeChange(type.value as 'car' | 'motorcycle' | 'bicycle')}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="size-4" />
                            {type.label}
                          </div>
                          <span className={`text-xs ${type.price === 0 ? 'text-green-600 font-medium' : 'text-text-secondary'}`}>
                            {type.price === 0 ? 'Free' : `$${type.price}/month`}
                          </span>
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
              <label className="text-sm font-medium text-text-primary mb-2 block">Monthly Fee ($)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.monthlyFee}
                  readOnly
                  className="input-default text-sm pr-10 bg-bg-hover cursor-not-allowed"
                  placeholder="Auto-set by vehicle type"
                  min="0"
                  step="0.01"
                />
                {parseFloat(formData.monthlyFee) === 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">Free</span>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-1">Price is set automatically based on vehicle type</p>
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
        <div className="flex gap-3 justify-between">
          <div>
            {slot && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteAlert(true)}
                className="flex items-center gap-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Vehicle
              </button>
            )}
          </div>
          <div className="flex gap-3">
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
              <Plus className="w-5 h-5" />
              {slot ? 'Update Slot' : 'Add Slot'}
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-bg-white border-border-light p-0 overflow-hidden">
          <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <AlertDialogTitle className="text-white text-lg font-semibold">
                Delete Parking Slot
              </AlertDialogTitle>
              <p className="text-white/80 text-sm">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <AlertDialogDescription className="text-text-secondary text-sm leading-relaxed">
              Are you sure you want to delete parking slot <span className="font-semibold text-text-primary">{slot?.slotNumber}</span>?
              {slot?.licensePlate && (
                <>
                  <br /><br />
                  Vehicle with license plate <span className="font-semibold text-text-primary">{slot.licensePlate}</span> will be unregistered.
                </>
              )}
            </AlertDialogDescription>
          </div>

          <AlertDialogFooter className="px-6 py-4 bg-bg-hover border-t border-border-light">
            <AlertDialogCancel className="btn-secondary" disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteSlot();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              The parking area has reached its maximum capacity of <span className="font-semibold text-text-primary">{maxSlots}</span> vehicles.
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
