/**
 * 입력 검증 및 새니타이제이션 유틸리티
 * XSS, SQL 인젝션, 기타 보안 위협으로부터 보호
 */

// HTML 엔티티 인코딩을 위한 매핑
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * HTML 특수 문자를 엔티티로 인코딩
 */
export function escapeHtml(unsafe: string): string {
  return unsafe.replace(/[&<>"'`=\/]/g, (s) => HTML_ENTITIES[s]);
}

/**
 * 기본 XSS 방지를 위한 HTML 태그 제거
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * 허용된 HTML 태그만 유지 (화이트리스트 방식)
 */
export function sanitizeHtml(html: string, allowedTags: string[] = []): string {
  if (allowedTags.length === 0) {
    return stripHtml(html);
  }

  const allowedTagsRegex = new RegExp(`<(?!\/?(?:${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
  return html.replace(allowedTagsRegex, '');
}

/**
 * SQL 인젝션 방지를 위한 특수 문자 이스케이프
 */
export function escapeSql(input: string): string {
  return input.replace(/['";\\]/g, '\\$&');
}

/**
 * 이메일 형식 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URL 형식 검증
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 파일 확장자 검증
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * 파일 크기 검증 (바이트 단위)
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * 비밀번호 강도 검증
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('최소 8자 이상이어야 합니다.');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('대문자를 포함해야 합니다.');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('소문자를 포함해야 합니다.');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('숫자를 포함해야 합니다.');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('특수문자를 포함해야 합니다.');
  }

  // 일반적인 약한 패턴 검사
  const weakPatterns = [
    /^(password|123456|qwerty|abc123)/i,
    /^(.)\1{7,}$/, // 같은 문자 반복
    /^(012345|123456|234567|345678|456789)/,
  ];

  if (weakPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('더 복잡한 패턴을 사용해주세요.');
  }

  return {
    isStrong: score >= 4,
    score,
    feedback
  };
}

/**
 * 사용자 이름 검증 (영문, 숫자, 하이픈, 언더스코어만 허용)
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * 슬러그 검증 (URL 친화적인 문자열)
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
}

/**
 * 휴대폰 번호 검증 (한국 형식)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * 정수 검증
 */
export function validateInteger(value: string, min?: number, max?: number): boolean {
  const num = parseInt(value, 10);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * 실수 검증
 */
export function validateFloat(value: string, min?: number, max?: number): boolean {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

/**
 * 문자열 길이 검증
 */
export function validateLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * 특정 값들만 허용하는 검증 (화이트리스트)
 */
export function validateWhitelist(value: string, allowedValues: string[]): boolean {
  return allowedValues.includes(value);
}

/**
 * 정규표현식 패턴 검증
 */
export function validatePattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * 종합적인 입력 검증 함수
 */
export function validateInput(
  value: string,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    whitelist?: string[];
    email?: boolean;
    url?: boolean;
    integer?: boolean;
    float?: boolean;
    username?: boolean;
    slug?: boolean;
    phone?: boolean;
    sanitize?: boolean;
    escapeHtml?: boolean;
  }
): {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitizedValue = value;

  // 필수 값 검증
  if (rules.required && !value) {
    errors.push('필수 입력 항목입니다.');
    return { isValid: false, sanitizedValue, errors };
  }

  // 값이 없으면 검증 통과
  if (!value) {
    return { isValid: true, sanitizedValue, errors };
  }

  // 길이 검증
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`최소 ${rules.minLength}자 이상이어야 합니다.`);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`최대 ${rules.maxLength}자까지 입력 가능합니다.`);
  }

  // 패턴 검증
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push('올바른 형식이 아닙니다.');
  }

  // 화이트리스트 검증
  if (rules.whitelist && !rules.whitelist.includes(value)) {
    errors.push('허용되지 않는 값입니다.');
  }

  // 이메일 검증
  if (rules.email && !validateEmail(value)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  }

  // URL 검증
  if (rules.url && !validateUrl(value)) {
    errors.push('올바른 URL 형식이 아닙니다.');
  }

  // 정수 검증
  if (rules.integer && !validateInteger(value)) {
    errors.push('올바른 정수가 아닙니다.');
  }

  // 실수 검증
  if (rules.float && !validateFloat(value)) {
    errors.push('올바른 숫자가 아닙니다.');
  }

  // 사용자명 검증
  if (rules.username && !validateUsername(value)) {
    errors.push('사용자명은 영문, 숫자, 하이픈, 언더스코어만 사용 가능합니다.');
  }

  // 슬러그 검증
  if (rules.slug && !validateSlug(value)) {
    errors.push('슬러그는 소문자, 숫자, 하이픈만 사용 가능합니다.');
  }

  // 휴대폰 번호 검증
  if (rules.phone && !validatePhoneNumber(value)) {
    errors.push('올바른 휴대폰 번호 형식이 아닙니다. (010-0000-0000)');
  }

  // 새니타이제이션
  if (rules.sanitize) {
    sanitizedValue = stripHtml(sanitizedValue);
  }

  if (rules.escapeHtml) {
    sanitizedValue = escapeHtml(sanitizedValue);
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors
  };
}

/**
 * 객체의 모든 속성에 대해 검증 수행
 */
export function validateObject<T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, Parameters<typeof validateInput>[1]>
): {
  isValid: boolean;
  sanitizedData: T;
  errors: Record<keyof T, string[]>;
} {
  const errors: Record<keyof T, string[]> = {} as any;
  const sanitizedData: T = {} as any;
  let isValid = true;

  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];
    const result = validateInput(String(value || ''), rules);
    
    if (!result.isValid) {
      errors[key as keyof T] = result.errors;
      isValid = false;
    }
    
    sanitizedData[key as keyof T] = result.sanitizedValue as any;
  }

  return { isValid, sanitizedData, errors };
}