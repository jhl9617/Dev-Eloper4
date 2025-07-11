import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Github, Twitter, Globe, Code, Zap, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - DevBlog',
  description: 'Learn more about DevBlog, our mission, and the technology behind this modern blog platform.',
  openGraph: {
    title: 'About - DevBlog',
    description: 'Learn more about DevBlog, our mission, and the technology behind this modern blog platform.',
  },
};

export default function AboutPage() {
  const techStack = [
    'Next.js 15',
    'React 19',
    'TypeScript',
    'Supabase',
    'Tailwind CSS',
    'shadcn/ui',
  ];

  const features = [
    {
      icon: Code,
      title: 'Modern Tech Stack',
      description: 'Built with the latest web technologies for optimal performance and developer experience.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed with SSG/SSR, edge caching, and efficient data loading.',
    },
    {
      icon: Users,
      title: 'User Focused',
      description: 'Clean, responsive design that works beautifully on all devices and screen sizes.',
    },
  ];

  return (
    <div className="container py-8 max-w-4xl">
      {/* Navigation */}
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          About DevBlog
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern blog platform built to share knowledge about web development, 
          programming, and the latest in technology.
        </p>
      </div>

      {/* Mission */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert">
          <p>
            DevBlog is designed to be a place where developers can share knowledge, 
            insights, and experiences in the ever-evolving world of technology. 
            We believe in making complex topics accessible and providing practical 
            guidance that helps developers grow in their careers.
          </p>
          <p>
            Whether you&apos;re a beginner just starting your coding journey or an 
            experienced developer looking to stay updated with the latest trends, 
            you&apos;ll find valuable content here covering various aspects of 
            software development, best practices, and emerging technologies.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <feature.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tech Stack */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Built With</CardTitle>
          <CardDescription>
            This blog is built using modern web technologies and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <strong>Frontend:</strong> Next.js with React 19, TypeScript for type safety, 
              and Tailwind CSS with shadcn/ui for beautiful, accessible components.
            </p>
            <p className="mt-2">
              <strong>Backend:</strong> Supabase provides authentication, database, 
              and storage with row-level security for data protection.
            </p>
            <p className="mt-2">
              <strong>Deployment:</strong> Optimized for Vercel with automatic deployments, 
              edge caching, and global CDN distribution.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>
            Have questions, suggestions, or just want to connect?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:hello@devblog.com">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/rss">
                <Globe className="mr-2 h-4 w-4" />
                RSS Feed
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}