'use client';

import { HtmlContent } from '@/components/blog/html-content';
import type { PostWithRelations } from '@/lib/blog';

interface PostContentProps {
  post: PostWithRelations;
}

export function PostContent({ post }: PostContentProps) {
  return (
    <div className="py-8">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <HtmlContent content={post.content} />
      </div>
    </div>
  );
}