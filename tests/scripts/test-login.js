#!/usr/bin/env node
/**
 * 로그인 테스트 스크립트
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

async function testLogin() {
  console.log("🧪 로그인 테스트 시작...");
  
  try {
    // 1. 로그인 시도
    console.log("\n1. 로그인 시도...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@devblog.com',
      password: 'DevBlog123!'
    });
    
    if (authError) {
      console.error("❌ 로그인 실패:", authError.message);
      console.error("상세 오류:", authError);
      return;
    }
    
    console.log("✅ 로그인 성공!");
    console.log("사용자 ID:", authData.user.id);
    console.log("이메일:", authData.user.email);
    
    // 2. 관리자 권한 확인
    console.log("\n2. 관리자 권한 확인...");
    
    // 먼저 RPC 함수 시도
    try {
      const { data: isAdminRPC, error: rpcError } = await supabase.rpc('is_admin');
      if (rpcError) {
        console.log("⚠️ RPC 함수 오류:", rpcError.message);
        console.log("직접 테이블 조회로 전환...");
        
        // 직접 테이블 조회
        const { data: directAdmin, error: directError } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', authData.user.id)
          .single();
        
        if (directError) {
          console.error("❌ 관리자 테이블 조회 실패:", directError.message);
        } else {
          console.log("✅ 관리자 권한 확인 (직접 조회):", !!directAdmin);
        }
      } else {
        console.log("✅ 관리자 권한 확인 (RPC):", !!isAdminRPC);
      }
    } catch (error) {
      console.error("❌ 관리자 권한 확인 실패:", error.message);
    }
    
    // 3. 로그아웃
    console.log("\n3. 로그아웃...");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("❌ 로그아웃 실패:", signOutError.message);
    } else {
      console.log("✅ 로그아웃 성공");
    }
    
  } catch (error) {
    console.error("❌ 테스트 중 오류:", error.message);
    console.error("전체 오류:", error);
  }
}

testLogin();