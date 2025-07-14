"use client";

import { ThemeProvider } from '@/components/theme/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NoSSR } from '@/components/no-ssr';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <NoSSR>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="devblog-theme"
        >
          {children}
        </ThemeProvider>
      </NoSSR>
    </QueryClientProvider>
  );
}