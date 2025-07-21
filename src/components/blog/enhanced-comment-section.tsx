'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
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
  Clock,
  Reply,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  replies?: Comment[];
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

interface CommentReactions {
  like: number;
  dislike: number;
}

interface CommentItemProps {
  comment: Comment;
  depth: number;
  isAdmin: boolean;
  userDeletableComments: string[];
  onDelete: (commentId: string) => void;
  onReply: (commentId: string, authorName: string) => void;
  deleting: string | null;
}

function CommentItem({ 
  comment, 
  depth, 
  isAdmin, 
  userDeletableComments, 
  onDelete, 
  onReply,
  deleting 
}: CommentItemProps) {
  const [reactions, setReactions] = useState<CommentReactions>({ like: 0, dislike: 0 });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionLoading, setReactionLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('comments');

  // Fetch reactions for this comment
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/comments/${comment.id}/reactions`);
        if (response.ok) {
          const data = await response.json();
          setReactions(data.reactions);
        }
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };

    fetchReactions();
  }, [comment.id]);

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    setReactionLoading(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state based on action
        if (data.action === 'removed') {
          setUserReaction(null);
          setReactions(prev => ({
            ...prev,
            [reactionType]: Math.max(0, prev[reactionType] - 1)
          }));
        } else if (data.action === 'updated') {
          const oldReaction = userReaction as 'like' | 'dislike';
          setUserReaction(reactionType);
          setReactions(prev => ({
            ...prev,
            [oldReaction]: Math.max(0, prev[oldReaction] - 1),
            [reactionType]: prev[reactionType] + 1
          }));
        } else if (data.action === 'added') {
          setUserReaction(reactionType);
          setReactions(prev => ({
            ...prev,
            [reactionType]: prev[reactionType] + 1
          }));
        }
      } else {
        const errorData = await response.json();
        toast({
          title: t('reactionFailed'),
          description: errorData.error || t('reactionError'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('reactionFailed'),
        description: t('reactionError'),
        variant: 'destructive',
      });
    } finally {
      setReactionLoading(false);
    }
  };

  const maxDepth = 3;
  const indentLevel = Math.min(depth, maxDepth);

  return (
    <div className={cn('space-y-3', depth > 0 && 'ml-6 border-l-2 border-muted pl-4')}>
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                {comment.content}
              </p>
              
              {/* Reaction and Reply buttons */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction('like')}
                    disabled={reactionLoading}
                    className={cn(
                      "h-8 text-xs",
                      userReaction === 'like' && "bg-green-100 text-green-600 hover:bg-green-200"
                    )}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {reactions.like}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction('dislike')}
                    disabled={reactionLoading}
                    className={cn(
                      "h-8 text-xs",
                      userReaction === 'dislike' && "bg-red-100 text-red-600 hover:bg-red-200"
                    )}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    {reactions.dislike}
                  </Button>
                </div>
                
                {depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply(comment.id, comment.author_name)}
                    className="h-8 text-xs"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    {t('reply')}
                  </Button>
                )}
              </div>
            </div>
            
            {(isAdmin || userDeletableComments.includes(comment.id)) && (
              <div className="flex items-center gap-2">
                {!isAdmin && userDeletableComments.includes(comment.id) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{t('canDeleteComment')}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment.id)}
                  disabled={deleting === comment.id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title={isAdmin ? t('deleteCommentAdmin') : t('deleteYourComment')}
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
      
      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <AnimatePresence>
          {comment.replies.map((reply) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CommentItem
                comment={reply}
                depth={depth + 1}
                isAdmin={isAdmin}
                userDeletableComments={userDeletableComments}
                onDelete={onDelete}
                onReply={onReply}
                deleting={deleting}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

export function EnhancedCommentSection({ postId }: CommentSectionProps) {
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
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null);
  
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('comments');
  const tCommon = useTranslations('common');

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
        setError(t('loadCommentsFailed'));
      }
    } catch (err) {
      setError(t('loadCommentsFailed'));
    } finally {
      setLoading(false);
    }
  }, [postId, pagination.limit, t]);

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t('confirmDeleteComment'))) {
      return;
    }

    setDeleting(commentId);
    
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove comment from state (works for both parent and nested comments)
        const removeComment = (comments: Comment[]): Comment[] => {
          return comments.filter(comment => {
            if (comment.id === commentId) {
              return false;
            }
            if (comment.replies) {
              comment.replies = removeComment(comment.replies);
            }
            return true;
          });
        };
        
        setComments(removeComment(comments));
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1,
        }));
        
        toast({
          title: t('commentDeleted'),
          description: t('commentDeletedSuccess'),
        });
      } else {
        const data = await response.json();
        toast({
          title: t('deleteFailed'),
          description: data.error || t('deleteCommentFailed'),
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: t('deleteFailed'),
        description: t('deleteCommentFailed'),
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    if (replyingTo) {
      // Add reply to the parent comment
      const addReply = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === replyingTo.id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: addReply(comment.replies)
            };
          }
          return comment;
        });
      };
      
      setComments(addReply(comments));
      setReplyingTo(null);
    } else {
      // Add new parent comment
      setComments(prev => [newComment, ...prev]);
    }
    
    setUserDeletableComments(prev => [...prev, newComment.id]);
    setPagination(prev => ({
      ...prev,
      total: prev.total + 1,
    }));
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, author: authorName });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchComments(newPage);
    }
  };

  useEffect(() => {
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
          {t('comments')} ({pagination.total})
          {sessionInitialized && (
            <span className="text-xs text-green-600 dark:text-green-400 ml-2">
              {t('sessionReady')}
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
          {tCommon('refresh')}
        </Button>
      </div>

      {/* Comment Form */}
      <CommentForm 
        postId={postId} 
        parentId={replyingTo?.id}
        parentAuthor={replyingTo?.author}
        onCommentAdded={handleCommentAdded}
        onCancel={replyingTo ? handleCancelReply : undefined}
      />

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
            <p className="text-muted-foreground">{t('noComments')}</p>
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
                  <CommentItem
                    comment={comment}
                    depth={0}
                    isAdmin={isAdmin}
                    userDeletableComments={userDeletableComments}
                    onDelete={handleDeleteComment}
                    onReply={handleReply}
                    deleting={deleting}
                  />
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
            disabled={pagination.page === pagination.totalPages}
          >
            {tCommon('next')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}