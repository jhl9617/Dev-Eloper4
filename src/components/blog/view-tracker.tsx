'use client';

import { useViewTracker } from '@/hooks/use-view-tracker';

interface ViewTrackerProps {
  postId: string;
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  useViewTracker({ postId, enabled: true });
  
  // This component is invisible and only tracks views
  return null;
}