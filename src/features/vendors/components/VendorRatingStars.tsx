'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface VendorRatingStarsProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function VendorRatingStars({
  rating,
  maxRating = 5,
  interactive = false,
  onChange,
  size = 'md',
}: VendorRatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            className={`transition-colors ${
              interactive
                ? 'cursor-pointer hover:scale-110 focus:outline-none'
                : 'cursor-default'
            }`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200'
              }`}
            />
          </button>
        );
      })}
      <span className="text-xs font-semibold ml-1 text-slate-500">
        {rating}/{maxRating}
      </span>
    </div>
  );
}
