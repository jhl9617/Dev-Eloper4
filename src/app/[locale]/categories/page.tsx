"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, TrendingUp } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function CategoriesPage() {
  const t = useTranslations();

  const categories = [
    {
      id: 'frontend',
      name: 'Frontend Development',
      description: 'React, Vue.js, Angular, and modern frontend technologies',
      postCount: 24,
      trending: true,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'backend',
      name: 'Backend Development', 
      description: 'Node.js, Python, Java, API design and server architecture',
      postCount: 18,
      trending: false,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'devops',
      name: 'DevOps & Cloud',
      description: 'Docker, Kubernetes, CI/CD, AWS, and cloud infrastructure',
      postCount: 15,
      trending: true,
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 'database',
      name: 'Database & Storage',
      description: 'SQL, NoSQL, Redis, database design and optimization',
      postCount: 12,
      trending: false,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'mobile',
      name: 'Mobile Development',
      description: 'React Native, Flutter, iOS, and Android development',
      postCount: 16,
      trending: false,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'ai-ml',
      name: 'AI & Machine Learning',
      description: 'TensorFlow, PyTorch, neural networks, and AI applications',
      postCount: 10,
      trending: true,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'security',
      name: 'Cybersecurity',
      description: 'Web security, authentication, encryption, and best practices',
      postCount: 8,
      trending: false,
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 'tools',
      name: 'Tools & Productivity',
      description: 'IDEs, version control, project management, and workflow optimization',
      postCount: 14,
      trending: false,
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  const totalPosts = categories.reduce((sum, cat) => sum + cat.postCount, 0);
  const trendingCategories = categories.filter(cat => cat.trending);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('navigation.categories')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our content organized by technology and topic
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{totalPosts}</div>
              <div className="text-sm text-muted-foreground">Total Articles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{trendingCategories.length}</div>
              <div className="text-sm text-muted-foreground">Trending Topics</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${category.color}`} />
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </CardTitle>
                      </div>
                      {category.trending && (
                        <Badge variant="secondary" className="w-fit">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {category.postCount} articles
                    </span>
                    <span className="text-blue-600 group-hover:text-blue-700 font-medium">
                      View all →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Popular Tags */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {[
              'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 
              'Docker', 'AWS', 'JavaScript', 'GraphQL', 'MongoDB',
              'PostgreSQL', 'Redis', 'Kubernetes', 'TensorFlow',
              'Flutter', 'Vue.js', 'Angular', 'Express.js'
            ].map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="cursor-pointer hover:bg-accent transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}