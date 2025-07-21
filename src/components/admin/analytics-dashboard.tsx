'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageCircle, FileText, TrendingUp, Users, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface AnalyticsData {
  overview: {
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    totalComments: number;
  };
  popularPosts: Array<{
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    created_at: string;
  }>;
  chartData: Array<{
    date: string;
    views: number;
  }>;
  categoryStats: Array<{
    id: number;
    name: string;
    slug: string;
    postCount: number;
  }>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 게시물</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                {data.overview.publishedPosts}개 게시됨
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                누적 조회수
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 댓글수</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalComments}</div>
              <p className="text-xs text-muted-foreground">
                누적 댓글수
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 조회수</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.publishedPosts > 0 
                  ? Math.round(data.overview.totalViews / data.overview.publishedPosts)
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">
                게시물당 평균
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Popular Posts */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.5 }}
          className="col-span-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>인기 게시물</CardTitle>
              <CardDescription>조회수가 많은 게시물 순위</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.popularPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{post.viewCount}</span>
                    </div>
                  </div>
                ))}
                {data.popularPosts.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    아직 조회수 데이터가 없습니다
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Stats */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.6 }}
          className="col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 통계</CardTitle>
              <CardDescription>카테고리별 게시물 수</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.categoryStats.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="outline">{category.postCount}</Badge>
                  </div>
                ))}
                {data.categoryStats.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    카테고리 데이터가 없습니다
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      {data.chartData.length > 0 && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>최근 7일 조회수</CardTitle>
              <CardDescription>일별 조회수 추이</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.chartData.map((item) => (
                  <div key={item.date} className="flex items-center justify-between">
                    <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ 
                          width: `${Math.max(20, (item.views / Math.max(...data.chartData.map(d => d.views))) * 100)}px` 
                        }}
                      ></div>
                      <span className="text-sm font-medium w-8 text-right">{item.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}