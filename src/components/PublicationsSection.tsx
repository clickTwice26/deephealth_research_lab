'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faExternalLinkAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const publications = [
  {
    title: 'The Generative AI Landscape in Education: Mapping the Terrain of Opportunities, Challenges and Student Perception',
    authors: 'Ziehan Ahmed, Shakib Sadat Shanto, Mosi Khatun Mitu, Nafiz Fahad, Jakir Hossen, Md. Abdullah-Al-Jubair',
    journal: 'IEEE Access',
    date: 'September 2024',
    doi: '10.1109/ACCESS.2024.3461874',
    badges: ['Journal', 'IEEE Access'],
    color: 'border-blue-500/30',
  },
  {
    title: 'A novel integrated logistic regression model enhanced with recursive feature elimination and explainable artificial intelligence for dementia prediction',
    authors: 'Rasel Ahmed, Nafiz Fahad, Md Saef Ullah Miah, Md. Jakir Hossen, Md. Kishor Morol, Mufti Mahmud, M Mostafizur Rahman',
    journal: 'Elsevier',
    date: 'December 2024',
    doi: '10.1016/j.health.2024.100163',
    badges: ['Journal', 'Elsevier'],
    color: 'border-purple-500/30',
  },
];

export default function PublicationsSection() {
  return (
    <section id="publications" className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-950" />

      {/* Decorative Elements */}
      <div className="absolute top-40 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Recent Publications
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl">
              Explore the current research contributions and innovations from DeepHealth Lab
            </p>
          </div>
          <motion.button
            className="mt-6 md:mt-0 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold text-white transition-all flex items-center gap-2"
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
              className={`glass-strong rounded-2xl p-8 border ${pub.color} hover:border-purple-500/60 transition-all group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Icon Section */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-32 rounded-lg bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                    <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-purple-400" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pub.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-3 py-1 text-xs font-semibold bg-cyan-600/20 text-cyan-300 rounded-full border border-cyan-500/30"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {pub.title}
                  </h3>

                  {/* Authors */}
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    by {pub.authors}
                  </p>

                  {/* Journal and Date */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
                    <span>{pub.journal}</span>
                    <span>|</span>
                    <span>{pub.date}</span>
                    <span>|</span>
                    <span>DOI: {pub.doi}</span>
                  </div>

                  {/* Action Button */}
                  <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold text-white transition-all flex items-center gap-2">
                    <span>Full Article</span>
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
