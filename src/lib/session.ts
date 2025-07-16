'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const SESSION_COOKIE_NAME = 'comment_session';
const DELETION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Get or create a session ID for comment management
 */
export async function getCommentSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return sessionId;
}

/**
 * Grant deletion rights for a comment to the current session
 */
export async function grantCommentDeletionRights(commentId: string): Promise<void> {
  const sessionId = await getCommentSessionId();
  const supabase = await createClient();
  
  const expiresAt = new Date(Date.now() + DELETION_TIMEOUT);
  
  await supabase
    .from('session_comments')
    .insert({
      session_id: sessionId,
      comment_id: commentId,
      expires_at: expiresAt.toISOString(),
    });
}

/**
 * Check if the current session can delete a specific comment
 */
export async function canDeleteComment(commentId: string): Promise<boolean> {
  const sessionId = await getCommentSessionId();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('session_comments')
    .select('expires_at')
    .eq('session_id', sessionId)
    .eq('comment_id', commentId)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  // Check if the deletion right has expired
  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  
  return now < expiresAt;
}

/**
 * Get all comments that the current session can delete
 */
export async function getUserDeletableComments(postId: string): Promise<string[]> {
  const sessionId = await getCommentSessionId();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('session_comments')
    .select(`
      comment_id,
      expires_at,
      comments!inner(post_id)
    `)
    .eq('session_id', sessionId)
    .eq('comments.post_id', postId)
    .gt('expires_at', new Date().toISOString());
  
  if (error || !data) {
    return [];
  }
  
  return data.map(item => item.comment_id);
}

/**
 * Clean up expired session comment rights
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from('session_comments')
    .delete()
    .lt('expires_at', new Date().toISOString());
}

/**
 * Revoke deletion rights for a comment (used after deletion)
 */
export async function revokeCommentDeletionRights(commentId: string): Promise<void> {
  const sessionId = await getCommentSessionId();
  const supabase = await createClient();
  
  await supabase
    .from('session_comments')
    .delete()
    .eq('session_id', sessionId)
    .eq('comment_id', commentId);
}