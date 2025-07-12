import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'ko') {
    return format(dateObj, 'yyyy년 MM월 dd일', { locale: ko });
  }
  
  return format(dateObj, 'MMMM dd, yyyy');
}

export function formatRelativeTime(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'ko') {
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko });
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatDateTime(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'ko') {
    return format(dateObj, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  }
  
  return format(dateObj, 'MMMM dd, yyyy at HH:mm');
}