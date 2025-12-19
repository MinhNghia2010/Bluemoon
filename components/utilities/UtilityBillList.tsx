'use client'

import { Zap, Droplet, Wifi, Check } from 'lucide-react';
import type { UtilityBill } from '../UtilitiesView';

interface UtilityBillListProps {
  bills: UtilityBill[];
  onEdit: (bill: UtilityBill) => void;
  onMarkAsPaid?: (id: string) => void;
}

export function UtilityBillList({ bills, onEdit, onMarkAsPaid }: UtilityBillListProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          bgColor: 'rgba(122, 197, 85, 0.1)',
          textColor: '#7AC555'
        };
      case 'pending':
        return {
          bgColor: 'rgba(213, 141, 73, 0.1)',
          textColor: '#D58D49'
        };
      case 'overdue':
        return {
          bgColor: 'rgba(216, 114, 125, 0.1)',
          textColor: '#D8727D'
        };
      default:
        return {
          bgColor: 'rgba(120, 116, 134, 0.1)',
          textColor: '#787486'
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-[20px]">
      {bills.map((bill) => {
        const statusStyle = getStatusStyle(bill.status);
        return (
          <div
            key={bill.id}
            className="bg-bg-white rounded-[16px] p-[24px] shadow-lg border border-border-light hover:border-[#5030e5] transition-colors cursor-pointer"
            onClick={() => onEdit(bill)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-[16px]">
              <div>
                <p className="font-semibold text-text-primary text-base mb-[4px]">{bill.unit}</p>
                <p className="text-text-secondary text-sm">{bill.ownerName}</p>
              </div>
              <div 
                className="px-[12px] py-[4px] rounded-full"
                style={{ backgroundColor: statusStyle.bgColor }}
              >
                <p 
                  className="text-xs font-medium"
                  style={{ color: statusStyle.textColor }}
                >
                  {getStatusText(bill.status)}
                </p>
              </div>
            </div>

            {/* Month */}
            <div className="mb-[16px] pb-[16px] border-b border-border-light">
              <p className="text-text-secondary text-xs mb-[4px]">Billing Period</p>
              <p className="text-text-primary text-sm font-medium">{bill.month}</p>
            </div>

            {/* Usage Details */}
            <div className="space-y-[12px] mb-[16px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <Zap className="size-[16px] text-[#5030e5]" />
                  <p className="text-text-secondary text-xs">Electricity</p>
                </div>
                <div className="text-right">
                  <p className="text-text-primary text-xs font-medium">${bill.electricityCost.toFixed(2)}</p>
                  <p className="text-text-secondary text-[10px]">{bill.electricityUsage} kWh</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <Droplet className="size-[16px] text-[#5030e5]" />
                  <p className="text-text-secondary text-xs">Water</p>
                </div>
                <div className="text-right">
                  <p className="text-text-primary text-xs font-medium">${bill.waterCost.toFixed(2)}</p>
                  <p className="text-text-secondary text-[10px]">{bill.waterUsage} m³</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <Wifi className="size-[16px] text-[#5030e5]" />
                  <p className="text-text-secondary text-xs">Internet</p>
                </div>
                <p className="text-text-primary text-xs font-medium">${bill.internetCost.toFixed(2)}</p>
              </div>
            </div>

            {/* Total */}
            <div className="pt-[16px] border-t border-border-light">
              <div className="flex items-center justify-between">
                <p className="text-text-secondary text-xs">Total Amount</p>
                <p className="font-semibold text-[#5030e5] text-lg">${bill.totalCost.toFixed(2)}</p>
              </div>
            </div>

            {/* Mark as Paid Button */}
            {bill.status !== 'paid' && onMarkAsPaid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsPaid(bill.id);
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark as Paid
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
