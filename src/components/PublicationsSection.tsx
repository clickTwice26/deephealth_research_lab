'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faExternalLinkAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { api, Publication } from '@/lib/api';

const MOCK_PUBLICATIONS = [
  {
    title: 'The Generative AI Landscape in Education: Mapping the Terrain of Opportunities, Challenges and Student Perception',
    authors: 'Ziehan Ahmed, Shakib Sadat Shanto, Mosi Khatun Mitu, Nafiz Fahad, Jakir Hossen, Md. Abdullah-Al-Jubair',
    journal: 'IEEE Access',
    date: 'September 2024',
    doi: '10.1109/ACCESS.2024.3461874',
    badges: ['Journal', 'IEEE Access'],
  },
  {
    title: 'A novel integrated logistic regression model enhanced with recursive feature elimination and explainable artificial intelligence for dementia prediction',
    authors: 'Rasel Ahmed, Nafiz Fahad, Md Saef Ullah Miah, Md. Jakir Hossen, Md. Kishor Morol, Mufti Mahmud, M Mostafizur Rahman',
    journal: 'Elsevier',
    date: 'December 2024',
    doi: '10.1016/j.health.2024.100163',
    badges: ['Journal', 'Elsevier'],
  },
];

export default function PublicationsSection() {
  const [publications, setPublications] = useState<any[]>(MOCK_PUBLICATIONS);
  const [isUsingMock, setIsUsingMock] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await api.getPublications(1, 5); // Fetch top 5
        if (response && response.items && response.items.length > 0) {
          const formatted = response.items.map(pub => ({
            title: pub.title,
            authors: pub.authors,
            journal: pub.journal,
            date: new Date(pub.date).toLocaleString('default', { month: 'long', year: 'numeric' }),
            doi: pub.doi,
            badges: pub.tags,
            url: pub.url
          }));
          setPublications(formatted);
          setIsUsingMock(false);
        }
      } catch (error) {
        console.error('Failed to fetch publications:', error);
      }
    };

    fetchPublications();
  }, []);

  return (
    <section id="publications" className="relative py-16 overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300 scroll-mt-24">
      {/* Background */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950 transition-colors duration-300" />

      {/* Decorative Elements */}
      <div className="absolute top-40 left-10 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Recent Publications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
              Explore the current research contributions and innovations from DeepHealth Lab
            </p>
          </div>
          <motion.button
            className="mt-6 md:mt-0 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faBook} />
            All Publications
          </motion.button>
        </motion.div>

        {/* Publications List */}
        <div className="space-y-8">
          {publications.map((pub, index) => (
            <motion.div
              key={index}
              className="glass-strong rounded-xl p-6 border border-blue-500/30 dark:border-blue-500/20 hover:border-blue-500/60 dark:hover:border-blue-500/40 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Icon Section */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-24 rounded-lg bg-blue-600/20 dark:bg-blue-500/10 flex items-center justify-center border border-blue-500/30 dark:border-blue-500/20">
                    <FontAwesomeIcon icon={faFileAlt} className="text-2xl text-blue-400" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pub.badges.map((badge: string) => (
                      <span
                        key={badge}
                        className="px-3 py-1 text-xs font-semibold bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full border border-cyan-200 dark:border-cyan-800"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {pub.title}
                  </h3>

                  {/* Authors */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-relaxed">
                    by {pub.authors}
                  </p>

                  {/* Journal and Date */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{pub.journal}</span>
                    <span>|</span>
                    <span>{pub.date}</span>
                    <span>|</span>
                    <span>DOI: {pub.doi}</span>
                  </div>

                  {/* Action Button */}
                  {pub.url && (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex px-6 py-2 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg font-semibold text-white transition-all items-center gap-2"
                    >
                      <span>Full Article</span>
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
