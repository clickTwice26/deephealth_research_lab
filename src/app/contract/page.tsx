'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileContract,
  faCode,
  faServer,
  faDatabase,
  faClock,
  faDollarSign,
  faCheckCircle,
  faCloud,
  faBolt,
  faShieldAlt,
  faTools,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';

export default function ContractPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const technicalStack = [
    {
      category: 'Frontend',
      icon: faCode,
      color: 'text-blue-400',
      technologies: [
        'Next.js 14.2.0 (React Framework)',
        'TypeScript for type safety',
        'Tailwind CSS for styling',
        'Framer Motion for animations',
        'Three.js for 3D graphics',
        'GSAP for advanced animations',
      ],
    },
    {
      category: 'Backend',
      icon: faServer,
      color: 'text-cyan-400',
      technologies: [
        'FastAPI (Python)',
        'RESTful API architecture',
        'JWT Authentication',
        'API rate limiting',
        'Automated API documentation',
      ],
    },
    {
      category: 'Database & Storage',
      icon: faDatabase,
      color: 'text-teal-400',
      technologies: [
        'PostgreSQL (Primary Database)',
        'Redis (Caching Layer)',
        'AWS S3 (File Storage)',
        'Database migrations & backups',
      ],
    },
    {
      category: 'Infrastructure',
      icon: faCloud,
      color: 'text-blue-500',
      technologies: [
        'AWS Cloud Infrastructure',
        'Docker containerization',
        'CI/CD pipeline',
        'SSL/TLS encryption',
        'CDN for static assets',
      ],
    },
  ];

  const projectTimeline = [
    {
      phase: 'Week 1: Design & Setup',
      duration: '3 days',
      deliverables: [
        'Website design mockups for your review',
        'Layout and color scheme finalization',
        'Initial setup and planning',
      ],
    },
    {
      phase: 'Week 2: Building Your Website',
      duration: '7 days',
      deliverables: [
        'All website pages created',
        'Interactive animations added',
        'Mobile-friendly design',
        'Admin panel for easy content updates',
      ],
    },
    {
      phase: 'Final Week: Testing & Launch',
      duration: '5 days',
      deliverables: [
        'Complete testing on all devices',
        'Making website live on internet',
        'Training on how to use admin panel',
        'Final handover with documentation',
      ],
    },
  ];

  const costBreakdown = [
    {
      item: 'Initial Development',
      description: 'Complete website development (Frontend + Backend)',
      cost: 20000,
      type: 'one-time',
    },
    {
      item: 'Server Hosting',
      description: 'AWS Server (EC2) hosting with S3 storage',
      cost: 400,
      type: 'monthly',
    },
  ];

  const features = [
    'Fully responsive design across all devices',
    'Modern 3D animations and interactions',
    'Complete Backend Control System',
    'OAuth2 secure login system',
    'Navbar management from backend (add/edit/remove menu items)',
    'News management - Create, Edit, Delete from admin panel',
    'Publications management - Add, Update, Remove publications',
    'Project showcase - Full CRUD control from backend',
    'Newsletter subscription with database storage',
    'Research areas - Manage content dynamically',
    'Contact form with email notifications',
    'Admin dashboard for complete website control',
    'User authentication and role management',
    'SEO optimization',
    'Performance optimization',
    'Automated database backups',
  ];

  const monthlyTotal = costBreakdown
    .filter((item) => item.type === 'monthly')
    .reduce((sum, item) => sum + item.cost, 0);

  const yearlyTotal = costBreakdown
    .filter((item) => item.type === 'yearly')
    .reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 mb-4">
              <FontAwesomeIcon icon={faFileContract} className="text-3xl text-blue-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Project Contract
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              DeepHealth Research Lab Website Development - Complete Technical Specification & Cost Breakdown (BDT)
            </p>
          </motion.div>

          {/* Demo Preview Link */}
          <motion.div
            variants={itemVariants}
            className="glass-strong rounded-xl p-5 border border-cyan-500/40 mb-8 bg-gradient-to-r from-cyan-600/10 to-blue-600/10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Preview the Website Demo</h3>
                <p className="text-sm text-gray-400">See the live demo of your website before final delivery</p>
              </div>
              <a
                href="/"
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold text-white text-sm transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
              >
                View Demo
                <FontAwesomeIcon icon={faCheckCircle} />
              </a>
            </div>
          </motion.div>

          {/* Project Overview */}
          <motion.div
            variants={itemVariants}
            className="glass-strong rounded-xl p-6 border border-blue-500/30 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} className="text-blue-400" />
              Project Overview
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              This contract outlines the development, deployment, and handover of the DeepHealth Research Lab website.
              The project includes a modern, responsive frontend built with Next.js and a robust backend powered by FastAPI,
              with complete control over all website functionality through the backend system. The project will be completed and handed over within 15 days.
            </p>
            <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faShieldAlt} className="text-green-400 text-xl mt-1" />
                <div>
                  <h3 className="text-base font-bold text-green-400 mb-2">6 Months Free Maintenance Support</h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-2">
                    After project delivery, you will receive <strong>6 months of free maintenance support</strong> which includes:
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1 ml-4">
                    <li>• Bug fixes and error resolution</li>
                    <li>• Security patches and updates</li>
                    <li>• Performance optimization</li>
                    <li>• Technical support for existing features</li>
                    <li>• Server and database maintenance</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-3 italic">
                    Note: Building new features or major functionality changes are not included in the maintenance period and will be quoted separately.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                <FontAwesomeIcon icon={faClock} className="text-xl text-blue-400 mb-2" />
                <div className="text-xs text-gray-400 mb-1">Total Duration</div>
                <div className="text-lg font-bold text-white">15 Days</div>
              </div>
              <div className="bg-cyan-600/10 rounded-lg p-4 border border-cyan-500/20">
                <FontAwesomeIcon icon={faDollarSign} className="text-xl text-cyan-400 mb-2" />
                <div className="text-xs text-gray-400 mb-1">Development Cost</div>
                <div className="text-lg font-bold text-white">৳20,000</div>
              </div>
              <div className="bg-teal-600/10 rounded-lg p-4 border border-teal-500/20">
                <FontAwesomeIcon icon={faTools} className="text-xl text-teal-400 mb-2" />
                <div className="text-xs text-gray-400 mb-1">Monthly Server Cost</div>
                <div className="text-lg font-bold text-white">৳{monthlyTotal}</div>
              </div>
            </div>
          </motion.div>

          {/* Technical Stack */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faCode} className="text-blue-400" />
              Technical Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technicalStack.map((stack) => (
                <div
                  key={stack.category}
                  className="glass-strong rounded-xl p-5 border border-blue-500/30"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FontAwesomeIcon icon={stack.icon} className={`text-2xl ${stack.color}`} />
                    <h3 className="text-lg font-bold text-white">{stack.category}</h3>
                  </div>
                  <ul className="space-y-2">
                    {stack.technologies.map((tech) => (
                      <li key={tech} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Project Timeline */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-400" />
              Development Timeline
            </h2>
            <div className="space-y-4">
              {projectTimeline.map((phase, index) => (
                <div
                  key={phase.phase}
                  className="glass-strong rounded-xl p-5 border border-blue-500/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-400">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                        <h3 className="text-base font-bold text-white">{phase.phase}</h3>
                        <span className="text-xs text-cyan-400 font-semibold">{phase.duration}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {phase.deliverables.map((deliverable) => (
                          <div key={deliverable} className="flex items-start gap-2">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-xs text-green-400 mt-1"
                            />
                            <span className="text-xs text-gray-300">{deliverable}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cost Breakdown */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faDollarSign} className="text-blue-400" />
              Cost Breakdown
            </h2>
            
            {/* Development Cost */}
            <div className="glass-strong rounded-xl p-5 border border-blue-500/30 mb-4">
              <h3 className="text-lg font-bold text-white mb-4">One-Time Development Cost</h3>
              {costBreakdown
                .filter((item) => item.type === 'one-time')
                .map((item) => (
                  <div key={item.item} className="bg-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-base font-bold text-white">{item.item}</h4>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>
                      <div className="text-xl font-bold text-blue-400">৳{item.cost.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Recurring Costs */}
            <div className="glass-strong rounded-xl p-5 border border-blue-500/30 mb-4">
              <h3 className="text-lg font-bold text-white mb-4">Monthly Recurring Costs</h3>
              <div className="space-y-3">
                {costBreakdown
                  .filter((item) => item.type === 'monthly')
                  .map((item) => (
                    <div
                      key={item.item}
                      className="flex justify-between items-start p-3 bg-cyan-600/5 rounded-lg border border-cyan-500/10"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.item}</h4>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>
                      <div className="text-base font-bold text-cyan-400">৳{item.cost}/mo</div>
                    </div>
                  ))}
                <div className="pt-3 border-t border-blue-500/20 flex justify-between items-center">
                  <span className="text-base font-bold text-white">Total Monthly Cost</span>
                  <span className="text-xl font-bold text-cyan-400">৳{monthlyTotal}/mo</span>
                </div>
              </div>
            </div>


          </motion.div>

          {/* Features Included */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldAlt} className="text-blue-400" />
              Features Included
            </h2>
            <div className="glass-strong rounded-xl p-5 border border-blue-500/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-400 mt-1 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Cost Summary */}
          <motion.div variants={itemVariants}>
            <div className="glass-strong rounded-xl p-6 border border-blue-500/30 bg-gradient-to-br from-blue-600/10 to-cyan-600/10">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Investment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-blue-500/20">
                  <div className="text-xs text-gray-400 mb-2">Development Cost</div>
                  <div className="text-2xl font-bold text-blue-400">৳20,000</div>
                  <div className="text-xs text-gray-500 mt-1">One-time payment</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-cyan-500/20">
                  <div className="text-xs text-gray-400 mb-2">Monthly Server Cost</div>
                  <div className="text-2xl font-bold text-cyan-400">৳{monthlyTotal}</div>
                  <div className="text-xs text-gray-500 mt-1">Recurring monthly</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-teal-500/20">
                  <div className="text-xs text-gray-400 mb-2">Project Handover</div>
                  <div className="text-2xl font-bold text-teal-400">15 Days</div>
                  <div className="text-xs text-gray-500 mt-1">Complete delivery</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
