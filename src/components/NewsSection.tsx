'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';

const newsItems = [
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
  {
    date: '2025 July',
    title: 'DeepHealth Lab is now officially registered',
    description: 'DeepHealth Lab is now an officially registered Limited Liability Company (LLC) in the USA!',
  },
  {
    date: '2025 July',
    title: 'We are hiring!',
    description: 'DeepHealth Lab is hiring! We have openings for a Research Assistant and a Research Intern—Application Closed.',
  },
  {
    date: '2025 July',
    title: 'Hybrid Self-Attentive Linearized Phrase Structured Transformer',
    description: 'Our paper "A Hybrid Self-Attentive Linearized Phrase Structured Transformer Based RNN for Financial Sentence Analysis with Sentence-Level Explainability" has been officially accepted in Springer Nature - Scientific Reports.',
  },
];

export default function NewsSection() {
  return (
    <section id="news" className="relative py-16 overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Background - Removed absolute div to let section bg handle it, or keep it if needed for layering */}
      {/* <div className="absolute inset-0 bg-white dark:bg-gray-950" />  <-- actually better to just put it on the section or update this div */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950 transition-colors duration-300" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <div className="flex-1 glass-strong rounded-xl p-6 border border-blue-500/20 dark:border-blue-500/10 hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold text-sm">
                        {item.date}
                      </span>
                      <div className="hidden sm:block w-2 h-2 rounded-full bg-blue-500" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
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
