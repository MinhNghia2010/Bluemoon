'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Home, Receipt, Users, Car, Droplets, Flame, Wifi, Motorbike, Bike, Zap } from 'lucide-react';
import { PageHeader } from './shared/PageHeader';
import { SummaryCard } from './shared/SummaryCard';
import { FilterButtons } from './shared/FilterButtons';
import { statisticsApi } from '@/lib/api';
import { toast } from 'sonner';

// Skeleton Components
const ChartSkeleton = ({ title }: { title: string }) => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
    </div>
    <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded-xl flex items-end justify-around p-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="w-8 bg-gray-400 dark:bg-gray-500 rounded-t" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
      ))}
    </div>
  </div>
);

const PieChartSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl p-6">
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-6"></div>
    <div className="flex items-center justify-center">
      <div className="w-48 h-48 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
    </div>
    <div className="flex flex-wrap gap-3 mt-6 justify-center">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
      ))}
    </div>
  </div>
);

const LineChartSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl p-6">
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-36 mb-6"></div>
    <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded-xl relative overflow-hidden">
      <svg className="w-full h-full" preserveAspectRatio="none">
        <path d="M0,180 Q50,120 100,140 T200,100 T300,130 T400,80 T500,110" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-400 dark:text-gray-500" />
      </svg>
    </div>
  </div>
);

// Lazy load chart components
const MonthlyRevenueChart = dynamic(() => import('./statistics/MonthlyRevenueChart').then(mod => ({ default: mod.MonthlyRevenueChart })), {
  loading: () => <ChartSkeleton title="Monthly Revenue" />,
  ssr: false
});

const CategoryDistributionChart = dynamic(() => import('./statistics/CategoryDistributionChart').then(mod => ({ default: mod.CategoryDistributionChart })), {
  loading: () => <PieChartSkeleton />,
  ssr: false
});

const CollectionRateChart = dynamic(() => import('./statistics/CollectionRateChart').then(mod => ({ default: mod.CollectionRateChart })), {
  loading: () => <LineChartSkeleton />,
  ssr: false
});

// Get initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('bluemoon-statistics-state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
};

export function StatisticsView() {
  const initialState = getInitialState();
  
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'fees' | 'utilities' | 'parking'>(initialState?.activeTab || 'overview');

  // Save view state to localStorage
  useEffect(() => {
    localStorage.setItem('bluemoon-statistics-state', JSON.stringify({ activeTab }));
  }, [activeTab]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const data = await statisticsApi.get();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Format currency in USD
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {/* Page Header Skeleton */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          </div>
        </div>
        {/* Filter Tabs Skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
          ))}
        </div>
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          ))}
        </div>
        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Prepare monthly chart data with collected, pending, overdue
  const monthlyData = (stats?.monthlyRevenue || []).map((item: any) => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    collected: item.collected || 0,
    pending: item.pending || 0,
    overdue: item.overdue || 0,
    total: item.total || 0
  }));

  // Category distribution (fee categories only)
  const categoryData = (stats?.categoryDistribution || [])
    .filter((item: any) => item.totalValue > 0)
    .map((item: any, index: number) => ({
      name: item.name,
      value: item.totalValue,
      color: ['#5030e5', '#7AC555', '#d58d49', '#76A5EA', '#E4CCFD', '#FF6B6B'][index % 6]
    }));

  // Utility type distribution
  const utilityTypeData = stats?.utilities?.byType ? [
    { name: 'Electricity', value: stats.utilities.byType.electricity.amount, color: '#FFB020' },
    { name: 'Water', value: stats.utilities.byType.water.amount, color: '#3B82F6' },
    { name: 'Internet', value: stats.utilities.byType.internet.amount, color: '#10B981' },
    { name: 'Gas', value: stats.utilities.byType.gas.amount, color: '#F97316' }
  ].filter(item => item.value > 0) : [];

  // Utility types config
  const utilityTypes = [
    { key: 'electricity', name: 'Electricity', color: '#FFB020', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-600 dark:text-yellow-400', icon: Zap },
    { key: 'water', name: 'Water', color: '#3B82F6', bgColor: 'bg-blue-50 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400', icon: Droplets },
    { key: 'internet', name: 'Internet', color: '#10B981', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400', icon: Wifi },
    { key: 'gas', name: 'Gas', color: '#F97316', bgColor: 'bg-orange-50 dark:bg-orange-900/30', textColor: 'text-orange-600 dark:text-orange-400', icon: Flame }
  ];

  // Vehicle types config
  const vehicleTypes = [
    { key: 'car', name: 'Cars', bgColor: 'bg-blue-50 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400', icon: Car },
    { key: 'motorcycle', name: 'Motorcycles', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400', icon: Motorbike },
    { key: 'bicycle', name: 'Bicycles', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-600 dark:text-yellow-400', icon: Bike }
  ];

  // All fees distribution (for overview pie chart)
  const feeCategoryColors = ['#5030e5', '#7AC555', '#d58d49', '#76A5EA', '#E4CCFD'];
  
  const allFeesData: { name: string; value: number; color: string }[] = [
    // Fee categories
    ...(stats?.categoryDistribution || [])
      .filter((cat: any) => cat.totalValue > 0)
      .map((cat: any, index: number) => ({
        name: cat.name,
        value: cat.totalValue,
        color: feeCategoryColors[index % feeCategoryColors.length]
      })),
    // Utilities by type
    ...utilityTypes
      .filter(type => stats?.utilities?.byType?.[type.key]?.amount > 0)
      .map(type => ({
        name: type.name,
        value: stats.utilities.byType[type.key].amount,
        color: type.color
      })),
    // Parking revenue
    ...(stats?.parking?.monthlyRevenue > 0 
      ? [{ name: 'Parking', value: stats.parking.monthlyRevenue, color: '#8B5CF6' }] 
      : [])
  ];

  // Collection rate data
  const collectionRateData = monthlyData.map((item: any) => ({
    month: item.month,
    rate: item.total > 0 ? Math.round((item.collected / item.total) * 100) : 0
  }));

  // Tab content rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        const overviewSummaryCards = [
          { title: 'Total Collected', value: formatCurrency(stats?.financials?.totalCollected || 0), subtitle: 'All sources', dotColor: 'bg-[#7AC555]', valueColor: 'text-green-600 dark:text-green-400' },
          { title: 'Total Pending', value: formatCurrency(stats?.financials?.totalPending || 0), subtitle: 'Awaiting payment', dotColor: 'bg-[#d58d49]', valueColor: 'text-orange-600 dark:text-orange-400' },
          { title: 'Total Overdue', value: formatCurrency(stats?.financials?.totalOverdue || 0), subtitle: 'Past due date', dotColor: 'bg-[#D34B5E]', valueColor: 'text-red-600 dark:text-red-400' },
          { title: 'Grand Total', value: formatCurrency(stats?.financials?.grandTotal || 0), subtitle: 'All fees combined', dotColor: 'bg-[#5030e5]', valueColor: 'text-purple-600 dark:text-purple-400' }
        ];

        const maxHouseholds = 100;
        const totalHouseholds = stats?.overview?.totalHouseholds || 0;
        const availableHouseholds = maxHouseholds - totalHouseholds;
        
        const quickStats = [
          { icon: Home, label: 'Households', value: totalHouseholds, subtitle: `${availableHouseholds} available`, bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
          { icon: Users, label: 'Total Residents', value: stats?.overview?.totalResidents || 0, subtitle: 'All members', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-400' },
          { icon: Car, label: 'Occupied Vehicles', value: `${stats?.overview?.totalParkingSlots || 0}/${stats?.overview?.maxParkingSlots || 500}`, subtitle: `${(stats?.overview?.maxParkingSlots || 500) - (stats?.overview?.totalParkingSlots || 0)} available`, bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' },
          { icon: Receipt, label: 'Fee Payments', value: stats?.overview?.totalPayments || 0, subtitle: `${stats?.overview?.collectedPayments || 0} collected`, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' }
        ];

        return (
          <>
            {/* Grand Total Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
              {overviewSummaryCards.map((card, index) => (
                <SummaryCard key={index} {...card} />
              ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-bg-white rounded-lg p-5 shadow-lg border border-border-light">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <span className="text-sm text-text-secondary">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-secondary mt-1">{stat.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="space-y-5">
              {monthlyData.length > 0 && <MonthlyRevenueChart data={monthlyData} />}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {allFeesData.length > 0 && (
                  <CategoryDistributionChart data={allFeesData} title="All Fees Distribution" />
                )}
                {collectionRateData.length > 0 && <CollectionRateChart data={collectionRateData} />}
              </div>
            </div>
          </>
        );

      case 'fees':
        const feeSummaryCards = [
          { title: 'Collected', value: formatCurrency(stats?.feePayments?.collected || 0), subtitle: `${stats?.overview?.collectedPayments || 0} payments`, dotColor: 'bg-[#7AC555]', valueColor: 'text-green-600 dark:text-green-400' },
          { title: 'Pending', value: formatCurrency(stats?.feePayments?.pending || 0), subtitle: `${stats?.overview?.pendingPayments || 0} payments`, dotColor: 'bg-[#d58d49]', valueColor: 'text-orange-600 dark:text-orange-400' },
          { title: 'Overdue', value: formatCurrency(stats?.feePayments?.overdue || 0), subtitle: `${stats?.overview?.overduePayments || 0} payments`, dotColor: 'bg-[#D34B5E]', valueColor: 'text-red-600 dark:text-red-400' },
          { title: 'Collection Rate', value: `${stats?.overview?.feeCollectionRate || 0}%`, subtitle: `${stats?.overview?.totalPayments || 0} total`, dotColor: 'bg-[#5030e5]', valueColor: 'text-purple-600 dark:text-purple-400' }
        ];

        return (
          <>
            {/* Fee Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
              {feeSummaryCards.map((card, index) => (
                <SummaryCard key={index} {...card} />
              ))}
            </div>

            {/* Category Breakdown */}
            <div className="bg-bg-white rounded-lg p-6 shadow-lg border border-border-light mb-8">
              <h3 className="font-semibold text-text-primary text-lg mb-4">Fee Categories</h3>
              <div className="space-y-4">
                {(stats?.categoryDistribution || []).map((cat: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-bg-hover rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">{cat.name}</p>
                      <p className="text-sm text-text-secondary">{cat.count} payments × {formatCurrency(cat.amount)}</p>
                    </div>
                    <p className="font-semibold text-text-primary">{formatCurrency(cat.totalValue)}</p>
                  </div>
                ))}
              </div>
            </div>

            {categoryData.length > 0 && <CategoryDistributionChart data={categoryData} />}
          </>
        );

      case 'utilities':
        const utilitySummaryCards = [
          { title: 'Paid', value: formatCurrency(stats?.utilities?.paid || 0), subtitle: `${stats?.overview?.paidUtilityBills || 0} bills`, dotColor: 'bg-[#7AC555]', valueColor: 'text-green-600 dark:text-green-400' },
          { title: 'Pending', value: formatCurrency(stats?.utilities?.pending || 0), subtitle: `${stats?.overview?.pendingUtilityBills || 0} bills`, dotColor: 'bg-[#d58d49]', valueColor: 'text-orange-600 dark:text-orange-400' },
          { title: 'Overdue', value: formatCurrency(stats?.utilities?.overdue || 0), subtitle: `${stats?.overview?.overdueUtilityBills || 0} bills`, dotColor: 'bg-[#D34B5E]', valueColor: 'text-red-600 dark:text-red-400' },
          { title: 'Collection Rate', value: `${stats?.overview?.utilityCollectionRate || 0}%`, subtitle: `${stats?.overview?.totalUtilityBills || 0} total`, dotColor: 'bg-[#5030e5]', valueColor: 'text-purple-600 dark:text-purple-400' }
        ];

        return (
          <>
            {/* Utility Bill Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
              {utilitySummaryCards.map((card, index) => (
                <SummaryCard key={index} {...card} />
              ))}
            </div>

            {/* Utility Type Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div className="bg-bg-white rounded-lg p-6 shadow-lg border border-border-light">
                <h3 className="font-semibold text-text-primary text-lg mb-4">By Utility Type</h3>
                <div className="space-y-4">
                  {utilityTypes.map((type) => (
                    <div key={type.key} className={`flex items-center justify-between p-4 ${type.bgColor} rounded-lg`}>
                      <div className="flex items-center gap-3">
                        <type.icon className={`w-5 h-5 ${type.textColor}`} />
                        <div>
                          <p className="font-medium text-text-primary">{type.name}</p>
                          <p className="text-sm text-text-secondary">{stats?.utilities?.byType?.[type.key]?.count || 0} bills</p>
                        </div>
                      </div>
                      <p className="font-semibold text-text-primary">{formatCurrency(stats?.utilities?.byType?.[type.key]?.amount || 0)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {utilityTypeData.length > 0 && <CategoryDistributionChart data={utilityTypeData} />}
            </div>
          </>
        );

      case 'parking':
        const maxSlots = stats?.parking?.maxSlots || 500;
        const parkingSummaryCards = [
          { title: 'Occupied Vehicles', value: `${stats?.parking?.total || 0}/${maxSlots}`, subtitle: `${stats?.parking?.available || 0} slots available`, dotColor: 'bg-[#5030e5]', valueColor: 'text-purple-600 dark:text-purple-400' },
          { title: 'Monthly Revenue', value: formatCurrency(stats?.parking?.monthlyRevenue || 0), subtitle: 'From all vehicles', dotColor: 'bg-[#76A5EA]', valueColor: 'text-blue-600 dark:text-blue-400' }
        ];

        return (
          <>
            {/* Parking Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {parkingSummaryCards.map((card, index) => (
                <SummaryCard key={index} {...card} />
              ))}
            </div>

            {/* Parking Type Breakdown */}
            <div className="bg-bg-white rounded-lg p-6 shadow-lg border border-border-light">
              <h3 className="font-semibold text-text-primary text-lg mb-4">By Vehicle Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vehicleTypes.map((type) => (
                  <div key={type.key} className={`flex items-center justify-between p-4 ${type.bgColor} rounded-lg`}>
                    <div className="flex items-center gap-3">
                      <type.icon className={`w-6 h-6 ${type.textColor}`} />
                      <div>
                        <p className="font-medium text-text-primary">{type.name}</p>
                        <p className="text-sm text-text-secondary">Parking slots</p>
                      </div>
                    </div>
                    <p className={`text-2xl font-bold ${type.textColor}`}>{stats?.parking?.byType?.[type.key] || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Statistics"
        description="Comprehensive financial reports and analytics"
      />

      {/* Filters */}
      <FilterButtons
        filters={[
          { id: 'overview', label: 'Overview' },
          { id: 'fees', label: 'Fee Payments' },
          { id: 'utilities', label: 'Utility Bills' },
          { id: 'parking', label: 'Parking' }
        ]}
        activeFilter={activeTab}
        onFilterChange={(id) => setActiveTab(id as typeof activeTab)}
        variant="primary"
      />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
