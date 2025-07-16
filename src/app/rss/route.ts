import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(name, slug),
      tags:post_tags(tag:tags(name, slug))
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dev-eloper</title>
    <description>Dev-eloper - A modern blog platform built with Next.js and Supabase</description>
    <link>${baseUrl}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
    ${posts?.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.content.replace(/[#*`]/g, '').slice(0, 300)}...]]></description>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid>${baseUrl}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
      ${post.category ? `<category>${post.category.name}</category>` : ''}
      ${post.cover_image_path ? `<enclosure url="${post.cover_image_path}" type="image/jpeg" />` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}