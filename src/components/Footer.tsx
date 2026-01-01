'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faEnvelope, faMapMarkerAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faLinkedin, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';

const footerLinks = {
  product: [
    { name: 'Features', href: '#' },
    { name: 'Solutions', href: '#' },
    { name: 'Integrations', href: '#' },
    { name: 'Enterprise', href: '#' },
    { name: 'Pricing', href: '#' },
  ],
  company: [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'News', href: '#news' },
    { name: 'Media Kit', href: '#' },
    { name: 'Contact', href: '#contact' },
  ],
  resources: [
    { name: 'Blog', href: '#blog' },
    { name: 'Newsletter', href: '#' },
    { name: 'Events', href: '#' },
    { name: 'Help Center', href: '#' },
    { name: 'Tutorials', href: '#' },
  ],
  legal: [
    { name: 'Terms', href: '#terms' },
    { name: 'Privacy', href: '#privacy' },
    { name: 'Cookies', href: '#' },
    { name: 'Licenses', href: '#' },
    { name: 'Settings', href: '#' },
  ],
};

const socialLinks = [
  { icon: faTwitter, href: '#', label: 'Twitter' },
  { icon: faGithub, href: '#', label: 'GitHub' },
  { icon: faLinkedin, href: '#', label: 'LinkedIn' },
  { icon: faFacebook, href: '#', label: 'Facebook' },
  { icon: faInstagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="relative bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-16 2xl:px-24 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-50" />
                <div className="relative bg-blue-600 rounded-lg p-2.5">
                  <FontAwesomeIcon icon={faMicrochip} className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                DeepHealth <span className="text-blue-600 dark:text-blue-400">Research Lab</span>
              </h3>
            </motion.div>

            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm max-w-sm">
              Pioneering explainable AI and interpretable technology in healthcare.
              We bridge the gap between complex algorithms and clinical understanding.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 text-gray-600 dark:text-gray-400 text-sm">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <span>123 Innovation Drive, Tech City, TC 90210</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
                <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <a href="mailto:contact@deephealth.ai" className="hover:text-blue-600 transition-colors">contact@deephealth.ai</a>
              </div>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
                <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>

            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={social.icon} className="text-sm" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-2.5">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2.5">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © {new Date().getFullYear()} DeepHealth Research Lab. All Rights Reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-500 justify-center">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookies</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Licenses</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
