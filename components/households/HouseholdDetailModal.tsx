import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '../shared/Modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface Household {
  id: string;
  unit: string;
  ownerName: string;
  residents: number;
  status: 'paid' | 'pending' | 'overdue';
  balance: number;
  phone: string;
  email: string;
}

interface HouseholdDetailModalProps {
  household: Household | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export function HouseholdDetailModal({ household, onClose, onEdit, onDelete }: HouseholdDetailModalProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  if (!household) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' };
      case 'pending': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' };
      case 'overdue': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' };
      default: return { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-text-secondary' };
    }
  };

  const statusColor = getStatusColor(household.status);

  return (
    <Modal isOpen={!!household} onClose={onClose}>
      <div className="flex items-start justify-between mb-[24px]">
        <div>
          <h3 className="font-semibold text-text-primary text-[24px]">{household.unit}</h3>
          <p className="text-text-secondary text-[16px]">Household Details</p>
        </div>
        <button 
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="space-y-[16px]">
        <div>
          <p className="font-medium text-text-secondary text-[12px] mb-[4px]">Owner Name</p>
          <p className="text-text-primary text-[16px]">{household.ownerName}</p>
        </div>
        <div>
          <p className="font-medium text-text-secondary text-[12px] mb-[4px]">Number of Residents</p>
          <p className="text-text-primary text-[16px]">{household.residents} people</p>
        </div>
        <div>
          <p className="font-medium text-text-secondary text-[12px] mb-[4px]">Payment Status</p>
          <div className={`${statusColor.bg} inline-block px-[12px] py-[6px] rounded-[4px]`}>
            <p className={`font-medium text-[14px] ${statusColor.text} capitalize`}>
              {household.status}
            </p>
          </div>
        </div>
        <div>
          <p className="font-medium text-text-secondary text-[12px] mb-[4px]">Outstanding Balance</p>
          <p className={`font-semibold text-[24px] ${household.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            ${household.balance.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="font-medium text-text-secondary text-[12px] mb-[4px]">Phone</p>
          <p className="text-text-primary text-[16px]">{household.phone}</p>
        </div>
        <div>
          <p className="font-medium text-text-secondary text-[12px] mb-[4px]">Email</p>
          <p className="text-text-primary text-[16px]">{household.email}</p>
        </div>
      </div>

      <div className="flex gap-[12px] mt-[24px]">
        <button 
          onClick={onEdit}
          className="flex-1 bg-brand-primary text-white px-[20px] py-[12px] rounded-[6px] font-medium text-[14px] hover:opacity-90 transition-opacity"
        >
          Edit Details
        </button>
        {onDelete && (
          <button 
            onClick={() => setShowDeleteAlert(true)}
            className="flex-1 flex items-center justify-center gap-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-[20px] py-[12px] rounded-[6px] font-medium text-[14px] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Remove Household
          </button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-bg-white border-border-light p-0 overflow-hidden">
          {/* Banner */}
          <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <AlertDialogTitle className="text-white text-lg font-semibold">
                Delete Household
              </AlertDialogTitle>
              <p className="text-white/80 text-sm">This action is irreversible</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-5">
            <AlertDialogDescription className="text-text-secondary text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-text-primary">{household.unit}</span>? 
              This will permanently remove all data associated with this household including:
            </AlertDialogDescription>
            <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Payment history and records
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Resident information
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Associated utility bills
              </li>
            </ul>
          </div>

          {/* Separator */}
          <div className="h-px bg-border-light"></div>

          {/* Footer */}
          <AlertDialogFooter className="px-6 pt-3 pb-4 gap-3">
            <AlertDialogCancel className="flex-1 sm:flex-none sm:min-w-[100px] border-border-light text-text-secondary hover:bg-bg-hover hover:text-text-primary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete?.();
                setShowDeleteAlert(false);
              }}
              className="flex-1 sm:flex-none sm:min-w-[100px] bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Modal>
  );
}
