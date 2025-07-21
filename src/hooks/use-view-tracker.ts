'use client';

import { useEffect, useRef } from 'react';

interface UseViewTrackerProps {
  postId: string;
  enabled?: boolean;
}

export function useViewTracker({ postId, enabled = true }: UseViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled || !postId || hasTracked.current) {
      return;
    }

    const trackView = async () => {
      try {
        // Generate a simple session ID for tracking
        const sessionId = sessionStorage.getItem('blog-session-id') || 
          (() => {
            const id = Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('blog-session-id', id);
            return id;
          })();

        const response = await fetch(`/api/posts/${postId}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          hasTracked.current = true;
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };

    // Track view after a short delay to ensure user is actually reading
    const timeoutId = setTimeout(trackView, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [postId, enabled]);
}

export function useViewCount(postId: string) {
  const getViewCount = async (): Promise<number> => {
    try {
      const response = await fetch(`/api/posts/${postId}/views`);
      if (response.ok) {
        const data = await response.json();
        return data.viewCount || 0;
      }
    } catch (error) {
      console.error('Failed to fetch view count:', error);
    }
    return 0;
  };

  return { getViewCount };
}