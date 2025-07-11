'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AutoSaveOptions {
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions
) {
  const { onSave, delay = 5000, enabled = true } = options;
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>();
  const isSavingRef = useRef<boolean>(false);

  const save = useCallback(async () => {
    if (isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedRef.current = JSON.stringify(data);
      
      toast({
        description: 'Draft saved automatically',
        duration: 2000,
      });
    } catch (error) {
      console.error('Auto-save error:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to auto-save draft',
        duration: 3000,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, toast]);

  useEffect(() => {
    if (!enabled || !data) return;

    const currentData = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentData === lastSavedRef.current) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    save,
    isSaving: isSavingRef.current,
  };
}