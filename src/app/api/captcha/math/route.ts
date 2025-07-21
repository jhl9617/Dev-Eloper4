import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

interface MathProblem {
  question: string;
  answer: number;
}

function generateMathProblem(): MathProblem {
  const operations = ['+', '-', '×'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1: number, num2: number, answer: number, question: string;
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 10) + 1; // 1-10
      num2 = Math.floor(Math.random() * 10) + 1; // 1-10
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 10) + 5; // 5-14
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // 1 to (num1-1)
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
      break;
    case '×':
      num1 = Math.floor(Math.random() * 5) + 2; // 2-6
      num2 = Math.floor(Math.random() * 5) + 2; // 2-6
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
      break;
    default:
      num1 = 3;
      num2 = 4;
      answer = 7;
      question = `${num1} + ${num2} = ?`;
  }
  
  return { question, answer };
}

export async function GET(request: NextRequest) {
  try {
    const problem = generateMathProblem();
    
    // Create session ID
    const sessionId = crypto.randomUUID();
    
    // Get CAPTCHA secret from environment variable
    const captchaSecret = process.env.CAPTCHA_SECRET;
    
    if (!captchaSecret) {
      throw new Error(
        'CAPTCHA_SECRET environment variable is required for security. ' +
        'Please set a strong random string in your .env.local file.'
      );
    }
    
    // Hash the answer for secure storage
    const answerHash = createHmac('sha256', captchaSecret)
      .update(String(problem.answer))
      .digest('hex');
    
    // Store hashed answer in cookie
    const cookieStore = await cookies();
    cookieStore.set(`captcha_${sessionId}`, JSON.stringify({
      answerHash,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
    });
    
    return NextResponse.json({
      sessionId,
      question: problem.question,
    });
  } catch (error) {
    console.error('Error generating math CAPTCHA:', error);
    return NextResponse.json(
      { error: 'Failed to generate CAPTCHA' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userAnswer } = await request.json();
    
    if (!sessionId || userAnswer === undefined) {
      return NextResponse.json(
        { error: 'Session ID and answer are required' },
        { status: 400 }
      );
    }
    
    // Get stored answer from cookie
    const cookieStore = await cookies();
    const storedData = cookieStore.get(`captcha_${sessionId}`);
    
    if (!storedData) {
      return NextResponse.json(
        { error: 'CAPTCHA session not found or expired' },
        { status: 400 }
      );
    }
    
    const { answerHash, expires } = JSON.parse(storedData.value);
    
    // Check if session expired
    if (Date.now() > expires) {
      // Clean up expired cookie
      cookieStore.delete(`captcha_${sessionId}`);
      return NextResponse.json(
        { error: 'CAPTCHA session expired' },
        { status: 400 }
      );
    }
    
    // Get CAPTCHA secret from environment variable
    const captchaSecret = process.env.CAPTCHA_SECRET;
    
    if (!captchaSecret) {
      throw new Error(
        'CAPTCHA_SECRET environment variable is required for security. ' +
        'Please set a strong random string in your .env.local file.'
      );
    }
    
    // Hash the user's answer and compare with stored hash
    const userAnswerHash = createHmac('sha256', captchaSecret)
      .update(String(parseInt(userAnswer)))
      .digest('hex');
    
    const isCorrect = userAnswerHash === answerHash;
    
    if (isCorrect) {
      // Mark as verified but keep cookie for comment submission
      cookieStore.set(`captcha_${sessionId}`, JSON.stringify({
        answerHash: answerHash,
        expires: expires,
        verified: true, // Mark as verified
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60, // 10 minutes
      });
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Incorrect answer' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error);
    return NextResponse.json(
      { error: 'Failed to verify CAPTCHA' },
      { status: 500 }
    );
  }
}