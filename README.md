# Dev-eloper Blog

> Modern blog platform providing elegant writing experience for developers.

![Dev-eloper](https://img.shields.io/badge/Dev--eloper-Modern%20Blog-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8)

## 🚀 Project Overview

**Dev-eloper** is a modern blog platform built with Next.js 15 and Supabase. It allows a single administrator to create, manage, and publish Markdown-based articles while providing visitors with an elegant reading and discovery experience.

### ✨ Key Features

- 📝 **Markdown Editor**: Intuitive WYSIWYG editor based on TipTap
- 🎨 **Responsive Design**: Perfect support for mobile, tablet, and desktop
- 🌗 **Dark Mode**: Automatic light/dark theme switching
- 🌍 **Internationalization**: Full Korean/English support (next-intl)
- 🔍 **Advanced Search**: Real-time search by title, content, and tags
- 🏷️ **Tag System**: Category and tag-based classification
- 🔐 **Secure Authentication**: Supabase Auth-based admin authentication
- ⚡ **Performance Optimization**: Image optimization, lazy loading, SSR/SSG
- 📱 **PWA Support**: Offline reading and installable
- 🎭 **Animations**: Smooth transitions with Framer Motion

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - App Router, React Server Components
- **React 19** - Latest React features
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-based styling
- **shadcn/ui** - Reusable UI components
- **Framer Motion** - High-performance animations

### Backend & Database
- **Supabase** - Authentication, database, storage
- **PostgreSQL** - Powerful relational database
- **Row Level Security** - Data security

### Development Tools
- **ESLint** - Code quality management
- **Prettier** - Code formatting

### Deployment & Hosting
- **Vercel** - Optimized deployment environment
- **Supabase** - Backend services

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dev-eloper.git
   cd dev-eloper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```

   Edit the `.env.local` file and set the required values:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Site Configuration
   NEXT_PUBLIC_SITE_URL=https://www.dev-eloper.site

   # Optional: Analytics
   GOOGLE_ANALYTICS_ID=your_ga_id
   ```

4. **Database setup**
   
   Run the following SQL in your Supabase project:
   ```bash
   # Create database schema
   psql -h your-supabase-host -U postgres -d postgres -f docs/database-complete.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📁 Project Structure

```
Dev-Eloper4/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalization routing
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── blog/             # Blog-related components
│   │   ├── admin/            # Admin components
│   │   └── shared/           # Shared components
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Additional styles
├── public/                   # Static files
├── docs/                     # Project documentation
├── messages/                 # Internationalization messages
└── supabase/                # Supabase-related files
```

## 💻 Development Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🎯 Main Features

### Admin Features
- **Secure Login**: JWT-based authentication system
- **Post Management**: Create, edit, delete, publish/unpublish
- **Image Upload**: Supabase Storage integration
- **Tags & Categories**: Classification system with autocomplete
- **Draft Saving**: Auto-save and preview functionality

### Visitor Features
- **Responsive Design**: Optimized experience on all devices
- **Real-time Search**: Search by title, content, and tags
- **Category Filtering**: Explore posts by topic
- **Social Sharing**: Social media sharing features
- **RSS Feed**: RSS support for subscribers

### Performance Optimization
- **Image Optimization**: Next.js Image component usage
- **Lazy Loading**: Scroll-based content loading
- **Caching**: ISR (Incremental Static Regeneration) applied
- **Core Web Vitals**: Targeting LCP < 1.5s, CLS < 0.1

## 🌐 Deployment

### Vercel Deployment

1. **Connect Vercel account**
   ```bash
   npx vercel
   ```

2. **Set environment variables**
   Set the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`

3. **Connect domain**
   - Set up custom domain in Vercel
   - SSL automatically applied after DNS setup

### Environment Settings

- **Development**: `http://localhost:3000`
- **Staging**: `https://dev-eloper-staging.vercel.app`
- **Production**: `https://www.dev-eloper.site`

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

## 📊 Monitoring & Analytics

- **Web Vitals**: Real-time performance metrics monitoring
- **Vercel Analytics**: User behavior analysis
- **Sentry**: Error tracking and monitoring (optional)

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- **Code Style**: Follow ESLint + Prettier configuration
- **Commit Messages**: Follow [Conventional Commits](https://conventionalcommits.org/) rules
- **Branch Strategy**: Apply Git Flow
- **Testing**: Write test code for new features

## 📝 License

This project is distributed under the MIT License. See [LICENSE](LICENSE) file for more details.

## 📞 Contact

- **Website**: [https://www.dev-eloper.site](https://www.dev-eloper.site)
- **Email**: contact@dev-eloper.site
- **GitHub**: [https://github.com/your-username/dev-eloper](https://github.com/your-username/dev-eloper)

## 🙏 Acknowledgments

This project was built with the help of the following open source projects:

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

Start your own development blog with **Dev-eloper**! 🚀