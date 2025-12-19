'use client'

import { BarChart3, Car, ClipboardList, Settings, Tags, Users, Zap, UserCheck } from 'lucide-react';

type View = 'households' | 'demography' | 'feeCategories' | 'feeCollection' | 'statistics' | 'parking' | 'utilities' | 'settings';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Sidebar({ currentView, onViewChange, isCollapsed, onToggle }: SidebarProps) {
  const menuItems = [
    { id: 'statistics' as View, label: 'Statistics', Icon: BarChart3 },
    { id: 'households' as View, label: 'Households', Icon: Users },
    { id: 'demography' as View, label: 'Demography', Icon: UserCheck },
    { id: 'feeCategories' as View, label: 'Fee Categories', Icon: Tags },
    { id: 'feeCollection' as View, label: 'Fee Collection', Icon: ClipboardList },
    { id: 'parking' as View, label: 'Parking', Icon: Car },
    { id: 'utilities' as View, label: 'Utilities', Icon: Zap },
    { id: 'settings' as View, label: 'Settings', Icon: Settings },
  ];

  return (
    <div className={`bg-bg-sidebar border-r border-border-light flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-[100px]' : 'w-[337px]'}`}>
      <div className={`transition-all duration-300 ${isCollapsed ? 'p-[20px]' : 'p-[40px]'}`}>
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between mb-[60px]">
          <div className={`flex items-center gap-[12px] ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'} transition-all duration-300`}>
            <img src="/images/32ca64d17b2402668538618763cc0b2a820003ec.png" alt="BlueMoon Logo" className="size-[32px]" />
            <div>
              <p className="font-semibold text-text-primary text-[20px]">BlueMoon</p>
            </div>
          </div>
          {!isCollapsed && (
            <button 
              onClick={onToggle}
              className="text-text-secondary hover:text-text-primary transition-colors p-[4px]"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
          )}
        </div>

        {/* Collapsed Logo */}
        {isCollapsed && (
          <div className="flex flex-col items-center mb-[40px]">
            <img src="/images/32ca64d17b2402668538618763cc0b2a820003ec.png" alt="BlueMoon Logo" className="size-[40px] mb-[20px]" />
            <button 
              onClick={onToggle}
              className="text-text-secondary hover:text-text-primary transition-colors p-[4px]"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
          </div>
        )}

        {/* Menu Items */}
        <nav className="space-y-[8px]">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            const IconComponent = item.Icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-[14px]'} px-[12px] py-[12px] rounded-[6px] transition-colors ${
                  isActive 
                    ? 'bg-[var(--brand-primary-light)]' 
                    : 'hover:bg-bg-hover'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent
                  className={`size-[24px] flex-shrink-0 ${isActive ? 'text-brand-primary' : 'text-text-secondary'}`}
                />
                <p className={`font-medium text-base ${
                  isActive ? 'text-text-primary' : 'text-text-secondary'
                } ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'} transition-all duration-300 whitespace-nowrap`}>
                  {item.label}
                </p>
              </button>
            );
          })}
        </nav>

        {/* Version Info */}
        <div className={`mt-[60px] px-[12px] ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'} transition-all duration-300`}>
          <p className="text-text-secondary text-xs">
            Version 2.0
          </p>
        </div>
      </div>
    </div>
  );
}
