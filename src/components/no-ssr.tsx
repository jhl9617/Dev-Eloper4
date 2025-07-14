'use client';

import { useEffect, useState } from 'react';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function NoSSR({ children, fallback }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {fallback || (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}