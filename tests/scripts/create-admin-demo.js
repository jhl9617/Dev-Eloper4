#!/usr/bin/env node
/**
 * 데모 관리자 계정 생성 스크립트
 *
 * 이 스크립트는 테스트용 관리자 계정을 생성합니다.
 * 실제 운영 환경에서는 사용하지 마세요.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다.");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminAccount() {
  console.log("🔑 데모 관리자 계정 생성 중...");

  // Get admin credentials from environment variables
  const testEmail = process.env.ADMIN_EMAIL;
  const testPassword = process.env.ADMIN_INITIAL_PASSWORD;
  
  if (!testEmail || !testPassword) {
    console.error("❌ 필수 환경 변수가 설정되지 않았습니다:");
    console.error("- ADMIN_EMAIL: 관리자 이메일 주소");
    console.error("- ADMIN_INITIAL_PASSWORD: 관리자 초기 비밀번호");
    console.error("보안을 위해 .env.local 파일에 이 변수들을 설정하세요.");
    process.exit(1);
  }

  try {
    // 1. 사용자 생성
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
      });

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log(
          "ℹ️  이미 존재하는 사용자입니다. 관리자 권한 부여를 시도합니다."
        );

        // 기존 사용자 찾기
        const { data: existingUser, error: findError } = await supabase
          .from("auth.users")
          .select("id")
          .eq("email", testEmail)
          .single();

        if (findError) {
          console.error(
            "❌ 기존 사용자를 찾을 수 없습니다:",
            findError.message
          );
          return;
        }

        // 관리자 권한 부여
        const { error: adminError } = await supabase
          .from("admins")
          .insert([{ user_id: existingUser.id }]);

        if (adminError && !adminError.message.includes("duplicate")) {
          console.error("❌ 관리자 권한 부여 실패:", adminError.message);
          return;
        }

        console.log("✅ 기존 사용자에게 관리자 권한이 부여되었습니다.");
      } else {
        console.error("❌ 사용자 생성 실패:", authError.message);
        return;
      }
    } else {
      console.log("✅ 사용자 생성 성공");

      // 2. 관리자 권한 부여
      const { error: adminError } = await supabase
        .from("admins")
        .insert([{ user_id: authData.user.id }]);

      if (adminError) {
        console.error("❌ 관리자 권한 부여 실패:", adminError.message);
        return;
      }

      console.log("✅ 관리자 권한 부여 성공");
    }

    // 3. 샘플 데이터 생성
    console.log("📝 샘플 데이터 생성 중...");

    // 카테고리 생성
    const categories = [
      {
        name: "Programming",
        slug: "programming",
        description: "Programming tutorials and tips",
      },
      {
        name: "Web Development",
        slug: "web-development",
        description: "Frontend and backend development",
      },
      {
        name: "DevOps",
        slug: "devops",
        description: "DevOps and infrastructure",
      },
      {
        name: "Tutorial",
        slug: "tutorial",
        description: "Step-by-step tutorials",
      },
    ];

    const { error: categoryError } = await supabase
      .from("categories")
      .upsert(categories, { onConflict: "slug" });

    if (categoryError) {
      console.error("⚠️  카테고리 생성 실패:", categoryError.message);
    } else {
      console.log("✅ 카테고리 생성 성공");
    }

    // 태그 생성
    const tags = [
      { name: "JavaScript", slug: "javascript" },
      { name: "TypeScript", slug: "typescript" },
      { name: "React", slug: "react" },
      { name: "Next.js", slug: "nextjs" },
      { name: "Node.js", slug: "nodejs" },
      { name: "Python", slug: "python" },
    ];

    const { error: tagError } = await supabase
      .from("tags")
      .upsert(tags, { onConflict: "slug" });

    if (tagError) {
      console.error("⚠️  태그 생성 실패:", tagError.message);
    } else {
      console.log("✅ 태그 생성 성공");
    }

    console.log("\n🎉 데모 계정 설정 완료!");
    console.log("=".repeat(50));
    console.log("📧 이메일:", testEmail);
    console.log("🔐 비밀번호: [환경 변수에서 설정됨]");
    console.log("🔗 로그인 URL: http://localhost:3001/auth/login");
    console.log("🏠 관리자 대시보드: http://localhost:3001/admin");
    console.log("=".repeat(50));
    console.log("\n💡 다음 단계:");
    console.log("1. npm run dev로 개발 서버 실행");
    console.log("2. 위 계정으로 로그인");
    console.log("3. 새 포스트 작성 및 발행");
  } catch (error) {
    console.error("❌ 예상치 못한 오류:", error.message);
  }
}

createAdminAccount();
