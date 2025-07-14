import { Suspense } from 'react';
import { getPublishedPosts } from '@/lib/blog';
import { PostCard } from '@/components/blog/post-card';
import { Button } from '@/components/ui/button';
import { MotionButton } from '@/components/ui/motion-button';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { JsonLd } from '@/components/seo/json-ld';
import { getTranslations } from 'next-intl/server';
import { HomePageClient } from './home-page-client';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const { posts, total } = await getPublishedPosts(6);
  
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tNav = await getTranslations({ locale, namespace: 'navigation' });

  // Resolve translations to strings
  const translations = {
    allPosts: t('allPosts'),
    recentPosts: t('recentPosts'),
    noPostsFound: t('noPostsFound'),
    categories: tNav('categories'),
    about: tNav('about'),
  };

  return (
    <>
      <JsonLd type="website" />
      <JsonLd type="blog" />
      <HomePageClient 
        posts={posts}
        total={total}
        translations={translations}
      />
    </>
  );
}