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
      className="container py-8 lg:py-12"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-4 pb-8 lg:pb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Welcome to DevBlog
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Discover articles about web development, programming, and technology.
            Stay updated with the latest trends and best practices.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <MotionButton asChild size="lg" ripple glow>
            <Link href="/posts">
              <BookOpen className="mr-2 h-4 w-4" />
              {translations.allPosts}
            </Link>
          </MotionButton>
          <MotionButton variant="outline" size="lg" asChild>
            <Link href="/categories">
              {translations.categories}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </MotionButton>
        </div>
      </div>

      {/* Latest Posts Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
            {translations.recentPosts}
          </h2>
          {total > 6 && (
            <Button variant="outline" asChild>
              <Link href="/posts">
                {translations.allPosts}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{translations.noPostsFound}</h3>
            <p className="text-muted-foreground max-w-sm">
              There are no published articles yet. Check back soon for new content!
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
      </section>

      {/* Newsletter/CTA Section */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
            Stay Updated
          </h2>
          <p className="text-muted-foreground">
            Follow us for the latest articles and insights in web development.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/rss">
                RSS Feed
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about">
                {translations.about}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}