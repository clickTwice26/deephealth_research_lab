'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faRobot, faEye, faUserMd, faArrowRight, faNetworkWired, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/lib/api';

const MOCK_RESEARCH_AREAS = [
  {
    number: '01',
    title: 'Generative AI',
    icon: faRobot,
    description: 'DeepHealth Lab develops models that generate new data, like text or images, expanding the creative potential of AI.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100'
  },
  {
    number: '02',
    title: 'Explainable AI (XAI)',
    icon: faBrain,
    description: 'We create AI systems that are transparent, offering clear insights into their decisions to build trust and accountability.',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-100'
  },
  {
    number: '03',
    title: 'Natural Language Processing',
    icon: faLanguage,
    description: 'Our work in NLP advances the ability of machines to understand and generate human language.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100'
  },
  {
    number: '04',
    title: 'Computer Vision',
    icon: faEye,
    description: 'Focusing on algorithms that enable machines to interpret visual data for autonomous systems and healthcare.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-100'
  },
  {
    number: '05',
    title: 'Human-AI Interaction',
    icon: faUserMd,
    description: 'We design user-friendly interfaces and experiences, enhancing the way people interact with technology.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100'
  },
  {
    number: '06',
    title: 'Federated Learning',
    icon: faNetworkWired,
    description: 'Decentralized machine learning techniques that preserve privacy while training powerful global models.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-100'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const ICON_MAP: Record<string, any> = {
  faBrain, faRobot, faEye, faUserMd, faNetworkWired, faLanguage
};

export default function ResearchAreasSection() {
  const [researchAreas, setResearchAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await api.getResearchAreas();
        // Handle generic or paginated response
        const items = (response as any).items || (Array.isArray(response) ? response : []);

        if (items && items.length > 0) {
          const formatted = items.map((area: any) => ({
            ...area,
            // Use icon from backend (string) mapped to object, or fallback to mock/default
            icon: ICON_MAP[area.icon] || MOCK_RESEARCH_AREAS.find(m => m.title === area.title)?.icon || faBrain
          }));
          setResearchAreas(formatted);
        }
      } catch (e) {
        console.error("Failed to fetch research areas", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, []);

  if (!loading && researchAreas.length === 0) return null;

  return (
    <section id="research" className="relative py-24 bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-300 scroll-mt-24">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-50 md:opacity-100" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-50/50 dark:bg-cyan-900/20 rounded-full blur-[100px] opacity-50 md:opacity-100" />

      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-16 2xl:px-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
            Core Focus
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Research Areas
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Exploring the frontiers of artificial intelligence to solve the world's most pressing challenges.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 2xl:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {researchAreas.map((area) => (
            <motion.div
              key={area.number || area._id}
              variants={itemVariants}
              className="relative group"
            >
              <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1" />

              {/* Card Content - Wrapped in Link if available, otherwise just div */}
              {area.link ? (
                <a href={area.link} className="relative block p-8 z-10 h-full">
                  <CardContent area={area} />
                </a>
              ) : (
                <div className="relative p-8 z-10 h-full">
                  <CardContent area={area} />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Extracted for reuse
function CardContent({ area }: { area: any }) {
  return (
    <>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${area.bg_color || area.bgColor} ${area.color} bg-opacity-20`}>
        <FontAwesomeIcon icon={area.icon} className="text-xl" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {area.title}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
        {area.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-4xl font-bold text-gray-200 dark:text-gray-800 select-none group-hover:text-gray-300 dark:group-hover:text-gray-700 transition-colors">
          {area.number}
        </span>
        <div className={`w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 ${area.link ? 'group-hover:bg-blue-600 group-hover:text-white' : ''} transition-all`}>
          <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
        </div>
      </div>
    </>
  );
}
