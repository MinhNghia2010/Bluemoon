'use client'

import { useState } from 'react';
import { PageHeader } from './shared/PageHeader';
import { ApartmentInfoForm } from './settings/ApartmentInfoForm';
import { ChangePasswordForm } from './settings/ChangePasswordForm';
import { UserManagement } from './settings/UserManagement';

export function SettingsView() {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Settings"
        description="Manage system settings and preferences"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
        <ApartmentInfoForm onSuccess={setSuccessMessage} />
        <ChangePasswordForm 
          onSuccess={setSuccessMessage}
          onError={setErrorMessage}
          successMessage={successMessage}
          errorMessage={errorMessage}
        />
        <UserManagement />
      </div>
    </div>
  );
}
