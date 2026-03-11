import React from 'react'
import { BsRobot, BsGithub, BsTwitter, BsLinkedin } from 'react-icons/bs'
import { FaHeart } from 'react-icons/fa'

function Footer() {
  const currentYear = new Date().getFullYear()
  
  const socialLinks = [
    { icon: BsGithub, href: 'https://github.com/Asadul09', label: 'GitHub' },
    { icon: BsLinkedin, href: 'https://www.linkedin.com/in/a-j-asad-408839270/', label: 'LinkedIn' }
  ]

  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener noreferrer')
  }

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 px-4 pt-16 pb-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Decorative gradient line */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          <div className="py-10 px-6 sm:px-8 md:px-12">
            {/* Logo and Brand */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white p-3.5 rounded-xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <BsRobot size={22} />
                </div>
              </div>
              
              <h2 className="font-bold text-2xl md:text-3xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                VivaBot.AI
              </h2>
            </div>

            {/* Tagline */}
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed text-center">
              Ace your interviews with AI-powered feedback, smart questions, and real-time insights. 
              Join thousands of successful candidates who landed their dream jobs with VivaBot.
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-8">
              {socialLinks.map((social) => (
                <button
                  key={social.label}
                  onClick={() => handleLinkClick(social.href)}
                  className="group relative p-3 bg-gray-100 rounded-xl hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={`Follow on ${social.label}`}
                >
                  <social.icon 
                    size={20} 
                    className="text-gray-600 group-hover:text-white transition-colors duration-300" 
                  />
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6" />

            {/* Copyright */}
            <div className="text-gray-500 text-xs sm:text-sm text-center space-y-2">
              <p>
                &copy; {currentYear} VivaBot.AI. All rights reserved.
              </p>
              <p className="flex items-center justify-center gap-1">
                Designed & Developed with{' '}
                <FaHeart className="text-red-500 animate-pulse inline-block" size={12} />{' '}
                by{' '}
                <span className="font-medium text-gray-700">
                  Asadut Jaman
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer