import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { getClientIpAddress } from '@/lib/ip-hash';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();

    // Get IP address and user agent
    const headersList = await headers();
    const ip = getClientIpAddress(headersList);
    const userAgent = headersList.get('user-agent') || '';

    // Get session ID from request (if provided)
    const { sessionId } = await request.json().catch(() => ({}));

    // Insert view record (will be ignored if already exists for today)
    const { error } = await supabase
      .from('post_views')
      .insert({
        post_id: postId,
        ip_address: ip,  // Use original IP address instead of hash
        user_agent: userAgent,
        session_id: sessionId,
      });

    if (error) {
      // If it's a duplicate key error, it's fine (one view per IP per day)
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'View already recorded today' });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: 'View recorded' });
  } catch (error) {
    console.error('Error recording view:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record view' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();

    // Get view count for the post
    const { count, error } = await supabase
      .from('post_views')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ viewCount: count || 0 });
  } catch (error) {
    console.error('Error fetching view count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch view count' },
      { status: 500 }
    );
  }
}