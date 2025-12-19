import { useState } from 'react';

interface ChangePasswordFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  successMessage: string;
  errorMessage: string;
}

export function ChangePasswordForm({ onSuccess, onError, successMessage, errorMessage }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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

    onSuccess('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                onError('');
                onSuccess('');
              }}
              className="w-full h-[44px] px-[16px] bg-input-bg rounded-[6px] border-0 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                onError('');
                onSuccess('');
              }}
              className="w-full h-[44px] px-[16px] bg-input-bg rounded-[6px] border-0 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block font-medium text-text-primary text-sm mb-[8px]">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                onError('');
                onSuccess('');
              }}
              className="w-full h-[44px] px-[16px] bg-input-bg rounded-[6px] border-0 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#5030e5]"
              placeholder="Confirm new password"
            />
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
            className="w-full h-[44px] bg-[#5030e5] text-white rounded-[6px] font-['Inter:Medium',sans-serif] font-medium text-[16px] hover:bg-[#4024c4] transition-colors"
          >
            Change Password
          </button>

          <p className="text-text-secondary text-xs">
            Password must be at least 6 characters long
          </p>
        </div>
      </form>
    </div>
  );
}
