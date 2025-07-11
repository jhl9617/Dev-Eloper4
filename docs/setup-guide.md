# Dev-Eloper4 Blog Setup Guide

Complete setup guide for the Dev-Eloper4 blog application.

## Quick Start

### 1. Database Setup

Run the main database setup script in Supabase SQL Editor:

```sql
-- Run this file: docs/database-complete.sql
```

### 2. Storage Setup

Run the storage setup script:

```sql
-- Run this file: docs/storage-setup.sql
```

### 3. Admin User Setup

Add your admin user to the database:

```sql
-- Replace 'your-user-uuid' with your actual Supabase auth user UUID
INSERT INTO admins (user_id) VALUES ('your-user-uuid');
```

### 4. Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

## Database Schema

The database includes the following tables:

### Core Tables
- **admins**: Admin user management
- **categories**: Post categories
- **tags**: Post tags
- **posts**: Blog posts
- **post_tags**: Post-tag relationships

### Security Tables
- **security_logs**: Security event logging
- **login_attempts**: Login attempt tracking

### Key Features
- **Row Level Security (RLS)**: Enabled on all tables
- **Full-text Search**: Implemented with PostgreSQL tsvector
- **Soft Delete**: Posts can be soft-deleted
- **Admin Functions**: `is_admin()` function for permission checks

## Security Features

### Admin Authentication
- Email-based admin identification
- Database-level admin table for permissions
- RLS policies for data protection

### Security Logging
- All admin actions are logged
- Login attempts are tracked
- IP address and user agent logging

### Storage Security
- Admin-only upload permissions
- Public read access for images
- File type and size restrictions

## Development Features

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Admin Features
- Post management (create, edit, delete)
- Category management
- Tag management
- Image upload
- Draft/publish workflow

## File Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── admin/              # Admin dashboard
│   └── ...
├── components/             # React components
│   ├── ui/                # shadcn-ui components
│   └── admin/             # Admin-specific components
├── lib/                   # Utilities and configurations
│   ├── supabase/          # Supabase client
│   └── validations/       # Zod schemas
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks

docs/
├── database-complete.sql  # Main database setup
├── storage-setup.sql      # Storage configuration
└── setup-guide.md         # This file

tests/
└── scripts/               # Test and demo scripts
```

## Troubleshooting

### Common Issues

1. **RLS Permission Denied**
   - Ensure your user is in the `admins` table
   - Check if RLS policies are properly configured

2. **Storage Upload Fails**
   - Verify storage policies are set up
   - Check file type and size limits

3. **Database Connection Issues**
   - Verify environment variables
   - Check Supabase project URL and keys

### Testing Admin Functions

```sql
-- Test admin function
SELECT is_admin();

-- Check if user is admin
SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
```

## Next Steps

After setup:
1. Create your first blog post
2. Configure categories and tags
3. Set up custom domain (if needed)
4. Configure analytics
5. Set up automated backups

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the database schema
3. Check Supabase logs
4. Verify RLS policies