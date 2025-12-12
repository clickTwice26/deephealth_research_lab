'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { api, News } from '@/lib/api';

const MOCK_NEWS = [
  {
    date: '2025 October',
    title: 'Linguistic Bias with the Variance of Context Span',
    description: 'Our paper "Linguistic Bias with the Variance of Context Span: Pragmatic Formality and Informality in Bengali Language Representations" has been accepted at the prestigious IJCNLP-AACL 2025 Conference, to be held in Mumbai, India (Dec 20-24, 2025)!',
  },
  {
    date: '2025 September',
    title: 'BRAINS: A Retrieval-Augmented System for Alzheimer\'s Detection',
    description: 'Our paper "BRAINS: A Retrieval-Augmented System for Alzheimer\'s Detection and Monitoring" has been accepted at the renowned IEEE ICMLA 2025 Conference (USA)!',
  },
  {
    date: '2025 August',
    title: 'B-REASO: Multi-Level Multi-Faceted Bengali Evaluation Suite',
    description: 'Another Ranked Conference from DeepHealth Research Lab! Our paper "B-REASO: A Multi-Level Multi-Faceted Bengali Evaluation Suite for Foundation Models" has been accepted to EMNLP 2025 Findings!',
  },
];

export default function NewsSection() {
  const [newsItems, setNewsItems] = useState<any[]>(MOCK_NEWS);
  const [isUsingMock, setIsUsingMock] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.getNews(1, 100); // Get first 100 items for landing page
        if (response && response.items && response.items.length > 0) {
          // Formatting API data to match UI expected format
          const formatted = response.items.map(item => ({
            date: new Date(item.date).toLocaleString('default', { month: 'long', year: 'numeric' }),
            title: item.title,
            description: item.description,
            cta_text: item.cta_text,
            cta_link: item.cta_link
          }));
          setNewsItems(formatted);
          setIsUsingMock(false);
        }
      } catch (error) {
        console.error("Failed to load news, falling back to static content");
      }
    };
    fetchNews();
  }, []);

  return (
    <section id="news" className="relative py-16 overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300 scroll-mt-24">
      {/* Background - Removed absolute div to let section bg handle it, or keep it if needed for layering */}
      {/* <div className="absolute inset-0 bg-white dark:bg-gray-950" />  <-- actually better to just put it on the section or update this div */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950 transition-colors duration-300" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-16 2xl:px-24">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Recent News
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay informed about the latest developments, achievements, and events from our lab.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-500/30 dark:bg-blue-500/20 hidden md:block" />

          {/* News Items */}
          <div className="space-y-8">
            {newsItems.map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex gap-6 items-start">
                  {/* Date Badge */}
                  <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 border-4 border-white dark:border-gray-900 z-10 flex-shrink-0 transition-colors">
                    <FontAwesomeIcon icon={faNewspaper} className="text-white text-xl" />
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 max-w-5xl glass-strong rounded-xl p-6 border border-blue-500/20 dark:border-blue-500/10 hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold text-sm">
                        {item.date}
                      </span>
                      <div className="hidden sm:block w-2 h-2 rounded-full bg-blue-500" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {item.cta_text && item.cta_link && (
                      <a
                        href={item.cta_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group/link"
                      >
                        {item.cta_text}
                        <FontAwesomeIcon icon={faArrowRight} className="text-xs transition-transform group-hover/link:translate-x-1" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

