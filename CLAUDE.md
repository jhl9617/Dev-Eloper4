# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern blog web application built with Next.js 15 and React 19, designed for a single administrator to manage Markdown-based articles. The app provides an elegant reading experience for visitors with features like search, tagging, and dark mode.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Tech Stack & Architecture

### Core Framework

- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** with shadcn-ui components
- **Supabase** as backend-as-a-service

### Key Libraries

- **State Management**: zustand (global state)
- **Forms**: react-hook-form + zod (validation)
- **Data Fetching**: @tanstack/react-query
- **Date Handling**: date-fns
- **Pattern Matching**: ts-pattern
- **Utilities**: es-toolkit, react-use
- **Icons**: lucide-react
- **Animation**: framer-motion

### Directory Structure

```
src/
├── app/                     # Next.js App Router pages
├── components/ui/           # shadcn-ui components
├── hooks/                   # Custom hooks
├── lib/                     # Utility functions
├── features/[feature]/      # Feature-based organization
    ├── components/          # Feature-specific components
    ├── hooks/              # Feature-specific hooks
    ├── lib/                # Feature-specific utilities
    └── api.ts              # API functions
```

## Development Guidelines

### Component Rules

- **Always use client components** (`"use client"` directive)
- Use async/await for page.tsx params props
- Prioritize functional programming patterns
- Use early returns over nested conditionals

### UI Standards

- Use shadcn-ui components for consistent design
- Implement responsive design with Tailwind CSS
- Support light/dark mode theming
- Use `picsum.photos` for placeholder images

### Code Quality

- Follow ESLint configuration
- Write descriptive variable/function names
- Minimize AI-generated comments
- Use TypeScript strict mode
- Handle errors gracefully with proper validation

### State Management

- Use zustand for global state
- Use react-hook-form for form state
- Validate all inputs with zod schemas
- Use @tanstack/react-query for server state

## Adding New Components

When adding shadcn-ui components, use:

```bash
npx shadcn@latest add [component-name]
```

## Database & Backend

- **Supabase** for authentication, database, and storage
- Store migrations in `/supabase/migrations/`
- Use Row Level Security for data protection
- Handle Korean text with UTF-8 encoding

## Performance & SEO

- Optimize for Core Web Vitals (LCP <1.5s, CLS <0.1)
- Use SSR/SSG for better SEO
- Implement lazy loading for images
- Generate Open Graph and Twitter meta tags

## Error Handling

- Use TODO: and FIXME: comments for known issues
- Prefer returning errors over throwing exceptions
- Implement proper error boundaries
- Provide meaningful error messages

## Testing Strategy

- Write unit tests for core functionality
- Consider integration tests for critical paths
- Test accessibility compliance (WCAG 2.1 AA)
- Validate cross-browser compatibility

## Korean Language Support

- Verify UTF-8 encoding for Korean text
- Check for character encoding issues after code generation
- Test display properly across different browsers

## External Tool Integration

### Gemini Assistant Integration

**Command**: `gemini -p "{{prompt}}"`

Use Gemini as a secondary AI assistant for:
- **Planning Review & Feedback**: Validate implementation plans and architectural decisions
- **Code Stability Analysis**: Review code for potential issues and suggest improvements
- **Long Context Analysis**: Analyze large codebases or complex requirements
- **Implementation Verification**: Cross-check implementations against requirements

**When to Use Gemini:**
- Before implementing complex features (planning validation)
- When reviewing large-scale architectural changes
- For second opinions on critical code decisions
- When analyzing lengthy documentation or requirements

## Project Progress Logging

**CRITICAL**: All work progress must be logged in `docs/progress-log.md`

### Required Logging Points
- Work plan creation and updates
- Important technical decisions
- Context changes and requirement updates
- Problem resolution and solutions
- Task completion and next steps

### Logging Format
```markdown
### [YYYY-MM-DD HH:MM] Task Title
**작업**: Task summary
**중요 컨텍스트**: Critical context info
**결과/결정사항**: Results and decisions
**다음 단계**: Next steps
```

**Always check `docs/progress-log.md` before starting work to understand current project state and context.**

## Database Schema Management

**CRITICAL**: All database schema changes must be properly managed

### Database Change Protocol
1. **Update Schema File**: Always update `docs/database-complete.sql` with new schema changes
2. **Provide SQL Output**: After making changes, provide the SQL commands in a code block for direct execution
3. **Clear Documentation**: Document what tables/columns/indexes were added or modified

### SQL Output Format
When making database changes, always provide:
```sql
-- Copy and paste this into Supabase SQL Editor
-- [Description of changes]

[SQL commands here]
```

**Always update `@docs/database-complete.sql` first, then provide executable SQL output for the user.**
