'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Edit2, Trash2, Users, AlertTriangle, ChevronDown, Check, X, Home, Clock, UserX, Plane, User, Plus } from 'lucide-react'
import { PageHeader } from './shared/PageHeader'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { DatePickerInput } from './shared/DatePickerInput'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { FilterButtons } from './shared/FilterButtons'

interface TemporaryAbsence {
  id: string
  startDate: string
  endDate: string | null
  reason: string | null
  destination: string | null
  status: string
}

interface HouseholdMember {
  id: string
  name: string
  dateOfBirth: string
  cccd: string
  profilePic?: string | null
  householdId: string | null
  residenceType: 'permanent' | 'temporary'
  relationToOwner: string | null
  status: 'living' | 'moved_out' | 'deceased'
  moveInDate: string | null
  moveOutDate: string | null
  note: string | null
  household: {
    id: string
    unit: string
    ownerId: string | null
  } | null
  ownedHousehold?: {
    id: string
    unit: string
  } | null
  isOwner?: boolean
  isTemporarilyAway?: boolean
  activeTemporaryAbsence?: TemporaryAbsence | null
}

interface Household {
  id: string
  unit: string
  ownerName: string
  ownerId?: string | null
}

// Get initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('bluemoon-demography-state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
};

// Skeleton for a single member row
const MemberRowSkeleton = () => (
  <tr className="border-b border-border-light animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6"></div></td>
    <td className="px-6 py-4">
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
    <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div></td>
    <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div></td>
    <td className="px-6 py-4">
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </td>
  </tr>
);

// Lazy row wrapper for viewport-based loading
function LazyMemberRow({ 
  member, 
  index,
  onEdit,
  onDelete,
  getStatusBadge
}: { 
  member: HouseholdMember;
  index: number;
  onEdit: (member: HouseholdMember) => void;
  onDelete: (member: HouseholdMember) => void;
  getStatusBadge: (member: HouseholdMember) => React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLTableRowElement>(null);

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

  if (!isVisible) {
    return (
      <tr ref={ref} className="border-b border-border-light animate-pulse">
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6"></div></td>
        <td className="px-6 py-4">
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
        <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div></td>
        <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div></td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr ref={ref} className={`border-b border-border-light last:border-b-0 hover:bg-bg-hover/50 transition-colors ${member.status === 'moved_out' ? 'opacity-60' : ''}`}>
      <td className="px-6 py-4 text-sm text-text-secondary">{index + 1}</td>
      <td className="px-6 py-4">
        <div>
          <span className="font-medium text-text-primary">{member.name}</span>
          <p className="text-xs text-text-secondary">
            {format(new Date(member.dateOfBirth), 'MMM d, yyyy')}
          </p>
        </div>
      </td>
      <td className="px-6 py-4">
        {member.household ? (
          <span className="text-brand-primary font-medium">{member.household.unit}</span>
        ) : (
          <span className="text-text-secondary">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {member.isOwner ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            <User className="w-3 h-3" />
            Owner
          </span>
        ) : (
          <span className="text-sm text-text-secondary">Member</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-text-secondary font-mono">{member.cccd}</td>
      <td className="px-6 py-4">
        {getStatusBadge(member)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(member)}
            className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-secondary hover:text-brand-primary"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-text-secondary hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function DemographyView() {
  const initialState = getInitialState();
  
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialState?.searchTerm || '')
  const [showForm, setShowForm] = useState(initialState?.showForm || false)
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<HouseholdMember | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'living' | 'moved_out'>(initialState?.statusFilter || 'all')
  const [residenceTypeFilter, setResidenceTypeFilter] = useState<'all' | 'permanent' | 'temporary'>(initialState?.residenceTypeFilter || 'all')
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(initialState?.editingMemberId || null)
  
  // Owner transfer state
  const [showOwnerTransferDialog, setShowOwnerTransferDialog] = useState(false)
  const [pendingMoveOutData, setPendingMoveOutData] = useState<any>(null)
  const [selectedNewOwner, setSelectedNewOwner] = useState<string>('')

  // Save view state to localStorage
  useEffect(() => {
    const state = {
      showForm,
      editingMemberId: editingMember?.id || null,
      statusFilter,
      residenceTypeFilter,
      searchTerm
    };
    localStorage.setItem('bluemoon-demography-state', JSON.stringify(state));
  }, [showForm, editingMember?.id, statusFilter, residenceTypeFilter, searchTerm]);

  // Restore editing member after data loads
  useEffect(() => {
    if (pendingMemberId && members.length > 0) {
      const member = members.find(m => m.id === pendingMemberId);
      if (member) {
        setEditingMember(member);
      }
      setPendingMemberId(null);
    }
  }, [members, pendingMemberId]);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([])

  useEffect(() => {
    fetchMembers()
    fetchHouseholds()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const fetchHouseholds = async () => {
    try {
      const res = await fetch('/api/households')
      const data = await res.json()
      setHouseholds(data)
    } catch (error) {
      console.error('Error fetching households:', error)
    }
  }

  const handleSave = async (data: any) => {
    try {
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members'
      const method = editingMember ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!res.ok) {
        // Check if owner moving out requires selecting new owner
        if (result.requiresNewOwner) {
          // Fetch household members to select new owner
          const membersRes = await fetch(`/api/members?householdId=${result.householdId}`)
          const householdMembersData = await membersRes.json()
          // Filter out the current owner and only show living members
          const eligibleMembers = householdMembersData.filter(
            (m: HouseholdMember) => m.id !== editingMember?.id && m.status === 'living'
          )
          
          if (eligibleMembers.length === 0) {
            toast.error('Cannot move out the owner - no other living members in the household. Add a new member first or transfer ownership.')
            return
          }
          
          setHouseholdMembers(eligibleMembers)
          setPendingMoveOutData(data)
          setShowOwnerTransferDialog(true)
          return
        }
        throw new Error(result.error || 'Failed to save member')
      }

      // Check if owner was changed and payments were deleted
      if (result.ownerChanged) {
        toast.success('Owner moved out. New owner assigned and pending payments have been cleared.')
      } else {
        toast.success(editingMember ? 'Member updated successfully' : 'Member added successfully')
      }
      
      setShowForm(false)
      setEditingMember(null)
      fetchMembers()
      fetchHouseholds() // Refresh households to get updated owner name
    } catch (error) {
      console.error('Error saving member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save member')
    }
  }

  const handleOwnerTransfer = async () => {
    if (!selectedNewOwner || !pendingMoveOutData || !editingMember) return

    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pendingMoveOutData,
          newOwnerId: selectedNewOwner
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to transfer ownership')
      }

      toast.success('Owner moved out successfully. New owner assigned and pending payments have been cleared.')
      setShowOwnerTransferDialog(false)
      setPendingMoveOutData(null)
      setSelectedNewOwner('')
      setHouseholdMembers([])
      setShowForm(false)
      setEditingMember(null)
      fetchMembers()
      fetchHouseholds()
    } catch (error) {
      console.error('Error transferring ownership:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to transfer ownership')
    }
  }

  const handleDelete = async () => {
    if (!memberToDelete) return

    try {
      const res = await fetch(`/api/members/${memberToDelete.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete member')

      toast.success('Member deleted successfully')
      setDeleteDialogOpen(false)
      setMemberToDelete(null)
      fetchMembers()
    } catch (error) {
      console.error('Error deleting member:', error)
      toast.error('Failed to delete member')
    }
  }

  const filteredMembers = members.filter(member => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = (
      member.name.toLowerCase().includes(search) ||
      member.cccd.toLowerCase().includes(search) ||
      (member.household?.unit || '').toLowerCase().includes(search) ||
      format(new Date(member.dateOfBirth), 'MMM d, yyyy').toLowerCase().includes(search)
    )
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    const matchesResidenceType = residenceTypeFilter === 'all' || member.residenceType === residenceTypeFilter
    
    return matchesSearch && matchesStatus && matchesResidenceType
  }).sort((a, b) => {
    // Sort by room number (household unit)
    const unitA = a.household?.unit || '999'
    const unitB = b.household?.unit || '999'
    return unitA.localeCompare(unitB, undefined, { numeric: true })
  })

  // Statistics for filter buttons
  const stats = {
    all: members.length,
    living: members.filter(m => m.status === 'living').length,
    moved_out: members.filter(m => m.status === 'moved_out').length,
    permanent: members.filter(m => m.residenceType === 'permanent').length,
    temporary: members.filter(m => m.residenceType === 'temporary').length
  }

  const statusFilterButtons = [
    { id: 'all', label: 'All', count: stats.all },
    { id: 'living', label: 'Currently Living', count: stats.living },
    { id: 'moved_out', label: 'Moved Out', count: stats.moved_out }
  ]

  const getStatusBadge = (member: HouseholdMember) => {
    if (member.status === 'moved_out') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <UserX className="w-3 h-3" />
          Moved Out
        </span>
      )
    }
    
    if (member.isTemporarilyAway) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          <Plane className="w-3 h-3" />
          Away
        </span>
      )
    }

    if (member.residenceType === 'temporary') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Clock className="w-3 h-3" />
          Temporary
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <Home className="w-3 h-3" />
        Permanent
      </span>
    )
  }

  if (showForm) {
    return (
      <MemberForm
        member={editingMember}
        households={households}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false)
          setEditingMember(null)
        }}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Demography"
        description="View and search all residents in the building"
        buttonLabel="Add Person"
        onButtonClick={() => setShowForm(true)}
      />

      {/* Filters */}
      <FilterButtons
        filters={statusFilterButtons}
        activeFilter={statusFilter}
        onFilterChange={(id) => setStatusFilter(id as typeof statusFilter)}
        variant="primary"
      />

      {/* Secondary Filter - Residence Type */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setResidenceTypeFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            residenceTypeFilter === 'all'
              ? 'bg-brand-primary text-white'
              : 'bg-bg-hover text-text-secondary hover:bg-bg-hover/80'
          }`}
        >
          All Types
        </button>
        <button
          onClick={() => setResidenceTypeFilter('permanent')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            residenceTypeFilter === 'permanent'
              ? 'bg-green-600 text-white'
              : 'bg-bg-hover text-text-secondary hover:bg-bg-hover/80'
          }`}
        >
          Permanent ({stats.permanent})
        </button>
        <button
          onClick={() => setResidenceTypeFilter('temporary')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            residenceTypeFilter === 'temporary'
              ? 'bg-blue-600 text-white'
              : 'bg-bg-hover text-text-secondary hover:bg-bg-hover/80'
          }`}
        >
          Temporary ({stats.temporary})
        </button>
      </div>

      {/* Search */}
      <div className="bg-bg-white rounded-2xl p-6 shadow-lg border border-border-light mb-6">
        <div className="relative input-default">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name, room, or CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-sm w-100 border-0 outline-none bg-transparent caret-brand-primary placeholder:text-text-secondary"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-secondary mb-4">
        Showing {filteredMembers.length} of {members.length} residents
      </p>

      {/* Table */}
      <div className="bg-bg-white rounded-2xl shadow-lg border border-border-light overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary">Loading...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No residents found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-bg-hover border-b border-border-light">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">#</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Room</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Role</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">CCCD</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <LazyMemberRow
                  key={member.id}
                  member={member}
                  index={index}
                  onEdit={(m) => {
                    setEditingMember(m)
                    setShowForm(true)
                  }}
                  onDelete={(m) => {
                    setMemberToDelete(m)
                    setDeleteDialogOpen(true)
                  }}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-bg-white border-border-light p-0 overflow-hidden">
          <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <AlertDialogTitle className="text-white text-lg font-semibold">
                Delete Resident
              </AlertDialogTitle>
              <p className="text-white/80 text-sm">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <AlertDialogDescription className="text-text-secondary text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-text-primary">{memberToDelete?.name}</span>?
              This will permanently remove this person from the system.
            </AlertDialogDescription>
          </div>

          <AlertDialogFooter className="px-6 py-4 bg-bg-hover border-t border-border-light">
            <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Owner Transfer Dialog */}
      <AlertDialog open={showOwnerTransferDialog} onOpenChange={(open) => {
        if (!open) {
          setShowOwnerTransferDialog(false)
          setPendingMoveOutData(null)
          setSelectedNewOwner('')
          setHouseholdMembers([])
        }
      }}>
        <AlertDialogContent className="bg-bg-white border-border-light p-0 overflow-hidden max-w-md">
          <div className="bg-orange-500 px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <AlertDialogTitle className="text-white text-lg font-semibold">
                Transfer Ownership
              </AlertDialogTitle>
              <p className="text-white/80 text-sm">The owner is moving out</p>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <AlertDialogDescription className="text-text-secondary text-sm leading-relaxed mb-4">
              <span className="font-semibold text-text-primary">{editingMember?.name}</span> is the owner of Room{' '}
              <span className="font-semibold text-text-primary">{editingMember?.household?.unit}</span>.
              Please select a new owner from the household members before proceeding.
            </AlertDialogDescription>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 dark:text-yellow-400 text-xs">
                <strong>Note:</strong> All pending payments for this household will be removed when the owner moves out.
              </p>
            </div>

            <label className="block text-sm font-medium text-text-primary mb-2">Select New Owner *</label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {householdMembers.map(member => (
                <label
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedNewOwner === member.id
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-border-light hover:border-brand-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="newOwner"
                    value={member.id}
                    checked={selectedNewOwner === member.id}
                    onChange={() => setSelectedNewOwner(member.id)}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary/70 flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary text-sm truncate">{member.name}</p>
                    <p className="text-xs text-text-secondary">Member</p>
                  </div>
                  {selectedNewOwner === member.id && (
                    <Check className="w-5 h-5 text-brand-primary shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>

          <AlertDialogFooter className="px-6 py-4 bg-bg-hover border-t border-border-light">
            <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleOwnerTransfer}
              disabled={!selectedNewOwner}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Transfer & Move Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Member Form Component
interface MemberFormProps {
  member: HouseholdMember | null
  households: Household[]
  onSave: (data: any) => void
  onCancel: () => void
}

function MemberForm({ member, households, onSave, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    cccd: '',
    profilePic: '',
    householdId: '',
    residenceType: 'permanent' as 'permanent' | 'temporary',
    relationToOwner: '' as string,
    status: 'living' as 'living' | 'moved_out' | 'deceased',
    moveInDate: '',
    moveOutDate: '',
    note: ''
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [relationDropdownOpen, setRelationDropdownOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const RELATION_OPTIONS = [
    { value: 'self', label: 'Self (Owner)' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'grandchild', label: 'Grandchild' },
    { value: 'in-law', label: 'In-law' },
    { value: 'relative', label: 'Other Relative' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'helper', label: 'Helper/Maid' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        dateOfBirth: format(new Date(member.dateOfBirth), 'yyyy-MM-dd'),
        cccd: member.cccd,
        profilePic: member.profilePic || '',
        householdId: member.householdId || '',
        residenceType: member.residenceType || 'permanent',
        relationToOwner: member.relationToOwner || '',
        status: member.status || 'living',
        moveInDate: member.moveInDate ? format(new Date(member.moveInDate), 'yyyy-MM-dd') : '',
        moveOutDate: member.moveOutDate ? format(new Date(member.moveOutDate), 'yyyy-MM-dd') : '',
        note: member.note || ''
      })
    }
  }, [member])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    if (!formData.cccd.trim()) {
      newErrors.cccd = 'CCCD is required'
    }
    
    // Move-in date is required for permanent residents
    if (formData.residenceType === 'permanent' && !formData.moveInDate) {
      newErrors.moveInDate = 'Move-in date is required for permanent residents'
    }
    
    // Move-out date and note are required when status is moved_out
    if (formData.status === 'moved_out') {
      if (!formData.moveOutDate) {
        newErrors.moveOutDate = 'Move-out date is required'
      }
      if (!formData.note.trim()) {
        newErrors.note = 'Please provide a reason for moving out'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave({
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        cccd: formData.cccd,
        profilePic: formData.profilePic || null,
        householdId: formData.householdId || null,
        residenceType: formData.residenceType,
        relationToOwner: formData.relationToOwner || null,
        status: formData.status,
        moveInDate: formData.moveInDate || null,
        moveOutDate: formData.moveOutDate || null,
        note: formData.note || null
      })
    }
  }

  const selectedHousehold = households.find(h => h.id === formData.householdId)
  const selectedRelation = RELATION_OPTIONS.find(r => r.value === formData.relationToOwner)

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-text-primary mb-2">
          {member ? `Edit Person - ${member.name}` : 'Add New Person'}
        </h1>
        <p className="text-base text-text-secondary">
          {member ? 'Update person information' : 'Register a new resident'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-bg-white rounded-2xl p-8 shadow-lg border border-border-light mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                  }}
                  placeholder="Enter full name"
                  className={`input-default text-sm pr-10 ${errors.name ? 'border-red-500' : formData.name.trim().length >= 2 ? 'border-green-500' : ''}`}
                />
                {formData.name.trim().length > 0 && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${formData.name.trim().length >= 2 ? 'text-green-500' : 'text-red-500'}`}>
                    {formData.name.trim().length >= 2 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                )}
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Date of Birth *</label>
              <DatePickerInput
                value={formData.dateOfBirth}
                onChange={(date) => {
                  if (date) {
                    setFormData(prev => ({ ...prev, dateOfBirth: format(date, 'yyyy-MM-dd') }))
                    if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: '' }))
                  }
                }}
                disabled={(date) => date > new Date()}
                error={!!errors.dateOfBirth}
                placeholder="dd/mm/yyyy"
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">CCCD (National ID) *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cccd}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 12) {
                      setFormData(prev => ({ ...prev, cccd: value }))
                      if (errors.cccd) setErrors(prev => ({ ...prev, cccd: '' }))
                    }
                  }}
                  maxLength={12}
                  placeholder="12-digit identification number"
                  className={`input-default text-sm pr-16 font-mono ${errors.cccd ? 'border-red-500' : formData.cccd.length === 12 ? 'border-green-500' : formData.cccd.length > 0 ? 'border-red-500' : ''}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className={`text-xs ${formData.cccd.length === 12 ? 'text-green-500' : 'text-text-muted'}`}>
                    {formData.cccd.length}/12
                  </span>
                  {formData.cccd.length === 12 && <Check className="w-4 h-4 text-green-500" />}
                  {formData.cccd.length > 0 && formData.cccd.length !== 12 && <X className="w-4 h-4 text-red-500" />}
                </div>
              </div>
              {errors.cccd && <p className="mt-1 text-sm text-red-500">{errors.cccd}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Profile Picture URL</label>
              <input
                type="url"
                value={formData.profilePic}
                onChange={(e) => setFormData(prev => ({ ...prev, profilePic: e.target.value }))}
                placeholder="https://example.com/photo.jpg"
                className="input-default text-sm"
              />
            </div>
          </div>
        </div>

        {/* Household & Residence Information */}
        <div className="bg-bg-white rounded-2xl p-8 shadow-lg border border-border-light mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Household & Residence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Household (Room)</label>
              <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="input-default text-sm flex items-center justify-between w-full"
                  >
                    <span className={selectedHousehold ? 'text-text-primary' : 'text-text-secondary'}>
                      {selectedHousehold 
                        ? `${selectedHousehold.unit} - ${selectedHousehold.ownerName}`
                        : 'Not assigned'
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-bg-white border-border-light" align="start">
                  <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, householdId: '' }))
                        setDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-bg-hover transition-colors border-b border-border-light ${!formData.householdId ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-secondary'}`}
                    >
                      Not assigned
                    </button>
                    {households.map(h => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, householdId: h.id }))
                          setDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-bg-hover transition-colors border-b border-border-light last:border-b-0 ${formData.householdId === h.id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'}`}
                      >
                        <span className="font-medium">{h.unit}</span>
                        <span className="text-text-secondary ml-2">- {h.ownerName}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Residence Type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, residenceType: 'permanent' }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.residenceType === 'permanent'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-border-light bg-bg-hover text-text-secondary hover:border-green-300'
                  }`}
                >
                  <Home className={`w-4 h-4 ${formData.residenceType === 'permanent' ? 'text-green-600' : ''}`} />
                  <span className="text-sm font-medium">Permanent</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, residenceType: 'temporary' }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.residenceType === 'temporary'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'border-border-light bg-bg-hover text-text-secondary hover:border-blue-300'
                  }`}
                >
                  <Clock className={`w-4 h-4 ${formData.residenceType === 'temporary' ? 'text-blue-600' : ''}`} />
                  <span className="text-sm font-medium">Temporary</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Relation to Owner</label>
              <Popover open={relationDropdownOpen} onOpenChange={setRelationDropdownOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="input-default text-sm flex items-center justify-between w-full"
                  >
                    <span className={selectedRelation ? 'text-text-primary' : 'text-text-secondary'}>
                      {selectedRelation?.label || 'Select relation'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-bg-white border-border-light" align="start">
                  <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                    {RELATION_OPTIONS.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, relationToOwner: r.value }))
                          setRelationDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-bg-hover transition-colors border-b border-border-light last:border-b-0 ${formData.relationToOwner === r.value ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-text-primary'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Living Status</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, status: 'living', moveOutDate: '' }))
                    if (errors.moveOutDate) setErrors(prev => ({ ...prev, moveOutDate: '', note: '' }))
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.status === 'living'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-border-light bg-bg-hover text-text-secondary hover:border-green-300'
                  }`}
                >
                  <Users className={`w-4 h-4 ${formData.status === 'living' ? 'text-green-600' : ''}`} />
                  <span className="text-sm font-medium">Currently Living</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'moved_out' }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.status === 'moved_out'
                      ? 'border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                      : 'border-border-light bg-bg-hover text-text-secondary hover:border-gray-300'
                  }`}
                >
                  <UserX className={`w-4 h-4 ${formData.status === 'moved_out' ? 'text-gray-600' : ''}`} />
                  <span className="text-sm font-medium">Moved Out</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Move-in Date {formData.residenceType === 'permanent' && <span className="text-red-500">*</span>}
              </label>
              <DatePickerInput
                value={formData.moveInDate}
                onChange={(date) => {
                  setFormData(prev => ({ ...prev, moveInDate: date ? format(date, 'yyyy-MM-dd') : '' }))
                  if (errors.moveInDate) setErrors(prev => ({ ...prev, moveInDate: '' }))
                }}
                placeholder="dd/mm/yyyy"
                error={!!errors.moveInDate}
              />
              {errors.moveInDate && <p className="mt-1 text-sm text-red-500">{errors.moveInDate}</p>}
            </div>

            {formData.status === 'moved_out' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Move-out Date <span className="text-red-500">*</span>
                </label>
                <DatePickerInput
                  value={formData.moveOutDate}
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, moveOutDate: date ? format(date, 'yyyy-MM-dd') : '' }))
                    if (errors.moveOutDate) setErrors(prev => ({ ...prev, moveOutDate: '' }))
                  }}
                  placeholder="dd/mm/yyyy"
                  error={!!errors.moveOutDate}
                />
                {errors.moveOutDate && <p className="mt-1 text-sm text-red-500">{errors.moveOutDate}</p>}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                {formData.status === 'moved_out' ? 'Reason for Moving Out' : 'Notes'}
                {formData.status === 'moved_out' && <span className="text-red-500"> *</span>}
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, note: e.target.value }))
                  if (errors.note) setErrors(prev => ({ ...prev, note: '' }))
                }}
                placeholder={formData.status === 'moved_out' ? 'Please provide a reason for moving out...' : 'Additional notes about this resident...'}
                rows={3}
                className={`input-default text-sm resize-none ${errors.note ? 'border-red-500' : ''}`}
              />
              {errors.note && <p className="mt-1 text-sm text-red-500">{errors.note}</p>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {member ? 'Save Changes' : 'Add Person'}
          </button>
        </div>
      </form>
    </div>
  )
}
