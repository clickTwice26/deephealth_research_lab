'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

const footerLinks = {
  lab: [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'News', href: '#news' },
  ],
  team: [
    { name: 'Our Team', href: '#team' },
    { name: 'Our Collaborators', href: '#collaborators' },
    { name: 'Open Positions', href: '#positions' },
  ],
  resources: [
    { name: 'Publications', href: '#publications' },
    { name: 'Projects', href: '#projects' },
    { name: 'Blog', href: '#blog' },
  ],
  others: [
    { name: 'Contact', href: '#contact' },
    { name: 'Terms & Conditions', href: '#terms' },
    { name: 'Privacy Policy', href: '#privacy' },
  ],
};

const socialLinks = [
  { icon: faFacebook, href: '#', label: 'Facebook' },
  { icon: faTwitter, href: '#', label: 'Twitter' },
  { icon: faLinkedin, href: '#', label: 'LinkedIn' },
  { icon: faGithub, href: '#', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-50" />
                <div className="relative bg-blue-600 rounded-lg p-2.5">
                  <FontAwesomeIcon icon={faMicrochip} className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">
                DeepHealth<span className="text-cyan-400"> Research Lab</span>
              </h3>
            </motion.div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              DeepHealth Lab - Explainable LLM and Interpretable Technology Ensemble Lab
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-500/60 flex items-center justify-center text-blue-400 transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={social.icon} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Lab Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Lab</h4>
            <ul className="space-y-3">
              {footerLinks.lab.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Team Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Team</h4>
            <ul className="space-y-3">
              {footerLinks.team.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Others Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Others</h4>
            <ul className="space-y-3">
              {footerLinks.others.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-blue-500/20">
          <p className="text-center text-gray-400 text-sm">
            Copyright © 2025 DeepHealth Lab AI LLC. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
