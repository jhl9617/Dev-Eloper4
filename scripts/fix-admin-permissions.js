#!/usr/bin/env node
/**
 * 관리자 권한 복구 스크립트
 * 
 * 이 스크립트는 admin@devblog.com 계정에 관리자 권한을 부여합니다.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// 환경 변수 로드
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다.");
  console.error("NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminPermissions() {
  console.log("🔧 관리자 권한 복구 중...");
  
  const testEmail = "admin@devblog.com";
  
  try {
    // 1. 사용자 정보 조회
    console.log("1. 사용자 정보 조회 중...");
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("❌ 사용자 목록 조회 실패:", userError.message);
      return;
    }
    
    const adminUser = users.users.find(user => user.email === testEmail);
    
    if (!adminUser) {
      console.error("❌ admin@devblog.com 계정을 찾을 수 없습니다.");
      console.log("📝 먼저 scripts/create-admin-demo.js를 실행하세요.");
      return;
    }
    
    console.log("✅ 사용자 찾음:", adminUser.email);
    console.log("   사용자 ID:", adminUser.id);
    
    // 2. 현재 관리자 권한 확인
    console.log("\n2. 현재 관리자 권한 확인 중...");
    const { data: existingAdmin, error: checkError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", adminUser.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116는 "not found" 에러
      console.error("❌ 관리자 권한 확인 실패:", checkError.message);
      return;
    }
    
    if (existingAdmin) {
      console.log("✅ 이미 관리자 권한이 있습니다.");
      
      // 3. 관리자 테이블의 모든 레코드 확인
      console.log("\n3. 관리자 테이블 내용 확인...");
      const { data: allAdmins, error: allAdminsError } = await supabase
        .from("admins")
        .select("*");
      
      if (allAdminsError) {
        console.error("❌ 관리자 테이블 조회 실패:", allAdminsError.message);
      } else {
        console.log("📋 관리자 테이블 내용:");
        allAdmins.forEach(admin => {
          console.log(`   - ${admin.user_id} (${admin.added_at})`);
        });
      }
      
      return;
    }
    
    // 4. 관리자 권한 부여
    console.log("\n4. 관리자 권한 부여 중...");
    const { error: adminError } = await supabase
      .from("admins")
      .insert([{ user_id: adminUser.id }]);
    
    if (adminError) {
      console.error("❌ 관리자 권한 부여 실패:", adminError.message);
      return;
    }
    
    console.log("✅ 관리자 권한 부여 성공!");
    
    // 5. 권한 확인
    console.log("\n5. 권한 부여 확인 중...");
    const { data: newAdmin, error: verifyError } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", adminUser.id)
      .single();
    
    if (verifyError) {
      console.error("❌ 권한 확인 실패:", verifyError.message);
      return;
    }
    
    console.log("✅ 권한 확인 성공:");
    console.log(`   사용자 ID: ${newAdmin.user_id}`);
    console.log(`   등록 일시: ${newAdmin.added_at}`);
    
    console.log("\n🎉 관리자 권한 복구 완료!");
    console.log("=".repeat(50));
    console.log("📧 이메일:", testEmail);
    console.log("🔐 비밀번호: DevBlog123!");
    console.log("🔗 로그인 URL: http://localhost:3001/auth/login");
    console.log("🏠 관리자 대시보드: http://localhost:3001/admin");
    console.log("=".repeat(50));
    
  } catch (error) {
    console.error("❌ 예상치 못한 오류:", error.message);
    console.error("전체 오류 정보:", error);
  }
}

fixAdminPermissions();