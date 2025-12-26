'use client'

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { HouseholdsView } from './HouseholdsView';
import { DemographyView } from './DemographyView';
import { FeeCategoriesView } from './FeeCategoriesView';
import { FeeCollectionView } from './FeeCollectionView';
import { StatisticsView } from './StatisticsView';
import { ParkingView } from './ParkingView';
import { UtilitiesView } from './UtilitiesView';
import { SettingsView } from './SettingsView';
import { toast } from 'sonner';

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
