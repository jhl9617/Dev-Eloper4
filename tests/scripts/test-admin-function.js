#!/usr/bin/env node
/**
 * is_admin 함수 테스트 스크립트
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// 환경 변수 로드
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminFunction() {
  console.log("🧪 is_admin 함수 테스트...");
  
  try {
    // 1. 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@devblog.com',
      password: 'DevBlog123!'
    });
    
    if (authError) {
      console.error("❌ 로그인 실패:", authError.message);
      return;
    }
    
    console.log("✅ 로그인 성공");
    console.log("사용자 ID:", authData.user.id);
    
    // 2. is_admin 함수 호출
    const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin');
    
    if (isAdminError) {
      console.error("❌ is_admin 함수 호출 실패:", isAdminError.message);
      return;
    }
    
    console.log("✅ is_admin 함수 호출 성공");
    console.log("관리자 여부:", isAdminData);
    
    // 3. 직접 admins 테이블 조회 시도
    console.log("\n📋 admins 테이블 직접 조회 시도...");
    const { data: adminsData, error: adminsError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', authData.user.id);
    
    if (adminsError) {
      console.error("❌ admins 테이블 조회 실패:", adminsError.message);
      console.log("이는 예상된 결과입니다. RLS 정책 때문입니다.");
    } else {
      console.log("✅ admins 테이블 조회 성공:", adminsData);
    }
    
    // 4. 로그아웃
    await supabase.auth.signOut();
    console.log("✅ 로그아웃 완료");
    
  } catch (error) {
    console.error("❌ 테스트 중 오류:", error.message);
  }
}

testAdminFunction();