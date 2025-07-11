-- DevBlog 관리자 계정 및 초기 데이터 설정 스크립트
-- 사용법: Supabase SQL Editor에서 실행

-- 1. 관리자 계정 생성 (테스트용)
-- 주의: 실제 운영 환경에서는 강력한 비밀번호를 사용하세요
-- 이 스크립트는 Supabase Auth를 통해 사용자를 생성한 후 실행해야 합니다

-- 2. 관리자 권한 부여
-- 실제 사용자 ID로 교체하세요 (Supabase Dashboard의 Authentication 섹션에서 확인)
-- 예시: INSERT INTO admins (user_id) VALUES ('your-actual-user-id-here');

-- 3. 샘플 카테고리 생성
INSERT INTO categories (name, slug, description) VALUES
('Programming', 'programming', 'Articles about programming and software development'),
('Web Development', 'web-development', 'Frontend and backend web development tutorials'),
('DevOps', 'devops', 'DevOps, CI/CD, and infrastructure topics'),
('Tutorial', 'tutorial', 'Step-by-step tutorials and guides'),
('News', 'news', 'Latest news and updates in tech world')
ON CONFLICT (slug) DO NOTHING;

-- 4. 샘플 태그 생성
INSERT INTO tags (name, slug) VALUES
('JavaScript', 'javascript'),
('TypeScript', 'typescript'),
('React', 'react'),
('Next.js', 'nextjs'),
('Node.js', 'nodejs'),
('Python', 'python'),
('Docker', 'docker'),
('AWS', 'aws'),
('Database', 'database'),
('API', 'api'),
('Frontend', 'frontend'),
('Backend', 'backend'),
('Mobile', 'mobile'),
('AI', 'ai'),
('ML', 'ml')
ON CONFLICT (slug) DO NOTHING;

-- 5. 샘플 포스트 생성 (선택사항)
-- 관리자 ID를 실제 값으로 교체하세요
/*
INSERT INTO posts (title, content, slug, status, published_at, category_id) VALUES
('Welcome to DevBlog', 
'# Welcome to DevBlog!

This is your first blog post. You can edit or delete this post and start writing your own content.

## Getting Started

1. Log in to the admin dashboard at `/admin`
2. Create new posts using the markdown editor
3. Organize your content with categories and tags
4. Publish your posts when ready

## Features

- **Markdown Support**: Write posts in markdown with live preview
- **SEO Optimized**: Automatic meta tags and structured data
- **Responsive Design**: Works great on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Search Function**: Full-text search with PostgreSQL

Happy blogging! 🚀',
'welcome-to-devblog',
'published',
NOW(),
(SELECT id FROM categories WHERE slug = 'news' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;
*/

-- 6. 확인 쿼리
SELECT 'Categories created:' as type, COUNT(*) as count FROM categories WHERE deleted_at IS NULL
UNION ALL
SELECT 'Tags created:' as type, COUNT(*) as count FROM tags WHERE deleted_at IS NULL
UNION ALL
SELECT 'Posts created:' as type, COUNT(*) as count FROM posts WHERE deleted_at IS NULL
UNION ALL
SELECT 'Admins configured:' as type, COUNT(*) as count FROM admins;