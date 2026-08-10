import React from 'react';
import { getHeldItemById } from '../data/heldItems';

interface HeldItemBadgeProps {
  itemId?: string;
  isConsumed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

export const HeldItemBadge: React.FC<HeldItemBadgeProps> = ({
  itemId,
  isConsumed = false,
  size = 'md',
  showLabel = true,
  onClick,
}) => {
  const item = getHeldItemById(itemId);

  if (!item) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-2.5 py-1 gap-2 font-black',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center border-2 border-black font-black uppercase shadow-[2px_2px_0px_#000] transition-all select-none ${
        sizeClasses[size]
      } ${
        isConsumed
          ? 'bg-slate-800 border-slate-600 text-slate-500 line-through opacity-75'
          : item.category === 'choice'
          ? 'bg-red-500 text-white'
          : item.category === 'defensive'
          ? 'bg-blue-600 text-white'
          : item.category === 'offensive'
          ? 'bg-purple-600 text-white'
          : item.category === 'recovery'
          ? 'bg-emerald-600 text-white'
          : 'bg-amber-500 text-black'
      } ${onClick ? 'cursor-pointer hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]' : ''}`}
      title={`${item.name} (${item.nameEn}): ${item.description}${isConsumed ? ' [이번 배틀에서 이미 소모됨]' : ''}`}
    >
      <span className="text-sm leading-none">{item.icon}</span>
      {showLabel && (
        <span className="truncate max-w-[120px]">
          {item.name}
          {isConsumed && ' (소모됨)'}
        </span>
      )}
    </div>
  );
};
