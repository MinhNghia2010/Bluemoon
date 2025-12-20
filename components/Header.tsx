'use client'

import { useState, useRef, useEffect } from 'react';
import { CircleUser, Search, Home, Users, CreditCard, Car, Zap } from 'lucide-react';
import svgPaths from "@/imports/svg-uiac8iywkt";
import { DarkModeToggle } from "./shared/DarkModeToggle";

interface SearchResult {
  type: 'household' | 'member' | 'payment' | 'parking' | 'utility'
  id: string
  title: string
  subtitle: string
  view: 'households' | 'demography' | 'feeCategories' | 'feeCollection' | 'statistics' | 'parking' | 'utilities' | 'settings'
}

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
  onNavigate?: (view: 'households' | 'demography' | 'feeCategories' | 'feeCollection' | 'statistics' | 'parking' | 'utilities' | 'settings') => void;
}

export function Header({ onLogout, onNavigate }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    if (onNavigate) {
      onNavigate(result.view);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'household':
        return <Home className="w-4 h-4" />;
      case 'member':
        return <Users className="w-4 h-4" />;
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'utility':
        return <Zap className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-bg-white border-b border-border-light px-[40px] py-[20px]">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative" ref={searchRef}>
          <div className="bg-neutral-100 h-[44px] w-[417px] rounded-[6px] flex items-center px-[16px]">
            <div className="relative size-[22px] mr-[12px]">
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5030e5]" />
              ) : (
                <VuesaxTwotoneSearchNormal />
              )}
            </div>
            <input
              type="text"
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              className="flex-1 bg-transparent border-0 outline-none text-sm text-text-primary placeholder:text-text-secondary"
            />
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-bg-white rounded-[8px] shadow-lg border border-border-light z-50 max-h-[400px] overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors flex items-start gap-3 border-b border-border-light last:border-b-0"
                >
                  <div className="mt-0.5 text-text-secondary">
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{result.title}</p>
                    <p className="text-xs text-text-secondary truncate">{result.subtitle}</p>
                  </div>
                  <span className="text-xs text-text-muted capitalize bg-bg-hover px-2 py-1 rounded">
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          )}
          
          {/* No results message */}
          {showResults && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-bg-white rounded-[8px] shadow-lg border border-border-light z-50 p-4 text-center text-text-secondary text-sm">
              No results found for "{searchQuery}"
            </div>
          )}
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
