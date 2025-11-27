'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

const projects = [
  {
    title: 'Xolver: Multi-Agent Reasoning',
    description: 'A multi-agent, training-free reasoning framework that enhances LLMs by integrating holistic experiences such as tool usage, collaboration, and iterative refinement, enabling them to perform expert-level reasoning.',
    tags: ['Multi-Agent', 'LLM', 'Reasoning'],
  },
  {
    title: 'HoloInteract',
    description: 'An advanced Human-Computer Interaction project that uses augmented reality (AR) to create immersive, user-friendly interfaces, enhancing experiences in education and training.',
    tags: ['AR', 'HCI', 'Education'],
  },
  {
    title: 'VisionX',
    description: 'A computer vision system that detects and classifies objects in real-time, optimized for healthcare and autonomous navigation, leveraging Explainable AI to interpret visual data.',
    tags: ['Computer Vision', 'Healthcare', 'XAI'],
  },
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

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
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ongoing Projects
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl">
              Explore the innovative projects currently underway at DeepHealth Lab.
            </p>
          </div>
          <motion.button
            className="mt-6 md:mt-0 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faFolderOpen} />
            All Projects
          </motion.button>
        </motion.div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              className="glass-strong rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/60 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              {/* Project Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <FontAwesomeIcon icon={faFolderOpen} className="text-xl text-blue-400" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-gray-300 text-xs leading-relaxed mb-4">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-blue-600/20 text-blue-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* See Project Button */}
              <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2">
                <span>See Project</span>
                <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
