'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge, BadgeProps } from '@/components/ui/badge';

interface MotionBadgeProps extends Omit<BadgeProps, 'onAnimationStart' | 'onAnimationEnd'> {
  children: React.ReactNode;
  pulse?: boolean;
  bounce?: boolean;
}

export function MotionBadge({ 
  className, 
  variant, 
  children, 
  pulse = false,
  bounce = false,
  ...props 
}: MotionBadgeProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="inline-block"
    >
      <Badge
        variant={variant}
        className={cn(
          "cursor-pointer transition-colors",
          pulse && "animate-pulse",
          bounce && "animate-bounce",
          className
        )}
        {...props}
      >
        {children}
      </Badge>
    </motion.div>
  );
}