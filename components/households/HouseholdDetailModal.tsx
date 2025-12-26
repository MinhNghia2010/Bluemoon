import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Plus, UserMinus, Edit2, Building2, CalendarIcon, Maximize2, Layers, Phone, Mail, Check, X, Clock, Plane, Home, UserX } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DatePickerInput } from '../shared/DatePickerInput';
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

interface HouseholdMember {
  id: string;
  name: string;
  dateOfBirth: string;
  cccd: string;
  profilePic?: string | null;
  residenceType: 'permanent' | 'temporary';
  relationToOwner?: string | null;
  isOwner?: boolean;
  status: 'living' | 'moved_out' | 'deceased';
  moveInDate: string | null;
  moveOutDate: string | null;
  note: string | null;
  isTemporarilyAway?: boolean;
}

// Simplified member type for household prop (modal fetches full data separately)
interface HouseholdMemberBasic {
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
  members?: HouseholdMemberBasic[];
}

interface HouseholdDetailModalProps {
  household: Household | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onMembersChange?: () => void;
}

export function HouseholdDetailModal({ household, onClose, onEdit, onDelete, onMembersChange }: HouseholdDetailModalProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<HouseholdMember | null>(null);
  const [showRemoveMemberAlert, setShowRemoveMemberAlert] = useState(false);

  // Helper function to get residence status badge
  const getResidenceStatusBadge = (member: HouseholdMember) => {
    // If moved out, show moved out badge
    if (member.status === 'moved_out') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <UserX className="w-3 h-3" />
          Moved Out
        </span>
      );
    }

    // If temporarily away
    if (member.isTemporarilyAway) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          <Plane className="w-3 h-3" />
          Away
        </span>
      );
    }

    // Temporary resident
    if (member.residenceType === 'temporary') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Clock className="w-3 h-3" />
          Temporary
        </span>
      );
    }

    // Permanent resident (default)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <Home className="w-3 h-3" />
        Permanent
      </span>
    );
  };
  
  useEffect(() => {
    if (household?.id) {
      fetchMembers();
    } else {
      setMembers([]);
    }
  }, [household?.id]);

  const fetchMembers = async () => {
    if (!household) return;
    setMembersLoading(true);
    try {
      const res = await fetch(`/api/members?householdId=${household.id}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      const res = await fetch(`/api/members/${memberToRemove.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdId: null })
      });
      
      if (!res.ok) throw new Error('Failed to remove member');
      
      toast.success('Member removed from household');
      setShowRemoveMemberAlert(false);
      setMemberToRemove(null);
      fetchMembers();
      onMembersChange?.();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };
  
  if (!household) return null;

  const getStatusColor = (status: string, memberCount: number) => {
    // If no members, show as unoccupied with yellow color
    if (memberCount === 0) {
      return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', label: 'Unoccupied' };
    }
    
    switch (status) {
      case 'active': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Occupied' };
      case 'inactive': return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-text-secondary', label: 'Vacant' };
      case 'paid': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Occupied' };
      case 'pending': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', label: 'Occupied' };
      case 'overdue': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Occupied' };
      default: return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-text-secondary', label: status };
    }
  };

  const statusColor = getStatusColor(household.status, members.length);

  return (
    <Modal isOpen={!!household} onClose={onClose} maxWidth="800px">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary text-xl">Room {household.unit}</h3>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
                  {statusColor.label}
                </span>
              </div>
              <p className="text-text-secondary text-sm">{household.ownerName}</p>
            </div>
          </div>
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Edit2 className="w-4 h-4" />
            Edit Household
          </button>
        </div>

        {/* Info Grid - Icon next to stacked title/value, Golden Ratio: 13px → 21px */}
        <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
          <div className="bg-bg-hover rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Maximize2 className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[13px] text-text-secondary">Area</p>
              <p className="text-[21px] font-bold text-brand-primary leading-tight">
                {household.area ? `${household.area} m²` : '-'}
              </p>
            </div>
          </div>
          <div className="bg-bg-hover rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[13px] text-text-secondary">Floor</p>
              <p className="text-[21px] font-bold text-brand-primary leading-tight">
                {household.floor || '-'}
              </p>
            </div>
          </div>
          <div className="bg-bg-hover rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[13px] text-text-secondary">Move-in</p>
              <p className="text-[18px] font-bold text-brand-primary leading-tight">
                {household.moveInDate ? format(new Date(household.moveInDate), 'dd/MM/yy') : '-'}
              </p>
            </div>
          </div>
          <div className="bg-bg-hover rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[13px] text-text-secondary">Residents</p>
              <p className="text-[21px] font-bold text-brand-primary leading-tight">
                {household.residents || members.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info Row */}
        <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
          <div className="bg-bg-hover rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[13px] text-text-secondary">Phone</p>
              <p className="text-[18px] font-semibold text-text-primary leading-tight">{household.phone || '-'}</p>
            </div>
          </div>
          <div className="bg-bg-hover rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-[13px] text-text-secondary">Email</p>
              <p className="text-[18px] font-semibold text-text-primary leading-tight">{household.email || '-'}</p>
            </div>
          </div>
        </div>

        {/* Household Members Section */}
        <div className="bg-bg-hover/50 border border-border-light rounded-xl p-5 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-text-primary text-lg">Household Members</h4>
              <span className="bg-brand-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {members.length}
              </span>
            </div>
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          {membersLoading ? (
            <div className="text-center py-6 h-[180px] flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-text-secondary text-sm">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-6 h-[180px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 mb-3 rounded-full bg-bg-hover flex items-center justify-center">
                <UserMinus className="w-8 h-8 text-text-secondary" />
              </div>
              <p className="text-text-secondary">No members in this household</p>
              <p className="text-sm text-text-secondary mt-1">Add members to track residents</p>
            </div>
          ) : (
            <div className="h-[180px] overflow-y-auto space-y-3 pr-1 scrollbar-hide">
              {members.map(member => (
                <div key={member.id} className={`flex items-center justify-between p-4 bg-bg-white rounded-xl border border-border-light shadow-sm hover:shadow-md transition-shadow ${member.status === 'moved_out' ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-4">
                    {member.profilePic ? (
                      <img 
                        src={member.profilePic} 
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary/70 flex items-center justify-center shrink-0">
                        <span className="text-white font-semibold text-lg">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-text-primary text-base">{member.name}</p>
                        {member.isOwner && (
                          <span className="text-xs text-white bg-purple-500 px-2 py-0.5 rounded font-medium">
                            Owner
                          </span>
                        )}
                        {!member.isOwner && member.relationToOwner && (
                          <span className="text-xs text-text-secondary bg-bg-hover px-2 py-0.5 rounded capitalize">
                            {member.relationToOwner}
                          </span>
                        )}
                        {getResidenceStatusBadge(member)}
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-xs text-text-secondary">Date of Birth</span>
                          <p className="text-text-primary font-medium">{format(new Date(member.dateOfBirth), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <span className="text-xs text-text-secondary">CCCD</span>
                          <p className="text-text-primary font-medium">{member.cccd}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMemberToRemove(member);
                      setShowRemoveMemberAlert(true);
                    }}
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors border border-red-200 dark:border-red-800 shrink-0"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Button */}
        {onDelete && (
          <div className="mt-6 pt-6 border-t border-border-light">
            <button 
              onClick={() => setShowDeleteAlert(true)}
              className="w-full flex items-center justify-center gap-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Household
            </button>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        householdId={household.id}
        householdUnit={household.unit}
        onClose={() => setShowAddMember(false)}
        onSuccess={() => {
          fetchMembers();
          onMembersChange?.();
        }}
      />

      {/* Remove Member Confirmation */}
      <AlertDialog open={showRemoveMemberAlert} onOpenChange={setShowRemoveMemberAlert}>
        <AlertDialogContent className="bg-bg-white border-border-light">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">Remove Member</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              Are you sure you want to remove <span className="font-semibold">{memberToRemove?.name}</span> from this household?
              They will be unassigned but not deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Household Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-bg-white border-border-light p-0 overflow-hidden">
          <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <AlertDialogTitle className="text-white text-lg font-semibold">
                Delete Household
              </AlertDialogTitle>
              <p className="text-white/80 text-sm">This action is irreversible</p>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <AlertDialogDescription className="text-text-secondary text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-text-primary">Room {household.unit}</span>? 
              This will permanently remove all data including payment history and utility bills.
            </AlertDialogDescription>
          </div>

          <AlertDialogFooter className="px-6 py-4 bg-bg-hover border-t border-border-light">
            <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.();
                setShowDeleteAlert(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Modal>
  );
}

// Add Member Modal Component
interface AddMemberModalProps {
  isOpen: boolean;
  householdId: string;
  householdUnit: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddMemberModal({ isOpen, householdId, householdUnit, onClose, onSuccess }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: undefined as Date | undefined,
    cccd: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.cccd.trim()) newErrors.cccd = 'CCCD is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          dateOfBirth: formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : '',
          cccd: formData.cccd,
          householdId
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add member');
      }

      toast.success('Member added successfully');
      setFormData({ name: '', dateOfBirth: undefined, cccd: '' });
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-xl font-semibold text-text-primary mb-2">Add Member to Room {householdUnit}</h3>
      <p className="text-text-secondary text-sm mb-6">Register a new resident for this household</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Full Name *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="Enter full name"
              className={`input-default text-sm pr-10 ${formData.name.trim().length >= 2 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {formData.name.trim().length >= 2 && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
            )}
            {formData.name.trim().length > 0 && formData.name.trim().length < 2 && (
              <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
            )}
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Date of Birth *</label>
          <DatePickerInput
            value={formData.dateOfBirth}
            onChange={(date) => {
              setFormData(prev => ({ ...prev, dateOfBirth: date }));
              if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: '' }));
            }}
            disabled={(date) => date > new Date()}
            error={!!errors.dateOfBirth}
            placeholder="dd/mm/yyyy"
            showValidation={true}
          />
          {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">CCCD *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.cccd}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length <= 12) {
                  setFormData(prev => ({ ...prev, cccd: value }));
                  if (errors.cccd) setErrors(prev => ({ ...prev, cccd: '' }));
                }
              }}
              maxLength={12}
              placeholder="12-digit identification number"
              className={`input-default text-sm pr-16 ${formData.cccd.length === 12 ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : errors.cccd ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className={`text-xs ${formData.cccd.length === 12 ? 'text-green-500' : 'text-text-muted'}`}>
                {formData.cccd.length}/12
              </span>
              {formData.cccd.length === 12 && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              {formData.cccd.length > 0 && formData.cccd.length !== 12 && (
                <X className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          {errors.cccd && <p className="mt-1 text-sm text-red-500">{errors.cccd}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
