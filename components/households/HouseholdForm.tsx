'use client'

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, ChevronDown, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { DatePickerInput } from '../shared/DatePickerInput';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface HouseholdMember {
  id: string;
  name: string;
  profilePic?: string | null;
}

interface Household {
  id: string;
  unit: string;
  ownerName: string;
  ownerId?: string | null;
  owner?: HouseholdMember | null;
  residents: number;
  area?: number | null;
  floor?: number | null;
  moveInDate?: string | null;
  status: 'paid' | 'pending' | 'overdue';
  balance: number;
  phone: string;
  email: string;
  members?: HouseholdMember[];
}

interface HouseholdFormProps {
  household: Household | null;
  onSave: (data: Partial<Household> & { ownerId?: string | null }) => void;
  onCancel: () => void;
}

export function HouseholdForm({ household, onSave, onCancel }: HouseholdFormProps) {
  // Extract floor from unit (e.g., "301" -> floor 3)
  const getFloorFromUnit = (unit: string) => {
    if (!unit || unit.length < 1) return '';
    const firstChar = unit.charAt(0);
    return /\d/.test(firstChar) ? firstChar : '';
  };

  const [formData, setFormData] = useState({
    unit: '',
    ownerId: null as string | null,
    area: '',
    floor: '',
    moveInDate: undefined as Date | undefined,
    phone: '',
    email: ''
  });
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const [unitDuplicateError, setUnitDuplicateError] = useState<string | null>(null);
  const [isCheckingUnit, setIsCheckingUnit] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch members when editing a household
  useEffect(() => {
    if (household?.id) {
      fetch(`/api/members?householdId=${household.id}`)
        .then(res => res.json())
        .then(data => {
          // Filter to only living members
          const livingMembers = data.filter((m: any) => m.status === 'living');
          setMembers(livingMembers);
        })
        .catch(err => console.error('Failed to fetch members:', err));
    }
  }, [household?.id]);

  // Check for duplicate unit number
  const checkDuplicateUnit = useCallback(async (unit: string) => {
    if (!unit.trim()) {
      setUnitDuplicateError(null);
      return;
    }

    setIsCheckingUnit(true);
    try {
      const url = household?.id 
        ? `/api/households?checkUnit=${encodeURIComponent(unit)}&excludeId=${household.id}`
        : `/api/households?checkUnit=${encodeURIComponent(unit)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setUnitDuplicateError('This room number already exists');
        } else {
          setUnitDuplicateError(null);
        }
      }
    } catch (error) {
      console.error('Failed to check unit:', error);
    } finally {
      setIsCheckingUnit(false);
    }
  }, [household?.id]);

  // Debounce unit check
  useEffect(() => {
    const timer = setTimeout(() => {
      checkDuplicateUnit(formData.unit);
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.unit, checkDuplicateUnit]);

  useEffect(() => {
    if (household) {
      setFormData({
        unit: household.unit,
        ownerId: household.ownerId || null,
        area: household.area?.toString() || '',
        floor: household.floor?.toString() || getFloorFromUnit(household.unit),
        moveInDate: household.moveInDate ? new Date(household.moveInDate) : undefined,
        phone: household.phone,
        email: household.email
      });
    }
  }, [household]);

  // Handle unit change - auto-fill floor
  const handleUnitChange = (value: string) => {
    const floor = getFloorFromUnit(value);
    setFormData(prev => ({
      ...prev,
      unit: value,
      floor: floor
    }));
    if (errors.unit) {
      setErrors(prev => ({ ...prev, unit: '' }));
    }
  };

  // Validate unit format (X00 where X is floor digit)
  const isValidUnitFormat = (unit: string) => {
    return /^\d{3}$/.test(unit); // 3-digit format like 101, 301, etc.
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit number is required';
    } else if (!isValidUnitFormat(formData.unit)) {
      newErrors.unit = 'Unit must be 3 digits (e.g., 101, 301)';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (unitDuplicateError) {
      return; // Don't submit if there's a duplicate error
    }
    onSave({
      unit: formData.unit,
      ownerId: formData.ownerId,
      area: formData.area ? parseFloat(formData.area) : null,
      floor: formData.floor ? parseInt(formData.floor) : null,
      moveInDate: formData.moveInDate ? format(formData.moveInDate, 'yyyy-MM-dd') : null,
      phone: formData.phone,
      email: formData.email
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const selectedOwner = members.find(m => m.id === formData.ownerId);

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-text-primary mb-2">
          {household ? 'Edit Household' : 'Add New Household'}
        </h1>
        <p className="text-base text-text-secondary">
          {household ? 'Update household information' : 'Register a new household'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Household Details */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light space-y-5">
            <h3 className="font-semibold text-text-primary text-lg">Household Details</h3>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Unit Number * <span className="text-text-secondary font-normal">(Format: X00)</span></label>
              <div className="relative">
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  placeholder="e.g., 101, 301"
                  maxLength={3}
                  className={`input-default text-sm pr-10 ${
                    unitDuplicateError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : isValidUnitFormat(formData.unit) && !unitDuplicateError
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : errors.unit 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : ''
                  }`}
                />
                {isCheckingUnit && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                )}
                {!isCheckingUnit && isValidUnitFormat(formData.unit) && !unitDuplicateError && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {!isCheckingUnit && (unitDuplicateError || (formData.unit && !isValidUnitFormat(formData.unit))) && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {unitDuplicateError && <p className="text-xs text-red-500 mt-2">{unitDuplicateError}</p>}
              {!unitDuplicateError && errors.unit && (
                <p className="mt-2 text-sm text-red-500">{errors.unit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Owner {household ? '' : '(Add members first)'}</label>
              {household ? (
                <Popover open={ownerDropdownOpen} onOpenChange={setOwnerDropdownOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`input-default text-sm flex items-center justify-between w-full ${selectedOwner ? 'border-green-500' : ''}`}
                    >
                      <span className={selectedOwner ? 'text-text-primary' : 'text-text-secondary'}>
                        {selectedOwner ? selectedOwner.name : (members.length > 0 ? 'Select owner' : 'No members available')}
                      </span>
                      <ChevronDown className="w-4 h-4 text-text-secondary" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-bg-white border-border-light" align="start">
                    <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, ownerId: null }));
                          setOwnerDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-bg-hover transition-colors border-b border-border-light ${!formData.ownerId ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-secondary'}`}
                      >
                        No owner
                      </button>
                      {members.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, ownerId: member.id }));
                            setOwnerDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-bg-hover transition-colors border-b border-border-light last:border-b-0 flex items-center gap-3 ${formData.ownerId === member.id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'}`}
                        >
                          {member.profilePic ? (
                            <img src={member.profilePic} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-brand-primary" />
                            </div>
                          )}
                          <span>{member.name}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="text-sm text-text-secondary italic py-3">
                  Create the household first, then add members and set an owner.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Area (m²)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g., 70"
                    className={`input-default text-sm pr-10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${formData.area && parseFloat(formData.area) > 0 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
                  />
                  {formData.area && parseFloat(formData.area) > 0 && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Floor</label>
                <div className="relative">
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor ? `Floor ${formData.floor}` : ''}
                    readOnly
                    placeholder="Auto-filled from room"
                    className="input-default text-sm bg-bg-hover cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1">Auto-filled from room number</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Move-in Date</label>
              <DatePickerInput
                value={formData.moveInDate}
                onChange={(date) => setFormData(prev => ({ ...prev, moveInDate: date }))}
                placeholder="dd/mm/yyyy"
                showValidation={true}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-bg-white rounded-[16px] p-8 shadow-lg border border-border-light space-y-5">
            <h3 className="font-semibold text-text-primary text-lg">Contact</h3>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Phone Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, phone: value }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="e.g., 0912345678"
                  className={`input-default text-sm pr-16 ${formData.phone.length >= 10 && formData.phone.length <= 11 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
              {errors.phone && (
                <p className="mt-0.5 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., john@example.com"
                  className={`input-default text-sm pr-10 ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
                {formData.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
              {errors.email && (
                <p className="mt-0.5 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
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
            <Plus className="w-4 h-4" />
            {household ? 'Update Household' : 'Add Household'}
          </button>
        </div>
      </form>
    </div>
  );
}



