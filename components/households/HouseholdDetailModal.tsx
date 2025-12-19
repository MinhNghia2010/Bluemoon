import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Plus, UserMinus, Edit2, Building2, CalendarIcon } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  members?: HouseholdMember[];
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
  const [memberToRemove, setMemberToRemove] = useState<HouseholdMember | null>(null);
  const [showRemoveMemberAlert, setShowRemoveMemberAlert] = useState(false);
  
  useEffect(() => {
    if (household?.id) {
      fetchMembers();
    }
  }, [household?.id]);

  const fetchMembers = async () => {
    if (!household) return;
    try {
      const res = await fetch(`/api/members?householdId=${household.id}`);
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Occupied' };
      case 'inactive': return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-text-secondary', label: 'Vacant' };
      case 'paid': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Occupied' };
      case 'pending': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', label: 'Occupied' };
      case 'overdue': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Occupied' };
      default: return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-text-secondary', label: status };
    }
  };

  const statusColor = getStatusColor(household.status);

  return (
    <Modal isOpen={!!household} onClose={onClose} maxWidth="800px">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-xl">Room {household.unit}</h3>
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

        {/* Info Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6 shrink-0">
          <div className="bg-bg-hover rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-2">Area</p>
            <p className="text-xl font-bold text-brand-primary">
              {household.area ? `${household.area}` : '-'}
            </p>
            {household.area && <p className="text-xs text-text-secondary">m²</p>}
          </div>
          <div className="bg-bg-hover rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-2">Floor</p>
            <p className="text-xl font-bold text-brand-primary">
              {household.floor || '-'}
            </p>
          </div>
          <div className="bg-bg-hover rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-2">Status</p>
            <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
              {statusColor.label}
            </span>
          </div>
          <div className="bg-bg-hover rounded-xl p-4 text-center">
            <p className="text-xs text-text-secondary mb-2">Move-in Date</p>
            <p className="text-base font-bold text-brand-primary">
              {household.moveInDate ? format(new Date(household.moveInDate), 'MMM d, yyyy') : '-'}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
          <div className="bg-bg-hover rounded-xl p-4">
            <p className="text-xs text-text-secondary mb-1">Phone</p>
            <p className="text-sm font-medium text-text-primary">{household.phone || '-'}</p>
          </div>
          <div className="bg-bg-hover rounded-xl p-4">
            <p className="text-xs text-text-secondary mb-1">Email</p>
            <p className="text-sm font-medium text-text-primary">{household.email || '-'}</p>
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

          {members.length === 0 ? (
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
                <div key={member.id} className="flex items-center justify-between p-4 bg-bg-white rounded-xl border border-border-light shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary/70 flex items-center justify-center shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-base">{member.name}</p>
                      <div className="flex gap-6 text-sm mt-1">
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
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            placeholder="Enter full name"
            className={`input-default text-sm ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Date of Birth *</label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`input-default text-sm flex items-center justify-between ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              >
                <span className={formData.dateOfBirth ? 'text-text-primary' : 'text-text-secondary'}>
                  {formData.dateOfBirth ? format(formData.dateOfBirth, 'PPP') : 'Select date of birth'}
                </span>
                <CalendarIcon className="size-4 text-text-secondary" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-bg-white border-border-light" align="start">
              <Calendar
                mode="single"
                selected={formData.dateOfBirth}
                onSelect={(date) => {
                  setFormData(prev => ({ ...prev, dateOfBirth: date }));
                  if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: '' }));
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">CCCD *</label>
          <input
            type="text"
            value={formData.cccd}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, cccd: e.target.value }));
              if (errors.cccd) setErrors(prev => ({ ...prev, cccd: '' }));
            }}
            placeholder="12-digit identification number"
            className={`input-default text-sm ${errors.cccd ? 'border-red-500' : ''}`}
          />
          {errors.cccd && <p className="mt-1 text-sm text-red-500">{errors.cccd}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
