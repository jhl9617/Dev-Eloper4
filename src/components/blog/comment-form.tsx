'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
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

const createCommentSchema = (t: any) => z.object({
  authorName: z.string()
    .min(2, t('nameMinLength'))
    .max(30, t('nameMaxLength'))
    .regex(/^[a-zA-Z0-9가-힣\s]+$/, t('nameInvalidChars')),
  content: z.string()
    .min(5, t('contentMinLength'))
    .max(500, t('contentMaxLength'))
    .trim(),
});

type CommentFormData = z.infer<ReturnType<typeof createCommentSchema>>;

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
  const t = useTranslations('comments');
  const tCommon = useTranslations('common');

  const commentSchema = createCommentSchema(t);
  
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
      title: t('verificationSuccess'),
      description: t('canSubmitComment'),
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
          title: t('commentPosted'),
          description: t('commentPostedSuccess'),
        });
      } else {
        setSubmitError(result.error || t('postCommentFailed'));
        
        // Reset CAPTCHA if it's a CAPTCHA-related error
        if (result.error?.includes('CAPTCHA')) {
          setCaptchaSessionId(null);
          setCaptchaAnswer(null);
          setShowCaptcha(true);
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setSubmitError(t('postCommentError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {t('leaveComment')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName">{t('name')} *</Label>
            <Input
              id="authorName"
              {...register('authorName')}
              placeholder={t('namePlaceholder')}
              className={errors.authorName ? 'border-red-500' : ''}
            />
            {errors.authorName && (
              <p className="text-sm text-red-500">{errors.authorName.message}</p>
            )}
          </div>

          {/* Comment Content */}
          <div className="space-y-2">
            <Label htmlFor="content">{t('comment')} *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder={t('commentPlaceholder')}
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
                {t('commentPostedSuccess')}
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
                {t('posting')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t('postComment')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}