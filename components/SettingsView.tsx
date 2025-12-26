'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from './shared/PageHeader';

// Skeleton Components
const ApartmentInfoFormSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl p-8">
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-44 mb-6"></div>
    <div className="space-y-5">
      {[1, 2, 3].map(i => (
        <div key={i}>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28 mb-2"></div>
          <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>
      ))}
    </div>
    <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md w-full mt-6"></div>
  </div>
);

const ChangePasswordFormSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl p-8">
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-6"></div>
    <div className="space-y-5">
      {[1, 2, 3].map(i => (
        <div key={i}>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
          <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>
      ))}
    </div>
    <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md w-full mt-6"></div>
  </div>
);

const UserManagementSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl p-8 col-span-2">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md w-28"></div>
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-300 dark:bg-gray-600 rounded-xl">
          <div className="w-10 h-10 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-400 dark:bg-gray-500 rounded w-32 mb-1"></div>
            <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-48"></div>
          </div>
          <div className="h-6 bg-gray-400 dark:bg-gray-500 rounded-full w-16"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-400 dark:bg-gray-500 rounded"></div>
            <div className="h-8 w-8 bg-gray-400 dark:bg-gray-500 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Lazy load settings components
const ApartmentInfoForm = dynamic(() => import('./settings/ApartmentInfoForm').then(mod => ({ default: mod.ApartmentInfoForm })), {
  loading: () => <ApartmentInfoFormSkeleton />,
  ssr: false
});

const ChangePasswordForm = dynamic(() => import('./settings/ChangePasswordForm').then(mod => ({ default: mod.ChangePasswordForm })), {
  loading: () => <ChangePasswordFormSkeleton />,
  ssr: false
});

const UserManagement = dynamic(() => import('./settings/UserManagement').then(mod => ({ default: mod.UserManagement })), {
  loading: () => <UserManagementSkeleton />,
  ssr: false
});

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
