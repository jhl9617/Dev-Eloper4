import { getTranslations } from 'next-intl/server';
import { getCategoriesWithStats, getTrendingTags } from '@/lib/blog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, TrendingUp } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getTranslatedCategoryName, getTranslatedCategoryDescription, getTranslatedTagName } from '@/lib/translations';

interface CategoriesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'navigation' });
  const tBlog = await getTranslations({ locale, namespace: 'blog' });
  const tAdmin = await getTranslations({ locale, namespace: 'admin' });
  const tCategories = await getTranslations({ locale, namespace: 'categories' });
  const tCategoryDescriptions = await getTranslations({ locale, namespace: 'categoryDescriptions' });
  const tTags = await getTranslations({ locale, namespace: 'tags' });
  
  const categoriesWithStats = await getCategoriesWithStats();
  const trendingTags = await getTrendingTags(18);

  const totalPosts = categoriesWithStats.reduce((sum, cat) => sum + cat.post_count, 0);
  
  // Define color patterns for categories
  const colorPatterns = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-violet-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-gray-600 to-gray-800',
    'from-teal-500 to-cyan-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('categories')}
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
              <div className="text-sm text-muted-foreground">{tAdmin('totalArticles')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{categoriesWithStats.length}</div>
              <div className="text-sm text-muted-foreground">{t('categories')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{trendingTags.length}</div>
              <div className="text-sm text-muted-foreground">Trending Topics</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithStats.map((category, index) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${colorPatterns[index % colorPatterns.length]}`} />
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {getTranslatedCategoryName(category.slug, tCategories, category.name)}
                        </CardTitle>
                      </div>
                      {category.post_count > 5 && (
                        <Badge variant="secondary" className="w-fit">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {tAdmin('popularBadge')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {getTranslatedCategoryDescription(category.slug, tCategoryDescriptions, `Explore articles about ${category.name.toLowerCase()}`)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {category.post_count} {category.post_count === 1 ? 'article' : 'articles'}
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
          <h2 className="text-2xl font-semibold">{tBlog('tags')}</h2>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent transition-colors"
                >
                  {getTranslatedTagName(tag.slug, tTags, tag.name)} ({tag.post_count})
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}