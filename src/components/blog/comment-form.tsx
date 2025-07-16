'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MathCaptcha } from '@/components/blog/math-captcha';
import { MessageCircle, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const commentSchema = z.object({
  authorName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must be no more than 30 characters')
    .regex(/^[a-zA-Z0-9가-힣\s]+$/, 'Name can only contain letters, numbers, and spaces'),
  content: z.string()
    .min(5, 'Comment must be at least 5 characters')
    .max(500, 'Comment must be no more than 500 characters')
    .trim(),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  postId: string;
  onCommentAdded?: (comment: any) => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaSessionId, setCaptchaSessionId] = useState<string | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const content = watch('content', '');

  const handleCaptchaVerify = async (sessionId: string, answer: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/captcha/math', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userAnswer: answer,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setCaptchaSessionId(sessionId);
        setCaptchaAnswer(answer);
        return true;
      } else {
        throw new Error(data.error || 'CAPTCHA verification failed');
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error);
      throw error;
    }
  };

  const handleCaptchaSuccess = () => {
    setShowCaptcha(false);
    toast({
      title: 'Verification successful!',
      description: 'You can now submit your comment.',
    });
  };

  const handleCaptchaError = (error: string) => {
    setSubmitError(error);
  };

  const onSubmit = async (data: CommentFormData) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    // Show CAPTCHA if not verified
    if (!captchaSessionId || !captchaAnswer) {
      setShowCaptcha(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: data.content,
          authorName: data.authorName,
          captchaSessionId,
          captchaAnswer,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        reset();
        setCaptchaSessionId(null);
        setCaptchaAnswer(null);
        onCommentAdded?.(result.comment);
        
        toast({
          title: 'Comment posted!',
          description: 'Your comment has been successfully posted.',
        });
      } else {
        setSubmitError(result.error || 'Failed to post comment');
        
        // Reset CAPTCHA if it's a CAPTCHA-related error
        if (result.error?.includes('CAPTCHA')) {
          setCaptchaSessionId(null);
          setCaptchaAnswer(null);
          setShowCaptcha(true);
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setSubmitError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Leave a Comment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName">Name *</Label>
            <Input
              id="authorName"
              {...register('authorName')}
              placeholder="Your name"
              className={errors.authorName ? 'border-red-500' : ''}
            />
            {errors.authorName && (
              <p className="text-sm text-red-500">{errors.authorName.message}</p>
            )}
          </div>

          {/* Comment Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Comment *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Share your thoughts..."
              rows={4}
              className={errors.content ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{errors.content?.message || ''}</span>
              <span>{content.length}/500</span>
            </div>
          </div>

          {/* CAPTCHA */}
          {showCaptcha && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MathCaptcha
                onVerify={handleCaptchaVerify}
                onSuccess={handleCaptchaSuccess}
                onError={handleCaptchaError}
              />
            </motion.div>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Your comment has been posted successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post Comment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}