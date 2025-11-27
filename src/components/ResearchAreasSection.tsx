'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faRobot, faEye, faUserMd, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import CardSwap, { Card } from './CardSwap';

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
    <section id="research" className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-900" />

      {/* Decorative circles */}
      <div className="absolute top-40 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Core Research Areas
          </h2>
          <h3 className="text-lg text-cyan-400 mb-4">at DeepHealth Lab</h3>
        </motion.div>

        {/* Card Swap Container */}
        <div className="flex justify-center items-center" style={{ minHeight: '500px' }}>
          <CardSwap
            width={450}
            height={360}
            cardDistance={35}
            verticalDistance={45}
            delay={4000}
            pauseOnHover={true}
            easing="elastic"
            skewAmount={4}
          >
            {researchAreas.map((area) => (
              <Card key={area.number}>
                <div className="relative w-full h-full p-6 flex flex-col bg-gradient-to-br from-gray-900 to-gray-950">
                  {/* Number Badge */}
                  <div className="absolute top-6 right-8 text-7xl font-bold text-white/5">
                    {area.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 relative z-10">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/30 ${area.color}`}>
                      <FontAwesomeIcon icon={area.icon} className="text-2xl" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {area.title}
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed mb-4 flex-1">
                      {area.description}
                    </p>

                    {/* Learn More Link */}
                    <button className="flex items-center gap-2 text-blue-400 hover:text-cyan-400 transition-colors group/btn self-start">
                      <span className="font-semibold">Learn More</span>
                      <FontAwesomeIcon 
                        icon={faArrowRight} 
                        className="text-sm group-hover/btn:translate-x-1 transition-transform" 
                      />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </div>
    </section>
  );
}
