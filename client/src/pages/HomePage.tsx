import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Folder, Zap, Shield, Smartphone } from 'lucide-react';
import { Button } from '@/components/common';

const features = [
  {
    icon: Zap,
    title: 'Hiệu năng cao',
    description: 'Được tối ưu hóa với Vite và React 18 cho trải nghiệm mượt mà',
  },
  {
    icon: Shield,
    title: 'Bảo mật',
    description: 'Tích hợp các tiêu chuẩn bảo mật OWASP và Helmet',
  },
  {
    icon: Smartphone,
    title: 'Đa nền tảng',
    description: 'Chạy trên Web, Android và iOS với Capacitor',
  },
  {
    icon: Folder,
    title: 'Quản lý Danh mục',
    description: 'Tính năng mẫu để phát triển ứng dụng',
  },
];

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function HomePage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 md:py-20"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
        >
          <Zap className="w-4 h-4" />
          Template sẵn sàng cho production
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-gradient">SuperApp</span>
          <br />
          <span className="text-foreground">Cross-Platform Boilerplate</span>
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-8">
          Ứng dụng mẫu dùng phát triển các ứng dụng cho nhóm. 
          Được xây dựng với React, TypeScript, Vite và Node.js Express.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/categories">
            <Button size="lg" className="w-full sm:w-auto">
              Bắt đầu ngay
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Xem tài liệu
          </Button>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 py-12"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="card-hover p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Tech Stack */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-12 text-center"
      >
        <h2 className="text-2xl font-bold text-foreground mb-8">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {['React 18', 'TypeScript', 'Vite', 'TailwindCSS', 'Node.js', 'Express', 'Capacitor', 'PocketBase'].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium text-muted hover:text-primary hover:border-primary transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
