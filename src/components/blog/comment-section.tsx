'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CommentForm } from '@/components/blog/comment-form';
import { 
  MessageCircle, 
  Calendar, 
  User, 
  Trash2, 
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

interface CommentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CommentSectionProps {
  postId: string;
}

interface CommentsResponse {
  comments: Comment[];
  userDeletableComments: string[];
  pagination: CommentsPagination;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userDeletableComments, setUserDeletableComments] = useState<string[]>([]);
  const [pagination, setPagination] = useState<CommentsPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  // Initialize comment session on component mount
  const initializeCommentSession = useCallback(async () => {
    try {
      const response = await fetch('/api/comments/session', {
        method: 'POST',
      });
      
      if (response.ok) {
        setSessionInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize comment session:', error);
      // This is not a fatal error, user can still view comments
    }
  }, []);

  const fetchComments = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments?postId=${postId}&page=${page}&limit=${pagination.limit}`);
      const data: CommentsResponse = await response.json();
      
      if (response.ok) {
        setComments(data.comments);
        setUserDeletableComments(data.userDeletableComments);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to load comments');
      }
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postId, pagination.limit]);

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeleting(commentId);
    
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId));
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1,
        }));
        
        toast({
          title: 'Comment deleted',
          description: 'The comment has been successfully deleted.',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Delete failed',
          description: data.error || 'Failed to delete comment',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
    setUserDeletableComments(prev => [...prev, newComment.id]);
    setPagination(prev => ({
      ...prev,
      total: prev.total + 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchComments(newPage);
    }
  };

  useEffect(() => {
    // Initialize session and fetch comments in parallel
    initializeCommentSession();
    fetchComments();
  }, [postId, initializeCommentSession, fetchComments]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Comments ({pagination.total})
          {sessionInitialized && (
            <span className="text-xs text-green-600 dark:text-green-400 ml-2">
              Session ready
            </span>
          )}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchComments(pagination.page)}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Comment Form */}
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />

      <Separator />

      {/* Comments List */}
      <div className="space-y-6">
        {loading && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                >
                  <Card className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{comment.author_name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                        
                        {(isAdmin || userDeletableComments.includes(comment.id)) && (
                          <div className="flex items-center gap-2">
                            {!isAdmin && userDeletableComments.includes(comment.id) && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>You can delete this comment (30 min limit)</span>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deleting === comment.id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title={isAdmin ? "Delete comment (admin)" : "Delete your comment"}
                            >
                              {deleting === comment.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
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
            disabled={pagination.page === pagination.totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}