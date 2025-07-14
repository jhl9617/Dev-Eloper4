'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/lib/animations';
import { Button, ButtonProps } from '@/components/ui/button';

interface MotionButtonProps extends Omit<ButtonProps, 'onAnimationStart' | 'onAnimationEnd'> {
  children: React.ReactNode;
  ripple?: boolean;
  glow?: boolean;
  float?: boolean;
}

export const MotionButton = React.forwardRef<
  HTMLButtonElement,
  MotionButtonProps
>(({ 
  className, 
  variant, 
  size, 
  children, 
  ripple = false,
  glow = false,
  float = false,
  asChild,
  ...props 
}, ref) => {
  return (
    <motion.div
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className="inline-block"
    >
      <Button
        className={cn(
          "relative",
          float && "animate-float",
          glow && "animate-glow",
          className
        )}
        variant={variant}
        size={size}
        asChild={asChild}
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
});

MotionButton.displayName = "MotionButton";