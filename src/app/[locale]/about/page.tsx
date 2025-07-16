"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Github,
  Twitter,
  Mail,
  MapPin,
  Calendar,
  Code2,
  Coffee,
  BookOpen,
  Users,
  Star,
  GitBranch,
  Zap,
  Heart,
  Terminal,
  Rocket,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CategoryWithStats } from "@/lib/blog";
import { getTranslatedCategoryName } from "@/lib/translations";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const skillsData = [
  { name: "Frontend", color: "bg-blue-500", icon: "🎨" },
  { name: "Backend", color: "bg-green-500", icon: "⚙️" },
  { name: "DevOps", color: "bg-purple-500", icon: "🚀" },
];

const techStack = [
  { name: "React", icon: "⚛️", level: "Intermediate" },
  { name: "Next.js", icon: "▲", level: "Intermediate" },
  { name: "TypeScript", icon: "🔷", level: "Intermediate" },
  { name: "Node.js", icon: "🟢", level: "Intermediate" },

  { name: "Supabase", icon: "🚀", level: "Intermediate" },
  { name: "Docker", icon: "🐳", level: "Intermediate" },
  { name: "AWS", icon: "☁️", level: "Intermediate" },
];

const journeyData = [
  // {
  //   year: "2024",
  //   title: "Dev-eloper 블로그 런칭",
  //   description: "개발자 커뮤니티를 위한 현대적인 블로그 플랫폼 구축",
  //   tech: ["Next.js 15", "React 19", "Supabase"],
  // },
  // {
  //   year: "2023",
  //   title: "풀스택 개발자 전환",
  //   description: "프론트엔드에서 백엔드까지 전체 웹 개발 스택 마스터",
  //   tech: ["Node.js", "PostgreSQL", "Docker"],
  // },
  // {
  //   year: "2022",
  //   title: "모던 프론트엔드 전문화",
  //   description: "React 생태계와 모던 웹 기술에 집중",
  //   tech: ["React", "TypeScript", "Tailwind CSS"],
  // },
  // {
  //   year: "2021",
  //   title: "개발 여정 시작",
  //   description: "HTML, CSS, JavaScript부터 시작한 웹 개발 입문",
  //   tech: ["HTML", "CSS", "JavaScript"],
  // },
];

export default function AboutPage() {
  const t = useTranslations();
  const tCategories = useTranslations("categories");
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [blogStats, setBlogStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalCategories: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select(
          `
          *,
          posts!inner(id)
        `
        )
        .is("deleted_at", null)
        .eq("posts.status", "published")
        .is("posts.deleted_at", null)
        .limit(6);

      // Fetch blog stats
      const { data: postsData, count: postsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .is("deleted_at", null);

      const { data: categoriesCountData, count: categoriesCount } =
        await supabase
          .from("categories")
          .select("*", { count: "exact" })
          .is("deleted_at", null);

      if (categoriesData) {
        const categoryStats = new Map<string, number>();
        categoriesData.forEach((item) => {
          const count = categoryStats.get(item.id.toString()) || 0;
          categoryStats.set(item.id.toString(), count + 1);
        });

        const uniqueCategories = new Map();
        categoriesData.forEach((item) => {
          if (!uniqueCategories.has(item.id)) {
            uniqueCategories.set(item.id, {
              ...item,
              post_count: categoryStats.get(item.id.toString()) || 0,
            });
          }
        });

        const sortedCategories = Array.from(uniqueCategories.values())
          .sort((a: any, b: any) => b.post_count - a.post_count)
          .slice(0, 6);

        setCategories(sortedCategories);
      }

      setBlogStats({
        totalPosts: postsCount || 0,
        totalViews: Math.floor(Math.random() * 10000) + 1000, // Mock data
        totalCategories: categoriesCount || 0,
      });
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        className="container mx-auto px-4 py-8 max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.section className="text-center mb-16" variants={itemVariants}>
          <div className="relative inline-block mb-8">
            <motion.div
              className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Code2 className="w-16 h-16 text-primary" />
              </div>
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dev-eloper
            </span>
          </motion.h1>

          <motion.div
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            <span className="inline-block">
              개발을 통해 세상을 더 나은 곳으로 만들어가는
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-semibold">
              풀스택 개발자
            </span>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-8"
            variants={itemVariants}
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Coffee className="w-4 h-4 mr-2" />
              Coffee Driven
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Terminal className="w-4 h-4 mr-2" />
              Code Enthusiast
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Rocket className="w-4 h-4 mr-2" />
              Innovation Seeker
            </Badge>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            variants={itemVariants}
          >
            <Button size="lg" className="gap-2">
              <BookOpen className="w-4 h-4" />
              블로그 둘러보기
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Mail className="w-4 h-4" />
              연락하기
            </Button>
          </motion.div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={itemVariants}
        >
          <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {blogStats.totalPosts}
              </div>
              <div className="text-sm text-muted-foreground">게시된 아티클</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {blogStats.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">총 조회수</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {blogStats.totalCategories}
              </div>
              <div className="text-sm text-muted-foreground">다루는 주제</div>
            </CardContent>
          </Card>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Story */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    개발자로서의 여정
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed mb-4">
                      안녕하세요! 저는 <strong>Dev-eloper</strong> 개발자
                      입니다. 단순히 코드를 작성하는 것을 넘어서, AI 를 활용하여
                      개발의 생산성을 높히고 경험을 공유하여 기여하고자 하는
                      바람으로 블로그 서비스를 제작 하게 되었습니다.
                    </p>
                    <p className="text-lg leading-relaxed mb-4">
                      현재는 <strong>Next.js, React, TypeScript</strong>를
                      주력으로 하는 풀스택 개발자로 활동하고 있으며, 특히 사용자
                      경험과 개발자 경험을 동시에 고려한 웹 애플리케이션 구축에
                      집중하고 있습니다.
                    </p>
                    <p className="text-lg leading-relaxed">
                      이 블로그는 제가 개발하면서 배운 지식과 경험을 공유하고,
                      함께 성장할 수 있는 개발자 커뮤니티를 만들어가기 위한
                      공간입니다.
                      <span className="text-primary font-semibold">
                        함께 배우고, 함께 성장해요!
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Journey Timeline */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-primary" />
                    개발 여정 타임라인
                  </CardTitle>
                  <CardDescription>
                    주요 마일스톤과 기술 스택의 진화 과정
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {journeyData.map((item, index) => (
                      <motion.div
                        key={item.year}
                        className="relative flex gap-4 pb-6 border-l-2 border-primary/20 last:border-l-0 ml-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                        <div className="flex-1 ml-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.year}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.tech.map((tech) => (
                              <Badge
                                key={tech}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills Areas */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    관심 분야 & 스킬
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillsData.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-br from-background to-muted/30 hover:to-muted/50 transition-all cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${skill.color} flex items-center justify-center text-white`}
                        >
                          <span className="text-lg">{skill.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-sm text-muted-foreground">
                            지속적 학습 중
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tech Stack */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-primary" />
                    기술 스택
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {techStack.map((tech, index) => (
                      <motion.div
                        key={tech.name}
                        className="p-3 rounded-lg border bg-gradient-to-br from-background to-muted/50 hover:to-muted transition-all cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="text-2xl mb-1">{tech.icon}</div>
                        <div className="font-medium text-sm">{tech.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {tech.level}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Blog Categories */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    주요 다루는 주제
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.length > 0
                      ? categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm">
                              {getTranslatedCategoryName(
                                category.slug,
                                tCategories,
                                category.name
                              )}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {category.post_count}
                            </Badge>
                          </div>
                        ))
                      : [
                          "Frontend",
                          "Backend",
                          "DevOps",
                          "Database",
                          "Mobile",
                          "AI/ML",
                        ].map((topic) => (
                          <div
                            key={topic}
                            className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm">{topic}</span>
                            <Badge variant="secondary" className="text-xs">
                              -
                            </Badge>
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10"
                    asChild
                  >
                    <a
                      href="https://github.com/jhl9617"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>

                  {/* <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-blue-500/10"
                    asChild
                  >
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter 팔로우
                    </a>
                  </Button> */}

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-green-500/10"
                    asChild
                  >
                    <a href="mailto:jhl9617@gmail.com">
                      <Mail className="h-4 w-4" />
                      e-mail
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Info */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>대한민국, 서울</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>2025년부터 블로깅</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coffee className="h-4 w-4 text-muted-foreground" />
                    <span>☕ 커피 중독자</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
