'use client'

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface ChangePasswordFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  successMessage: string;
  errorMessage: string;
}

export function ChangePasswordForm({ onSuccess, onError, successMessage, errorMessage }: ChangePasswordFormProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isNewPasswordValid = newPassword.length >= 6;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess('');
    onError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      onError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      onError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      onError('Password must be at least 6 characters');
      return;
    }

    if (!user?.id) {
      onError('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      await usersApi.changePassword({
        userId: user.id,
        currentPassword,
        newPassword
      });
      onSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      onError(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-bg-white rounded-[16px] p-[32px] shadow-lg border border-border-light">
      <h3 className="font-semibold text-text-primary text-[20px] mb-[24px]">Change Password</h3>

      <form onSubmit={handleSubmit}>
        <div className="space-y-[20px]">
          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Current Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  onError('');
                  onSuccess('');
                }}
                className={`w-full h-[44px] px-[16px] pr-10 bg-input-bg rounded-[6px] border ${currentPassword.length > 0 ? 'border-green-500' : 'border-transparent'} text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
                placeholder="Enter current password"
              />
              {currentPassword.length > 0 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  onError('');
                  onSuccess('');
                }}
                className={`w-full h-[44px] px-[16px] pr-16 bg-input-bg rounded-[6px] border ${isNewPasswordValid ? 'border-green-500' : newPassword.length > 0 ? 'border-red-500' : 'border-transparent'} text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
                placeholder="Enter new password"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className={`text-xs ${isNewPasswordValid ? 'text-green-500' : 'text-text-muted'}`}>
                  {newPassword.length}/6
                </span>
                {isNewPasswordValid && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                {newPassword.length > 0 && !isNewPasswordValid && (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  onError('');
                  onSuccess('');
                }}
                className={`w-full h-[44px] px-[16px] pr-10 bg-input-bg rounded-[6px] border ${doPasswordsMatch ? 'border-green-500' : confirmPassword.length > 0 ? 'border-red-500' : 'border-transparent'} text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]`}
                placeholder="Confirm new password"
              />
              {doPasswordsMatch && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {confirmPassword.length > 0 && !doPasswordsMatch && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="p-[12px] bg-[#fee] rounded-[6px]">
              <p className="font-['Inter:Regular',sans-serif] text-[#f33] text-[14px]">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-[12px] bg-[#efe] rounded-[6px]">
              <p className="font-['Inter:Regular',sans-serif] text-[#7AC555] text-[14px]">{successMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[44px] bg-[#5030e5] text-white rounded-[6px] font-['Inter:Medium',sans-serif] font-medium text-[16px] hover:bg-[#4024c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Changing...' : 'Change Password'}
          </button>

          <p className="text-text-secondary text-xs">
            Password must be at least 6 characters long
          </p>
        </div>
      </form>
    </div>
  );
}
