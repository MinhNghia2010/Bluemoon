'use client'

import { AddSquareIcon } from './AddSquareIcon';

interface PageHeaderProps {
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  rightContent?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  buttonLabel, 
  onButtonClick,
  rightContent 
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-[40px]">
      <div>
        <h1 className="font-semibold text-text-primary text-[32px] mb-[8px]">{title}</h1>
        <p className="text-text-secondary text-base">{description}</p>
      </div>
      
      {rightContent ? (
        rightContent
      ) : buttonLabel && onButtonClick ? (
        <button 
          onClick={onButtonClick}
          className="flex items-center gap-[8px] bg-[#5030e5] text-white px-[20px] py-[12px] rounded-[6px] hover:bg-[#4024c4] transition-colors"
        >
          <div className="relative size-[20px]">
            <AddSquareIcon className="relative size-[20px]" />
          </div>
          <span className="font-medium text-[16px]">{buttonLabel}</span>
        </button>
      ) : null}
    </div>
  );
}
