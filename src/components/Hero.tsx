'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import GridPattern from './GridPattern';
import DashboardPreview from './DashboardPreview';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section ref={containerRef} id="home" className="relative min-h-[calc(100vh-4rem)] flex items-start overflow-hidden bg-white pt-12 lg:pt-24 pb-20">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0">
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className="stroke-gray-200 [mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left Content */}
          <motion.div
            style={{ opacity }}
            className="flex-1 text-center lg:text-left pt-10 lg:pt-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Next-Gen Medical AI
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Accelerating <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Healthcare Discovery</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              We build advanced machine learning models to decode complex biological data, enabling earlier diagnosis and personalized treatment pathways.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <button className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:scale-105 transition-all flex items-center gap-2">
                  <span>Start Researching</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </Link>
              <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2">
                <FontAwesomeIcon icon={faPlayCircle} className="text-blue-500" />
                <span>View Demo</span>
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-gray-400 text-sm font-medium">
              <span>Trusted by</span>
              <div className="flex gap-6 items-center opacity-60 grayscale hover:grayscale-0 transition-all">
                <span>STANFORD MEDICINE</span>
                <span>MIT CSAIL</span>
                <span>MAYO CLINIC</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Dashboard Preview */}
          <div className="flex-1 w-full max-w-[600px] lg:max-w-none">
            <DashboardPreview />
          </div>

        </div>
      </div>
    </section>
  );
}
