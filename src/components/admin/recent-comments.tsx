'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  ExternalLink, 
  Calendar, 
  User, 
  Reply,
  Eye,
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  parent_id?: string;
  posts: {
    id: string;
    title: string;
    slug: string;
  };
  parent_comment?: {
    id: string;
    content: string;
    author_name: string;
  };
  reactionCounts: {
    like: number;
    dislike: number;
    total: number;
  };
}

interface RecentCommentsProps {
  limit?: number;
  showViewAll?: boolean;
}

export function RecentComments({ limit = 5, showViewAll = true }: RecentCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');

  const fetchRecentComments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/comments?page=1&limit=${limit}&sort=newest`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentComments();
  }, [limit]);

  const truncateContent = (content: string, maxLength: number = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getCommentUrl = (comment: Comment) => {
    return `/posts/${comment.posts.slug}#comment-${comment.id}`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {t('recentComments')}
            </CardTitle>
            <CardDescription>
              {t('recentActivity')}
            </CardDescription>
          </div>
          {showViewAll && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/comments">
                <Eye className="w-4 h-4 mr-2" />
                {t('viewAllComments')}
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('noRecentComments')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true,
                            locale: ko 
                          })}
                        </span>
                        {comment.parent_id && (
                          <Badge variant="outline" className="text-xs">
                            <Reply className="w-2 h-2 mr-1" />
                            답글
                          </Badge>
                        )}
                      </div>

                      {/* Parent comment preview (if reply) */}
                      {comment.parent_comment && (
                        <div className="bg-muted/30 rounded p-2 mb-2 border-l-2 border-muted">
                          <p className="text-xs text-muted-foreground">
                            {t('replyToUser', { author: comment.parent_comment.author_name })}
                          </p>
                          <p className="text-xs">
                            {truncateContent(comment.parent_comment.content, 40)}
                          </p>
                        </div>
                      )}

                      {/* Comment content */}
                      <Link
                        href={getCommentUrl(comment)}
                        className="block hover:text-primary transition-colors"
                      >
                        <p className="text-sm text-muted-foreground mb-2 cursor-pointer">
                          {truncateContent(comment.content, 80)}
                        </p>
                      </Link>

                      {/* Post info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Link 
                            href={`/posts/${comment.posts.slug}`}
                            className="hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <span>{truncateContent(comment.posts.title, 30)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        
                        {comment.reactionCounts.total > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {comment.reactionCounts.total} {t('reactions')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}