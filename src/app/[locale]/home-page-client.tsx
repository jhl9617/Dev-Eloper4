'use client';

import { motion } from 'framer-motion';
import { PostCard } from '@/components/blog/post-card';
import { Button } from '@/components/ui/button';
import { MotionButton } from '@/components/ui/motion-button';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { containerVariants, pageVariants } from '@/lib/animations';

interface HomePageClientProps {
  posts: any[];
  total: number;
  translations: {
    allPosts: string;
    recentPosts: string;
    noPostsFound: string;
    categories: string;
    about: string;
  };
}

export function HomePageClient({ posts, total, translations }: HomePageClientProps) {
  return (
    <motion.div 
      className="min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Compact Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-gray-50 dark:to-gray-900 py-12 lg:py-16">
        <div className="container px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h1 
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="bg-gradient-to-r from-foreground via-foreground to-gray-600 bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Dev-eloper
              </span>
            </motion.h1>
            <motion.p 
              className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Web development, programming, and technology insights
            </motion.p>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  {translations.recentPosts}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl">
                  Latest articles and insights on web development and technology
                </p>
              </div>
              {total > 6 && (
                <Button variant="outline" asChild className="mt-4 lg:mt-0 rounded-full px-6 py-3 font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                  <Link href="/posts">
                    {translations.allPosts}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{translations.noPostsFound}</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg">
                  There are no published articles yet. Check back soon for new content!
                </p>
              </div>
            ) : (
              <motion.div 
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {posts.map((post: any, index: number) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    priority={index === 0}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Compact CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-background dark:from-gray-900 dark:to-background">
        <div className="container px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Stay Updated
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Follow for the latest in web development and technology
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="outline" asChild className="rounded-full px-6 py-3 text-sm font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                <Link href="/rss">
                  RSS Feed
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full px-6 py-3 text-sm font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                <Link href="/about">
                  {translations.about}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}