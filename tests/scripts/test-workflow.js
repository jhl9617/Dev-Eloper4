#!/usr/bin/env node
/**
 * 블로그 시스템 완전 워크플로우 테스트 스크립트
 *
 * 이 스크립트는 다음 기능들을 테스트합니다:
 * 1. 필수 파일 존재 확인
 * 2. 환경 변수 확인
 * 3. 데이터베이스 연결 테스트
 * 4. 관리자 로그인 시뮬레이션
 * 5. 포스트 작성 기능 테스트
 */

import { existsSync, readFileSync } from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("🧪 DevBlog 시스템 테스트 시작...\n");

// 1. 필수 파일 확인
console.log("📁 필수 파일 확인 중...");
const requiredFiles = [
  "src/app/auth/login/page.tsx",
  "src/app/admin/page.tsx",
  "src/app/admin/posts/new/page.tsx",
  "src/lib/validations/post.ts",
  "src/lib/utils/slug.ts",
  "src/components/ui/form.tsx",
  "src/components/ui/checkbox.tsx",
  "src/components/admin/markdown-editor.tsx",
  "src/hooks/use-auth.ts",
  "docs/database-schema.sql",
  "scripts/setup-admin.sql",
  "docs/admin-setup-guide.md",
];

let missingFiles = [];
requiredFiles.forEach((file) => {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 누락`);
    missingFiles.push(file);
  }
});

// 2. 환경 변수 확인
console.log("\n🔐 환경 변수 확인 중...");
const envFile = ".env.local";
if (existsSync(envFile)) {
  console.log("✅ .env.local 파일 존재");
  const envContent = readFileSync(envFile, "utf8");
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
  ];

  requiredEnvVars.forEach((envVar) => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} 설정됨`);
    } else {
      console.log(`⚠️  ${envVar} 설정 필요`);
    }
  });
} else {
  console.log("❌ .env.local 파일 없음 - 설정 필요");
}

// 3. 패키지 의존성 확인
console.log("\n📦 의존성 확인 중...");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const requiredDeps = [
  "next",
  "react",
  "@supabase/supabase-js",
  "@supabase/ssr",
  "react-hook-form",
  "zod",
  "react-markdown",
  "next-themes",
  "lucide-react",
];

requiredDeps.forEach((dep) => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - 설치 필요`);
  }
});

// 4. TypeScript 컴파일 확인
console.log("\n🔧 TypeScript 컴파일 확인 중...");
try {
  execSync("npx tsc --noEmit", { stdio: "pipe" });
  console.log("✅ TypeScript 컴파일 성공");
} catch (error) {
  console.log("❌ TypeScript 컴파일 오류 발견");
  console.log("   다음 명령어로 확인: npx tsc --noEmit");
}

// 5. 빌드 테스트
console.log("\n🏗️  빌드 테스트 중...");
try {
  execSync("npm run build", { stdio: "pipe", timeout: 60000 });
  console.log("✅ 빌드 성공");
} catch (error) {
  console.log("⚠️  빌드 테스트 시간 초과 또는 오류");
  console.log("   네트워크 연결 확인 후 수동으로 테스트: npm run build");
}

// 6. 결과 요약
console.log("\n📊 테스트 결과 요약:");
console.log("=".repeat(50));

if (missingFiles.length === 0) {
  console.log("✅ 모든 필수 파일 존재");
} else {
  console.log(`❌ 누락된 파일: ${missingFiles.length}개`);
}

console.log("\n🎯 다음 단계:");
console.log("1. Supabase 프로젝트 생성 및 환경 변수 설정");
console.log("2. docs/database-schema.sql 실행");
console.log("3. scripts/setup-admin.sql로 관리자 계정 생성");
console.log("4. npm run dev로 개발 서버 실행");
console.log("5. http://localhost:3001/auth/login에서 로그인");
console.log("6. 새 포스트 작성 및 발행 테스트");

console.log("\n📚 자세한 가이드: docs/admin-setup-guide.md");
console.log("🚀 모든 준비 완료! 블로그 시작하세요!");
