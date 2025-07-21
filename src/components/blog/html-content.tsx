'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export function HtmlContent({ content, className = '' }: HtmlContentProps) {
  const [sanitizedContent, setSanitizedContent] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && content) {
      // Configure DOMPurify to allow safe HTML elements and attributes
      const cleanContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'u', 's', 'del', 'mark',
          'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
          'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span', 'hr'
        ],
        ALLOWED_ATTR: [
          'href', 'target', 'rel', 'title', 'alt', 'src', 'width', 'height',
          'class', 'colspan', 'rowspan', 'align'
        ],
        ALLOW_DATA_ATTR: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM: false
      });
      
      setSanitizedContent(cleanContent);
    }
  }, [content, isMounted]);

  // Don't render anything on the server to avoid hydration mismatches
  if (!isMounted) {
    return null;
  }

  return (
    <div 
      className={`html-content prose prose-lg max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

interface HtmlPreviewProps {
  content: string;
  maxLength?: number;
  className?: string;
}

export function HtmlPreview({ content, maxLength = 150, className = '' }: HtmlPreviewProps) {
  const [preview, setPreview] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && content) {
      // Strip HTML tags and get text content for preview
      const textContent = content.replace(/<[^>]*>/g, '');
      const trimmedContent = textContent.length > maxLength 
        ? textContent.slice(0, maxLength) + '...'
        : textContent;
      
      setPreview(trimmedContent);
    }
  }, [content, maxLength, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <p className={`text-muted-foreground ${className}`}>
      {preview}
    </p>
  );
}