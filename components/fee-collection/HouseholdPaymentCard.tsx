'use client'

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Clock, AlertTriangle } from 'lucide-react';

interface PaymentItem {
  id: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'collected' | 'overdue';
  paymentDate?: string;
  method?: string;
}

interface HouseholdPaymentCardProps {
  unit: string;
  ownerName: string;
  balance: number;
  payments: PaymentItem[];
  onMarkAsPaid: (paymentId: string) => void;
}

export function HouseholdPaymentCard({ 
  unit, 
  ownerName, 
  balance, 
  payments,
  onMarkAsPaid 
}: HouseholdPaymentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collected': return <Check className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'collected': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'pending': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'overdue': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const overdueCount = payments.filter(p => p.status === 'overdue').length;
  const collectedCount = payments.filter(p => p.status === 'collected').length;

  // Sort payments: overdue first, then pending, then collected
  const sortedPayments = [...payments].sort((a, b) => {
    const order = { overdue: 0, pending: 1, collected: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="bg-bg-white rounded-[16px] shadow-lg border border-border-light overflow-hidden">
      {/* Header - Always visible */}
      <div 
        className="p-[20px] cursor-pointer hover:bg-bg-hover transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-semibold text-text-primary text-lg">{unit}</h3>
              <p className="text-text-secondary text-sm">{ownerName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status Summary */}
            <div className="flex items-center gap-2">
              {overdueCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {overdueCount}
                </span>
              )}
              {pendingCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  {pendingCount}
                </span>
              )}
              {collectedCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium">
                  <Check className="w-3 h-3" />
                  {collectedCount}
                </span>
              )}
            </div>

            {/* Balance */}
            <div className="text-right">
              <p className="text-text-secondary text-xs">Balance</p>
              <p className={`font-semibold text-lg ${balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatCurrency(balance)}
              </p>
            </div>

            {/* Expand/Collapse */}
            <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payments List - Expandable with animation */}
      <div 
        className={`border-t border-border-light overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {sortedPayments.length === 0 ? (
          <div className="p-4 text-center text-text-secondary">
            No payments recorded
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {sortedPayments.map((payment) => (
              <div 
                key={payment.id} 
                className="p-4 flex items-center justify-between hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(payment.status)}
                  <div>
                    <p className="font-medium text-text-primary text-sm">{payment.category}</p>
                    <p className="text-text-secondary text-xs">Due: {payment.dueDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">{formatCurrency(payment.amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>

                  {payment.status !== 'collected' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsPaid(payment.id);
                      }}
                      className="px-3 py-1.5 bg-brand-primary text-white text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
                    >
                      Mark Paid
                    </button>
                  ) : (
                    <div className="w-[76px] text-center">
                      <span className="text-green-600 dark:text-green-400 text-xs">
                        {payment.paymentDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

