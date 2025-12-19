'use client'

import { useState, useRef, useEffect } from 'react';
import { CircleUser } from 'lucide-react';
import svgPaths from "@/imports/svg-uiac8iywkt";
import { DarkModeToggle } from "./shared/DarkModeToggle";

function VuesaxTwotoneSearchNormal() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/twotone/search-normal">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="search-normal">
          <path d={svgPaths.p29c64470} id="Vector" stroke="var(--stroke-0, #787486)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p21df7600} id="Vector_2" stroke="var(--stroke-0, #787486)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_3" opacity="0"></g>
        </g>
      </svg>
    </div>
  );
}

function VuesaxOutlineArrowDown() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/outline/arrow-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="arrow-down">
          <path d={svgPaths.p3298ef40} fill="var(--fill-0, #292D32)" id="Vector" />
          <g id="Vector_2" opacity="0"></g>
        </g>
      </svg>
    </div>
  );
}

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <div className="bg-bg-white border-b border-border-light px-[40px] py-[20px]">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative">
          <div className="bg-neutral-100 h-[44px] w-[417px] rounded-[6px] flex items-center px-[16px]">
            <div className="relative size-[22px] mr-[12px]">
              <VuesaxTwotoneSearchNormal />
            </div>
            <input
              type="text"
              placeholder="Search for anything..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-text-secondary placeholder:text-text-secondary"
            />
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-[16px]">
          <DarkModeToggle />

          <div 
            ref={dropdownRef}
            className="relative"
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-[12px] hover:opacity-80 transition-opacity"
            >
              <div>
                <p className="text-text-primary text-base text-right">Admin User</p>
                <p className="text-text-secondary text-sm text-right">Administrator</p>
              </div>
              <div className="flex items-center justify-center size-[38px] rounded-full bg-[#5030e5]/10">
                <CircleUser className="size-[24px] text-[#5030e5]" />
              </div>
              <div className={`relative size-[18px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                <VuesaxOutlineArrowDown />
              </div>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-[8px] bg-bg-white rounded-[8px] shadow-lg border border-border-light w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-[8px]">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-[16px] py-[12px] text-left font-medium text-sm text-[#D34B5E] hover:bg-bg-hover transition-colors flex items-center gap-[8px]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54" stroke="#D34B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 12H3.62" stroke="#D34B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.85 8.65002L2.5 12L5.85 15.35" stroke="#D34B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
