'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Calculator } from 'lucide-react';

interface MathCaptchaProps {
  onVerify: (sessionId: string, answer: string) => Promise<boolean>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface CaptchaData {
  sessionId: string;
  question: string;
}

export function MathCaptcha({ onVerify, onSuccess, onError }: MathCaptchaProps) {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchNewCaptcha = async () => {
    setLoading(true);
    setError(null);
    setUserAnswer('');
    
    try {
      const response = await fetch('/api/captcha/math');
      const data = await response.json();
      
      if (response.ok) {
        setCaptchaData(data);
      } else {
        setError(data.error || 'Failed to load CAPTCHA');
      }
    } catch (err) {
      setError('Failed to load CAPTCHA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewCaptcha();
  }, []);

  const handleVerify = async () => {
    if (!captchaData || !userAnswer.trim()) {
      setError('Please enter an answer');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const isCorrect = await onVerify(captchaData.sessionId, userAnswer);
      
      if (isCorrect) {
        onSuccess?.();
      } else {
        setError('Incorrect answer. Please try again.');
        fetchNewCaptcha();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <motion.div
      className="space-y-4 p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
        <Calculator className="w-4 h-4" />
        Anti-Spam Verification
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <Label className="text-lg font-mono">
              {captchaData?.question || 'Loading...'}
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your answer"
              className="text-center font-mono text-lg"
              disabled={verifying}
            />
            <Button
              onClick={fetchNewCaptcha}
              variant="outline"
              size="icon"
              disabled={loading || verifying}
              title="Get new question"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {error && (
            <motion.div
              className="text-sm text-red-600 dark:text-red-400 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
          
          <Button
            onClick={handleVerify}
            disabled={!userAnswer.trim() || verifying}
            className="w-full"
            size="sm"
          >
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
}