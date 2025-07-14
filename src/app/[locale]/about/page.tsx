"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Twitter, Mail, MapPin, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { CategoryWithStats } from '@/lib/blog';
import { getTranslatedCategoryName } from '@/lib/translations';

export default function AboutPage() {
  const t = useTranslations();
  const tCategories = useTranslations('categories');
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      
      // Fetch categories with stats (same logic as in lib/blog.ts)
      const { data: categoriesData } = await supabase
        .from('categories')
        .select(`
          *,
          posts!inner(id)
        `)
        .is('deleted_at', null)
        .eq('posts.status', 'published')
        .is('posts.deleted_at', null)
        .limit(6);

      if (categoriesData) {
        const categoryStats = new Map<string, number>();
        categoriesData.forEach(item => {
          const count = categoryStats.get(item.id.toString()) || 0;
          categoryStats.set(item.id.toString(), count + 1);
        });

        const uniqueCategories = new Map();
        categoriesData.forEach(item => {
          if (!uniqueCategories.has(item.id)) {
            uniqueCategories.set(item.id, {
              ...item,
              post_count: categoryStats.get(item.id.toString()) || 0
            });
          }
        });

        const sortedCategories = Array.from(uniqueCategories.values())
          .sort((a: any, b: any) => b.post_count - a.post_count)
          .slice(0, 6);
        
        setCategories(sortedCategories);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('navigation.about')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to Dec-Eloper - where development meets innovation
          </p>
        </div>

        {/* About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Story</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert">
                <p>
                  Dec-Eloper is a modern blog platform dedicated to sharing insights, 
                  tutorials, and innovations in the world of software development. 
                  Built with cutting-edge technologies like Next.js 15 and Supabase, 
                  we provide a seamless reading and writing experience.
                </p>
                <p>
                  Our mission is to create a community where developers can learn, 
                  share knowledge, and grow together. Whether you&apos;re a beginner 
                  taking your first steps in programming or an experienced developer 
                  looking to explore new technologies, you&apos;ll find valuable content here.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What We Cover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Badge key={category.id} variant="secondary" className="p-2 text-center">
                        {getTranslatedCategoryName(category.slug, tCategories, category.name)}
                      </Badge>
                    ))
                  ) : (
                    // Fallback while loading
                    ['Frontend Development', 'Backend Development', 'DevOps & Cloud', 'Database Design', 'Mobile Development', 'AI & Machine Learning'].map((topic) => (
                      <Badge key={topic} variant="secondary" className="p-2 text-center">
                        {topic}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Launched in 2024</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Global Community</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connect With Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm hover:text-blue-600 transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm hover:text-blue-600 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </a>
                <a 
                  href="mailto:contact@dec-eloper.com" 
                  className="flex items-center space-x-2 text-sm hover:text-blue-600 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'Next.js 15',
                    'React 19', 
                    'TypeScript',
                    'Tailwind CSS',
                    'Supabase',
                    'Vercel'
                  ].map((tech) => (
                    <Badge key={tech} variant="outline" className="mr-2">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}