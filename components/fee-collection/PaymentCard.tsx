'use client'

import { Edit2, Trash2 } from 'lucide-react';

interface Payment {
  id: string;
  unit: string;
  ownerName: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'collected' | 'overdue';
  paymentDate?: string;
  method?: string;
}

interface PaymentCardProps {
  payment: Payment;
  onMarkAsPaid: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PaymentCard({ payment, onMarkAsPaid, onEdit, onDelete }: PaymentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected': return { bg: 'bg-[rgba(122,197,85,0.2)]', text: 'text-[#7AC555]' };
      case 'pending': return { bg: 'bg-[rgba(223,168,116,0.2)]', text: 'text-[#d58d49]' };
      case 'overdue': return { bg: 'bg-[rgba(211,75,94,0.2)]', text: 'text-[#D34B5E]' };
      default: return { bg: 'bg-neutral-100', text: 'text-[#787486]' };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statusColor = getStatusColor(payment.status);

  return (
    <div className="bg-bg-white rounded-[16px] p-[20px] shadow-lg border border-border-light hover:shadow-xl transition-shadow">
      {/* Header with status and actions */}
      <div className="flex items-center justify-between mb-[12px]">
        <div className={`${statusColor.bg} inline-block px-[12px] py-[4px] rounded-[4px]`}>
          <p className={`font-medium text-xs ${statusColor.text} capitalize`}>{payment.status}</p>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4 text-text-secondary" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-[16px]">
        <p className="font-semibold text-text-primary text-base mb-[4px]">{payment.unit}</p>
        <p className="text-text-secondary text-sm">{payment.ownerName}</p>
      </div>

      <div className="mb-[12px]">
        <p className="text-text-secondary text-xs mb-[2px]">Category</p>
        <p className="font-medium text-text-primary text-sm">{payment.category}</p>
      </div>
      
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <p className="text-text-secondary text-xs mb-[4px]">Amount</p>
          <p className="font-semibold text-text-primary text-lg">{formatCurrency(payment.amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-text-secondary text-xs mb-[4px]">Due Date</p>
          <p className="font-medium text-text-primary text-sm">{payment.dueDate}</p>
        </div>
      </div>

      {payment.status === 'collected' && payment.paymentDate && (
        <div className="mb-[16px] p-3 bg-green-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Paid on:</span>
            <span className="font-medium text-green-700">{payment.paymentDate}</span>
          </div>
          {payment.method && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-text-secondary">Method:</span>
              <span className="font-medium text-green-700 capitalize">{payment.method.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      )}
      
      {payment.status !== 'collected' && (
        <button 
          onClick={onMarkAsPaid}
          className="btn-primary w-full text-sm"
        >
          Mark as Paid
        </button>
      )}
    </div>
  );
}
