'use client'

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, children, maxWidth = '500px' }: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 overflow-hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-bg-white rounded-2xl p-8 shadow-2xl border border-border-light max-h-[90vh] overflow-hidden flex flex-col"
        style={{ width: maxWidth, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
