'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: '최소 8자 이상',
    test: (password) => password.length >= 8
  },
  {
    label: '대문자 포함',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: '소문자 포함',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: '숫자 포함',
    test: (password) => /[0-9]/.test(password)
  },
  {
    label: '특수문자 포함',
    test: (password) => /[^A-Za-z0-9]/.test(password)
  }
];

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const analysis = useMemo(() => {
    const results = PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      passed: req.test(password)
    }));
    
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const percentage = (passedCount / totalCount) * 100;
    
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    let strengthText = '약함';
    let strengthColor = 'bg-red-500';
    
    if (percentage >= 80) {
      strength = 'strong';
      strengthText = '강함';
      strengthColor = 'bg-green-500';
    } else if (percentage >= 60) {
      strength = 'good';
      strengthText = '보통';
      strengthColor = 'bg-yellow-500';
    } else if (percentage >= 40) {
      strength = 'fair';
      strengthText = '약간 약함';
      strengthColor = 'bg-orange-500';
    }
    
    return {
      requirements: results,
      percentage,
      strength,
      strengthText,
      strengthColor,
      isValid: passedCount >= 4 // 최소 4개 조건 만족
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* 비밀번호 강도 표시 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">비밀번호 강도</span>
          <span className={cn(
            'font-medium',
            analysis.strength === 'strong' && 'text-green-600',
            analysis.strength === 'good' && 'text-yellow-600',
            analysis.strength === 'fair' && 'text-orange-600',
            analysis.strength === 'weak' && 'text-red-600'
          )}>
            {analysis.strengthText}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={cn('h-2 rounded-full transition-all duration-300', analysis.strengthColor)}
            style={{ width: `${analysis.percentage}%` }}
          />
        </div>
      </div>

      {/* 비밀번호 요구사항 */}
      <div className="space-y-2">
        <span className="text-sm font-medium">비밀번호 요구사항</span>
        <div className="space-y-1">
          {analysis.requirements.map((req, index) => (
            <div 
              key={index}
              className={cn(
                'flex items-center gap-2 text-sm transition-colors',
                req.passed ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {req.passed ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 추가 보안 팁 */}
      {analysis.isValid && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
          ✓ 안전한 비밀번호입니다. 정기적으로 변경하는 것을 권장합니다.
        </div>
      )}
    </div>
  );
}

// 비밀번호 검증 함수
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 포함해야 합니다.');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 포함해야 합니다.');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 포함해야 합니다.');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('특수문자를 포함해야 합니다.');
  }
  
  // 일반적인 약한 비밀번호 패턴 검사
  const weakPatterns = [
    /^(password|123456|qwerty|abc123)/i,
    /^(.)\1{7,}$/, // 같은 문자 반복
    /^(012345|123456|234567|345678|456789|567890|678901|789012|890123|901234)/, // 연속 숫자
  ];
  
  if (weakPatterns.some(pattern => pattern.test(password))) {
    errors.push('더 복잡한 비밀번호를 사용해주세요.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}