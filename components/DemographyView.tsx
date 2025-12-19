'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Users, AlertTriangle, CalendarIcon, ChevronDown } from 'lucide-react'
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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'

interface HouseholdMember {
  id: string
  name: string
  dateOfBirth: string
  cccd: string
  householdId: string | null
  household: {
    id: string
    unit: string
    ownerName: string
  } | null
}

interface Household {
  id: string
  unit: string
  ownerName: string
}

export function DemographyView() {
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<HouseholdMember | null>(null)

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

  const handleSave = async (data: { name: string; dateOfBirth: string; cccd: string; householdId: string | null }) => {
    try {
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members'
      const method = editingMember ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save member')
      }

      toast.success(editingMember ? 'Member updated successfully' : 'Member added successfully')
      setShowForm(false)
      setEditingMember(null)
      fetchMembers()
    } catch (error) {
      console.error('Error saving member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save member')
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
    return (
      member.name.toLowerCase().includes(search) ||
      member.cccd.toLowerCase().includes(search) ||
      (member.household?.unit || '').toLowerCase().includes(search) ||
      format(new Date(member.dateOfBirth), 'MMM d, yyyy').toLowerCase().includes(search)
    )
  })

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Demography</h1>
          <p className="text-base text-text-secondary mt-1">View and search all residents in the building</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Person
        </button>
      </div>

      {/* Search */}
      <div className="bg-bg-white rounded-2xl p-6 shadow-lg border border-border-light mb-6">
        <div className="relative input-default">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by ID, name, date of birth, room, or CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=" pl-8 text-sm w-100 border-0 outline-none bg-transparent caret-brand-primary placeholder:text-text-secondary"
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
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Date of Birth</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Room</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">CCCD</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className="border-b border-border-light last:border-b-0 hover:bg-bg-hover/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-text-secondary">{index + 1}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-text-primary">{member.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {format(new Date(member.dateOfBirth), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    {member.household ? (
                      <span className="text-brand-primary font-medium">{member.household.unit}</span>
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{member.cccd}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingMember(member)
                          setShowForm(true)
                        }}
                        className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-secondary hover:text-brand-primary"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setMemberToDelete(member)
                          setDeleteDialogOpen(true)
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-text-secondary hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
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
    </div>
  )
}

// Member Form Component
interface MemberFormProps {
  member: HouseholdMember | null
  households: Household[]
  onSave: (data: { name: string; dateOfBirth: string; cccd: string; householdId: string | null }) => void
  onCancel: () => void
}

function MemberForm({ member, households, onSave, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    cccd: '',
    householdId: ''
  })
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        dateOfBirth: format(new Date(member.dateOfBirth), 'yyyy-MM-dd'),
        cccd: member.cccd,
        householdId: member.householdId || ''
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
        householdId: formData.householdId || null
      })
    }
  }

  const selectedHousehold = households.find(h => h.id === formData.householdId)

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                }}
                placeholder="Enter full name"
                className={`input-default text-sm ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Date of Birth *</label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`input-default text-sm flex items-center justify-between w-full ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                  >
                    <span className={formData.dateOfBirth ? 'text-text-primary' : 'text-text-secondary'}>
                      {formData.dateOfBirth 
                        ? format(new Date(formData.dateOfBirth), 'MMMM d, yyyy')
                        : 'Select date of birth'
                      }
                    </span>
                    <CalendarIcon className="w-4 h-4 text-text-secondary" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-bg-white border-border-light" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, dateOfBirth: format(date, 'yyyy-MM-dd') }))
                        if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: '' }))
                      }
                      setDatePickerOpen(false)
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">CCCD (Căn cước công dân) *</label>
              <input
                type="text"
                value={formData.cccd}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, cccd: e.target.value }))
                  if (errors.cccd) setErrors(prev => ({ ...prev, cccd: '' }))
                }}
                placeholder="12-digit identification number"
                className={`input-default text-sm ${errors.cccd ? 'border-red-500' : ''}`}
              />
              <p className="mt-1 text-xs text-text-secondary">12-digit identification number</p>
              {errors.cccd && <p className="mt-1 text-sm text-red-500">{errors.cccd}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Household ID (Room)</label>
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
              <p className="mt-1 text-xs text-text-secondary">Leave empty if not assigned to a household</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
