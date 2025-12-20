'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Users, Check, X, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { usersApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const roleDropdownRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'staff'
  })

  // Validation state
  const isUsernameValid = formData.username.length >= 3
  const isPasswordValid = formData.password.length >= 6 || (editingUser && formData.password === '')
  const isNameValid = formData.name.length >= 2
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isUsernameValid || !isNameValid || !isEmailValid) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    if (!editingUser && !isPasswordValid) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      if (editingUser) {
        const updateData: any = {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          role: formData.role
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        await usersApi.update(editingUser.id, updateData)
        toast.success('User updated successfully')
      } else {
        await usersApi.create(formData)
        toast.success('User created successfully')
      }
      
      setShowForm(false)
      setEditingUser(null)
      resetForm()
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      email: user.email,
      role: user.role
    })
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteUserId) return

    try {
      await usersApi.delete(deleteUserId)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setDeleteUserId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'staff'
    })
    setShowPassword(false)
    setIsRoleOpen(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingUser(null)
    resetForm()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700'
      case 'manager':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-bg-white rounded-[16px] p-[32px] shadow-lg border border-border-light col-span-2">
      <div className="flex items-center justify-between mb-[24px]">
        <h3 className="font-semibold text-text-primary text-[20px]">User Management</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#5030e5] text-white px-4 py-2 rounded-[6px] hover:bg-[#4024c4] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-text-primary text-sm mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full h-[44px] px-4 pr-10 bg-input-bg rounded-[6px] border ${
                    formData.username.length > 0
                      ? isUsernameValid ? 'border-green-500' : 'border-red-500'
                      : 'border-transparent'
                  } text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
                  placeholder="Enter username (min 3 chars)"
                />
                {formData.username.length > 0 && (
                  isUsernameValid 
                    ? <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    : <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            <div>
              <label className="block font-medium text-text-primary text-sm mb-2">
                Password {!editingUser && <span className="text-red-500">*</span>}
                {editingUser && <span className="text-text-muted text-xs ml-1">(leave empty to keep current)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full h-[44px] px-4 pr-20 bg-input-bg rounded-[6px] border ${
                    formData.password.length > 0
                      ? isPasswordValid ? 'border-green-500' : 'border-red-500'
                      : 'border-transparent'
                  } text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
                  placeholder={editingUser ? 'Enter new password' : 'Enter password (min 6 chars)'}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {formData.password.length > 0 && (
                    isPasswordValid 
                      ? <Check className="w-4 h-4 text-green-500" />
                      : <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-text-primary text-sm mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full h-[44px] px-4 pr-10 bg-input-bg rounded-[6px] border ${
                    formData.name.length > 0
                      ? isNameValid ? 'border-green-500' : 'border-red-500'
                      : 'border-transparent'
                  } text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
                  placeholder="Enter full name"
                />
                {formData.name.length > 0 && (
                  isNameValid 
                    ? <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    : <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            <div>
              <label className="block font-medium text-text-primary text-sm mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full h-[44px] px-4 pr-10 bg-input-bg rounded-[6px] border ${
                    formData.email.length > 0
                      ? isEmailValid ? 'border-green-500' : 'border-red-500'
                      : 'border-transparent'
                  } text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
                  placeholder="Enter email address"
                />
                {formData.email.length > 0 && (
                  isEmailValid 
                    ? <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    : <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            <div>
              <label className="block font-medium text-text-primary text-sm mb-2">
                Role
              </label>
              <div className="relative" ref={roleDropdownRef}>
                <button
                  type="button"
                  className="w-full h-[44px] px-4 bg-input-bg rounded-[6px] border border-transparent text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5] flex items-center justify-between cursor-pointer"
                  onClick={() => setIsRoleOpen(!isRoleOpen)}
                >
                  <span className="capitalize">{formData.role}</span>
                  <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isRoleOpen ? 'rotate-180' : ''}`} />
                </button>
                {isRoleOpen && (
                  <div className="absolute z-10 bg-bg-white border border-border-light rounded-[6px] shadow-lg w-full mt-1 overflow-hidden">
                    <div 
                      className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm transition-colors ${formData.role === 'staff' ? 'bg-[#5030e5]/10 text-[#5030e5]' : 'text-text-primary'}`}
                      onClick={() => { setFormData({ ...formData, role: 'staff' }); setIsRoleOpen(false); }}
                    >
                      Staff
                    </div>
                    <div 
                      className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm transition-colors ${formData.role === 'manager' ? 'bg-[#5030e5]/10 text-[#5030e5]' : 'text-text-primary'}`}
                      onClick={() => { setFormData({ ...formData, role: 'manager' }); setIsRoleOpen(false); }}
                    >
                      Manager
                    </div>
                    <div 
                      className={`px-4 py-3 cursor-pointer hover:bg-bg-hover text-sm transition-colors ${formData.role === 'admin' ? 'bg-[#5030e5]/10 text-[#5030e5]' : 'text-text-primary'}`}
                      onClick={() => { setFormData({ ...formData, role: 'admin' }); setIsRoleOpen(false); }}
                    >
                      Admin
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#5030e5] text-white rounded-[6px] hover:bg-[#4024c4] transition-colors"
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      ) : (
        <>
          {loading ? (
            <div className="py-8 text-center text-text-secondary">Loading...</div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-text-secondary">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-hover border-b border-border-light">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Username</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Role</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border-light hover:bg-bg-hover/50">
                      <td className="px-4 py-3 text-sm text-text-primary font-medium">{user.username}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-text-secondary hover:text-[#5030e5] hover:bg-[#5030e5]/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteUserId(user.id)}
                            className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
