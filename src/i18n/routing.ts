import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);