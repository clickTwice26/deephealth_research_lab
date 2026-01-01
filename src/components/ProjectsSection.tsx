'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/lib/api';

export default function ProjectsSection() {
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects();
        if (data && data.length > 0) {
          setProjectsList(data);
        }
      } catch (e) {
        console.error("Failed to fetch projects", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (!loading && projectsList.length === 0) return null;

  return (
    <section id="projects" className="relative py-16 overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300 scroll-mt-24">
      {/* Background */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950 transition-colors duration-300" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-16 2xl:px-24">
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
              Ongoing Projects
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
              Explore the innovative projects currently underway at DeepHealth Lab.
            </p>
          </div>
          <motion.button
            className="mt-6 md:mt-0 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faFolderOpen} />
            All Projects
          </motion.button>
        </motion.div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 2xl:gap-10">
          {projectsList.map((project, index) => (
            <motion.div
              key={project._id || project.title}
              className="glass-strong rounded-xl p-6 border border-blue-500/30 dark:border-blue-500/20 hover:border-blue-500/60 dark:hover:border-blue-500/40 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              {/* Project Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600/20 dark:bg-blue-500/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faFolderOpen} className="text-xl text-blue-400" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-4">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* See Project Button */}
              {project.link && (
                <a href={project.link} target="_blank" className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2">
                  <span>See Project</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
                </a>
              )}
              {!project.link && (
                <button disabled className="w-full px-6 py-3 bg-gray-400 cursor-not-allowed rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2">
                  <span>Coming Soon</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
