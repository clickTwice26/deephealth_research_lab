'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faRobot, faEye, faUserMd, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const researchAreas = [
  {
    number: '01',
    title: 'Generative AI',
    icon: faRobot,
    description: 'DeepHealth Lab develops models that generate new data, like text or images, expanding the creative potential of AI.',
    color: 'text-purple-400',
  },
  {
    number: '02',
    title: 'Explainable AI (XAI)',
    icon: faBrain,
    description: 'We create AI systems that are transparent, offering clear insights into their decisions to build trust and accountability.',
    color: 'text-cyan-400',
  },
  {
    number: '03',
    title: 'Natural Language Processing',
    icon: faUserMd,
    description: 'Our work in NLP advances the ability of machines to understand and generate human language, improving communication with technology.',
    color: 'text-blue-400',
  },
  {
    number: '04',
    title: 'Computer Vision',
    icon: faEye,
    description: 'DeepHealth Lab focuses on algorithms that enable machines to interpret visual data, driving innovation in fields like autonomous systems and healthcare.',
    color: 'text-pink-400',
  },
  {
    number: '05',
    title: 'Human-AI Interaction (HAI)',
    icon: faUserMd,
    description: 'We design user-friendly interfaces and experiences, enhancing the way people interact with technology.',
    color: 'text-purple-400',
  },
];

export default function ResearchAreasSection() {
  return (
    <section id="research" className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-900" />

      {/* Decorative circles */}
      <div className="absolute top-40 -left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Core Research Areas
          </h2>
          <h3 className="text-2xl text-purple-400 mb-6">at DeepHealth Lab</h3>
        </motion.div>

        {/* Research Area Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {researchAreas.map((area, index) => (
            <motion.div
              key={area.number}
              className="relative glass-strong rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* Number Badge */}
              <div className="absolute top-6 right-6 text-6xl font-bold text-white/5">
                {area.number}
              </div>

              {/* Icon */}
              <div className="mb-6 relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-purple-600/20 ${area.color}`}>
                  <FontAwesomeIcon icon={area.icon} className="text-3xl" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                  {area.title}
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  {area.description}
                </p>

                {/* Learn More Link */}
                <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group/btn">
                  <span className="font-medium">Learn More</span>
                  <FontAwesomeIcon 
                    icon={faArrowRight} 
                    className="text-sm group-hover/btn:translate-x-1 transition-transform" 
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
