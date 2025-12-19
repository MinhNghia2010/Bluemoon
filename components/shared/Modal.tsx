'use client'

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, children, maxWidth = '500px' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-bg-white rounded-[16px] p-[32px] shadow-2xl border border-border-light"
        style={{ width: maxWidth, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
