import React from 'react';
import { PokemonType } from '../types/pokemon';
import { TYPE_COLORS } from '../data/typeChart';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md' }) => {
  const color = TYPE_COLORS[type] || TYPE_COLORS.노말;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.2 font-black',
    md: 'text-xs px-2.5 py-0.5 font-black',
    lg: 'text-sm px-3 py-1 font-black',
  };

  return (
    <span
      id={`type-badge-${type}`}
      className={`inline-flex items-center justify-center border-2 border-black tracking-tight uppercase shadow-[1px_1px_0px_#000] select-none ${
        color.bg
      } ${color.text} ${sizeClasses[size]}`}
    >
      {type}
    </span>
  );
};

