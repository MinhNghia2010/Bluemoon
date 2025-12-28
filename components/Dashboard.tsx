'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { toast } from 'sonner';

// Loading skeleton components matching each view's UI
const StatisticsSkeleton = () => (
  <div className="animate-pulse">
    {/* Page Header */}
    <div className="flex items-center justify-between mb-10">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>
    </div>
    {/* Filter Tabs */}
    <div className="flex gap-2 mb-6">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
      ))}
    </div>
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      ))}
    </div>
    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
    </div>
  </div>
);

const HouseholdsSkeleton = () => (
  <div className="animate-pulse">
    {/* Page Header */}
    <div className="flex items-center justify-between mb-10">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72"></div>
      </div>
      <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-md w-36"></div>
    </div>
    {/* Filter Buttons */}
    <div className="flex gap-2 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
      ))}
    </div>
    {/* Household Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48"></div>
      ))}
    </div>
  </div>
);

const DemographySkeleton = () => (
  <div className="animate-pulse">
    {/* Page Header */}
    <div className="flex items-center justify-between mb-10">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>
      <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-md w-36"></div>
    </div>
    {/* Search and Filters */}
    <div className="flex gap-4 mb-6">
      <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-md flex-1 max-w-md"></div>
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
        ))}
      </div>
    </div>
    {/* Member List */}
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-200 dark:bg-gray-700 rounded-xl">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

const FeeCategoriesSkeleton = () => (
  <div className="animate-pulse">
    {/* Page Header */}
    <div className="flex items-center justify-between mb-10">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-44 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
      </div>
      <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-md w-40"></div>
    </div>
    {/* Category Table */}
    <div className="bg-bg-white rounded-[16px] overflow-hidden shadow-lg border border-border-light">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_2fr_80px] gap-[20px] px-[24px] py-[16px] bg-neutral-50 border-b border-border-light">
        <div className="text-sm font-medium text-text-secondary">Category Name</div>
        <div className="text-sm font-medium text-text-secondary">Amount</div>
        <div className="text-sm font-medium text-text-secondary">Frequency</div>
        <div className="text-sm font-medium text-text-secondary">Description</div>
        <div className="text-sm font-medium text-text-secondary text-center">Actions</div>
      </div>
      {/* Skeleton Rows */}
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="grid grid-cols-[2fr_1fr_1fr_2fr_80px] gap-[20px] px-[24px] py-[20px] border-b border-neutral-100">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
        </div>
      ))}
    </div>
  </div>
);

const FeeCollectionSkeleton = () => (
  <div className="animate-pulse">
    {/* Page Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>
      <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-md w-36"></div>
    </div>
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      ))}
    </div>
    {/* Filters */}
    <div className="flex gap-4 mb-6">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
        ))}
      </div>
      <div className="flex gap-2 ml-auto">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
      </div>
    </div>
    {/* Payment Cards */}
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-32"></div>
      ))}
    </div>
  </div>
);

const ParkingSkeleton = () => (
  <div className="animate-pulse">
    {/* Page Header */}
    <div className="flex items-center justify-between mb-10">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72"></div>
      </div>
      <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-md w-36"></div>
    </div>
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      ))}
    </div>
    {/* Filter Buttons */}
    <div className="flex gap-2 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-28"></div>
      ))}
    </div>
    {/* Parking Slot Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-40"></div>
      ))}
    </div>
  </div>
);

const UtilitiesSkeleton = () => (
  <div className="animate-pulse">
    {/* Page Header */}
    <div className="flex items-center justify-between mb-10">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>
      <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-md w-36"></div>
    </div>
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      ))}
    </div>
    {/* Filters */}
    <div className="flex gap-4 mb-6">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
        ))}
      </div>
      <div className="flex gap-2 ml-auto">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
      </div>
    </div>
    {/* Utility Bill Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48"></div>
      ))}
    </div>
  </div>
);

const SettingsSkeleton = () => (
  <div className="animate-pulse">
    {/* Page Header */}
    <div className="flex items-center justify-between mb-10">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>
    </div>
    {/* Settings Forms Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Apartment Info */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-8 h-72">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-6"></div>
        <div className="space-y-4">
          <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
      {/* Change Password */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-8 h-72">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-44 mb-6"></div>
        <div className="space-y-4">
          <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
      {/* User Management */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-8 h-96 col-span-2">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-44 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-300 dark:bg-gray-600 rounded-lg">
              <div className="w-10 h-10 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-400 dark:bg-gray-500 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-400 dark:bg-gray-500 rounded-full w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Helper to add delay for lazy loading (shows skeleton)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Viewport-based lazy loading wrapper
function ViewportLazy({ 
  children, 
  skeleton 
}: { 
  children: React.ReactNode; 
  skeleton: React.ReactNode;
}) {
  const [isInViewport, setIsInViewport] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if already in viewport on mount
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.01 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[200px]">
      {isInViewport ? children : skeleton}
    </div>
  );
}

// Lazy load all view components - only loads when in viewport
const HouseholdsView = dynamic(
  () => delay(300).then(() => import('./HouseholdsView').then(mod => ({ default: mod.HouseholdsView }))),
  { loading: () => <HouseholdsSkeleton />, ssr: false }
);

const DemographyView = dynamic(
  () => delay(300).then(() => import('./DemographyView').then(mod => ({ default: mod.DemographyView }))),
  { loading: () => <DemographySkeleton />, ssr: false }
);

const FeeCategoriesView = dynamic(
  () => delay(300).then(() => import('./FeeCategoriesView').then(mod => ({ default: mod.FeeCategoriesView }))),
  { loading: () => <FeeCategoriesSkeleton />, ssr: false }
);

const FeeCollectionView = dynamic(
  () => delay(300).then(() => import('./FeeCollectionView').then(mod => ({ default: mod.FeeCollectionView }))),
  { loading: () => <FeeCollectionSkeleton />, ssr: false }
);

const StatisticsView = dynamic(
  () => delay(300).then(() => import('./StatisticsView').then(mod => ({ default: mod.StatisticsView }))),
  { loading: () => <StatisticsSkeleton />, ssr: false }
);

const ParkingView = dynamic(
  () => delay(300).then(() => import('./ParkingView').then(mod => ({ default: mod.ParkingView }))),
  { loading: () => <ParkingSkeleton />, ssr: false }
);

const UtilitiesView = dynamic(
  () => delay(300).then(() => import('./UtilitiesView').then(mod => ({ default: mod.UtilitiesView }))),
  { loading: () => <UtilitiesSkeleton />, ssr: false }
);

const SettingsView = dynamic(
  () => delay(300).then(() => import('./SettingsView').then(mod => ({ default: mod.SettingsView }))),
  { loading: () => <SettingsSkeleton />, ssr: false }
);

type View = 'households' | 'demography' | 'feeCategories' | 'feeCollection' | 'statistics' | 'parking' | 'utilities' | 'settings';

// Get initial view from localStorage (runs during module initialization)
const getInitialView = (): View => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('bluemoon-current-view') as View;
    if (saved && ['households', 'demography', 'feeCategories', 'feeCollection', 'statistics', 'parking', 'utilities', 'settings'].includes(saved)) {
      return saved;
    }
  }
  return 'statistics';
};

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>(getInitialView);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check if any view has unsaved changes (add/edit mode)
  useEffect(() => {
    const checkUnsavedChanges = () => {
      const states = [
        'bluemoon-households-state',
        'bluemoon-parking-state',
        'bluemoon-feecategories-state',
        'bluemoon-feecollection-state',
        'bluemoon-utilities-state',
        'bluemoon-demography-state'
      ];
      
      for (const key of states) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const state = JSON.parse(saved);
            if (state.viewMode === 'add' || state.viewMode === 'edit' || state.showForm) {
              setHasUnsavedChanges(true);
              return;
            }
          } catch (e) {}
        }
      }
      setHasUnsavedChanges(false);
    };

    checkUnsavedChanges();
    
    // Check periodically
    const interval = setInterval(checkUnsavedChanges, 1000);
    return () => clearInterval(interval);
  }, []);

  // Warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Save current view to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('bluemoon-current-view', currentView);
  }, [currentView]);

  // Apply dark mode from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('bluemoon-theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="flex h-screen bg-bg-page">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className="flex-1 overflow-auto scrollbar-hide">
        <Header onLogout={onLogout} onNavigate={setCurrentView} />
        
        <div className="p-[40px]">
          {currentView === 'households' && <HouseholdsView />}
          {currentView === 'demography' && <DemographyView />}
          {currentView === 'feeCategories' && <FeeCategoriesView />}
          {currentView === 'feeCollection' && <FeeCollectionView />}
          {currentView === 'statistics' && <StatisticsView />}
          {currentView === 'parking' && <ParkingView />}
          {currentView === 'utilities' && <UtilitiesView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </div>
    </div>
  );
}
