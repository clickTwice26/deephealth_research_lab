'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Brain } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faRobot, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('./Scene3D'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-transparent" />
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section id="home" className="relative min-h-[75vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden py-8 sm:py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />

      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* 3D Scene */}
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{ y }}
      >
        <Suspense fallback={<div />}>
          <Scene3D />
        </Suspense>
      </motion.div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-500/15 rounded-full blur-[100px] animate-pulse delay-500" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ opacity }}
      >
        <motion.div variants={itemVariants} className="mb-6">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/30 mb-8"
            whileHover={{ scale: 1.05 }}
            animate={floatingAnimation}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">
              Pioneering AI Healthcare Innovation
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </motion.div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight"
        >
          <span className="block text-gray-900">
            Welcome to
          </span>
          <span className="block mt-2 text-blue-400">
            DeepHealth Research Lab
          </span>
        </motion.h1>

        <motion.div variants={itemVariants} className="mb-5 max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
            At <span className="font-semibold text-blue-400">DeepHealth Research Lab</span>,
            we pioneer cutting-edge AI research in healthcare, developing innovative solutions
            for medical diagnosis, patient care, and health monitoring that are both{' '}
            <span className="font-semibold text-cyan-400">accurate</span> and{' '}
            <span className="font-semibold text-teal-400">reliable</span>.
          </p>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-xs sm:text-sm text-gray-500 mb-6 max-w-2xl mx-auto"
        >
          Our research focuses on leveraging AI to transform healthcare through{' '}
          <span className="text-blue-400 font-medium">intelligent diagnostics</span>,{' '}
          <span className="text-cyan-400 font-medium">personalized treatment</span>, and{' '}
          <span className="text-teal-400 font-medium">preventive care solutions</span>.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-2"
        >
          <motion.button
            className="group relative px-5 py-2.5 bg-blue-600 rounded-full font-semibold text-white text-xs shadow-lg shadow-blue-500/30 overflow-hidden"
            whileHover={{ scale: 1.03, backgroundColor: '#3b82f6' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Learn More
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>

          <motion.button
            className="group px-5 py-2.5 glass-strong rounded-full font-semibold text-gray-900 text-xs border border-blue-500/30 hover:border-blue-500 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Our Research
            </span>
          </motion.button>
        </motion.div>

        {/* Floating Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: 'Research Papers', value: '50+', icon: faFileAlt, color: 'text-blue-400' },
            { label: 'AI Models', value: '25+', icon: faRobot, color: 'text-cyan-400' },
            { label: 'Global Partners', value: '100+', icon: faGlobe, color: 'text-teal-400' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-strong rounded-lg p-3 sm:p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all group"
              whileHover={{ y: -3, scale: 1.01 }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            >
              <div className="mb-1.5">
                <FontAwesomeIcon icon={stat.icon} className={`text-xl ${stat.color}`} />
              </div>
              <div className="text-lg font-bold text-blue-400 mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <div className="w-6 h-10 border-2 border-blue-500/50 rounded-full p-1">
          <motion.div
            className="w-1 h-2 bg-blue-500 rounded-full mx-auto"
            animate={{
              y: [0, 16, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
