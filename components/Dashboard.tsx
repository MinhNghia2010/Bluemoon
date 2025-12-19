'use client'

import { useState, useEffect } from 'react';
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

type View = 'households' | 'demography' | 'feeCategories' | 'feeCollection' | 'statistics' | 'parking' | 'utilities' | 'settings';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('statistics');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
        <Header onLogout={onLogout} />
        
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
