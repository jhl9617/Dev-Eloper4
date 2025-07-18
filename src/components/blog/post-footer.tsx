'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { AdminActions } from '@/components/blog/admin-actions';
import type { PostWithRelations } from '@/lib/blog';

interface PostFooterProps {
  post: PostWithRelations;
}

export function PostFooter({ post }: PostFooterProps) {
  const { isAdmin } = useAuth();
  const t = useTranslations('blog');
  const tCommon = useTranslations('common');
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.title,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing or sharing failed
        console.log('Sharing failed or was cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  return (
    <footer className="space-y-8">
      <Separator />
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/posts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToPosts')}
          </Link>
        </Button>
        
        <div className="flex items-center space-x-2">
          {isAdmin && <AdminActions post={post} />}
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            {tCommon('share')}
          </Button>
        </div>
      </div>

      {/* Category and Tags Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          {t('filedUnder')}{' '}
          {post.category && (
            <Link 
              href={`/categories/${post.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags && post.tags.length > 0 && (
            <>
              {' '}{t('withTags')}{' '}
              {post.tags.map((tag, index) => (
                <span key={tag.id}>
                  <Link 
                    href={`/tags/${tag.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {tag.name}
                  </Link>
                  {index < post.tags!.length - 1 && ', '}
                </span>
              ))}
            </>
          )}
        </p>
      </div>
    </footer>
  );
}