'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  User, 
  Hash,
  ThumbsUp,
  ThumbsDown,
  Reply,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
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

interface CommentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CommentsResponse {
  comments: Comment[];
  pagination: CommentsPagination;
}

export default function CommentsManagementPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<CommentsPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [deleting, setDeleting] = useState<string | null>(null);

  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('admin');
  const tComments = useTranslations('comments');
  const tCommon = useTranslations('common');

  const fetchComments = useCallback(async (page: number = 1, sort: string = 'newest') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/comments?page=${page}&limit=${pagination.limit}&sort=${sort}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data: CommentsResponse = await response.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    fetchComments(1, newSort);
  };

  const handlePageChange = (newPage: number) => {
    fetchComments(newPage, sortBy);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(tComments('confirmDeleteComment'))) {
      return;
    }

    setDeleting(commentId);
    
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove comment from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      
      toast({
        title: tComments('commentDeleted'),
        description: tComments('commentDeletedSuccess'),
      });
    } catch (err) {
      toast({
        title: tComments('deleteFailed'),
        description: tComments('deleteCommentFailed'),
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getCommentUrl = (comment: Comment) => {
    return `/posts/${comment.posts.slug}#comment-${comment.id}`;
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchComments();
    }
  }, [user, isAdmin, fetchComments]);

  if (authLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">접근 거부</h1>
          <p className="text-muted-foreground">이 페이지에 접근할 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="w-8 h-8" />
            댓글 관리
          </h1>
          <p className="text-muted-foreground mt-2">
            블로그의 모든 댓글을 관리하고 모니터링할 수 있습니다.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="정렬 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="oldest">오래된순</SelectItem>
              <SelectItem value="post">게시물별</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchComments(pagination.page, sortBy)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {tCommon('refresh')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 댓글 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">이 페이지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">전체 페이지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalPages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>댓글 목록</CardTitle>
          <CardDescription>
            댓글을 클릭하면 해당 게시물로 이동합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">댓글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Comment header */}
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{comment.author_name}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDistanceToNow(new Date(comment.created_at), { 
                                  addSuffix: true,
                                  locale: ko 
                                })}
                              </span>
                              {comment.parent_id && (
                                <Badge variant="secondary" className="text-xs">
                                  <Reply className="w-3 h-3 mr-1" />
                                  답글
                                </Badge>
                              )}
                            </div>

                            {/* Parent comment (if reply) */}
                            {comment.parent_comment && (
                              <div className="bg-muted/50 rounded-lg p-3 mb-3 border-l-4 border-muted">
                                <p className="text-sm text-muted-foreground mb-1">
                                  {comment.parent_comment.author_name}님의 댓글에 답글:
                                </p>
                                <p className="text-sm">
                                  {truncateContent(comment.parent_comment.content, 80)}
                                </p>
                              </div>
                            )}

                            {/* Comment content */}
                            <Link
                              href={getCommentUrl(comment)}
                              className="block hover:text-primary transition-colors"
                            >
                              <p className="text-sm leading-relaxed mb-3 cursor-pointer">
                                {comment.content}
                              </p>
                            </Link>

                            {/* Post info */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                <Link 
                                  href={`/posts/${comment.posts.slug}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {comment.posts.title}
                                </Link>
                                <ExternalLink className="w-3 h-3" />
                              </div>
                              
                              {comment.reactionCounts.total > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>{comment.reactionCounts.like}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ThumbsDown className="w-3 h-3" />
                                    <span>{comment.reactionCounts.dislike}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deleting === comment.id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleting === comment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {tCommon('previous')}
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            {tCommon('next')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}