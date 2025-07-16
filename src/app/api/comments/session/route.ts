import { NextRequest, NextResponse } from 'next/server';
import { getCommentSessionId } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // 세션 ID 생성 또는 기존 세션 반환
    const sessionId = await getCommentSessionId();
    
    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Error creating comment session:', error);
    return NextResponse.json(
      { error: 'Failed to create comment session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 현재 세션 ID 반환 (생성하지 않음)
    const sessionId = await getCommentSessionId();
    
    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Error getting comment session:', error);
    return NextResponse.json(
      { error: 'Failed to get comment session' },
      { status: 500 }
    );
  }
}