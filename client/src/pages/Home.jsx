import React from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import AuthModel from "../components/AuthModel";
import {
  BsBarChart,
  BsClock,
  BsFileEarmark,
  BsMic,
  BsRobot,
  BsArrowRight,
  BsStars,
  BsGraphUp,
  BsPersonWorkspace,
  BsShieldCheck,
  BsLightbulb
} from "react-icons/bs";

import HrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from "../components/Footer";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = React.useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!userData) return setShowAuth(true);
    navigate("/interview");
  };

  const handleViewHistory = () => {
    if (!userData) return setShowAuth(true);
    navigate("/history");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col relative">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 text-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <HiSparkles size={16} className="text-green-600" />
              <span className="font-medium">AI-Powered</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Smart Interview Platform</span>
            </div>
          </motion.div>

          {/* Hero Section */}
          <div className="text-center mb-24 lg:mb-32">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto"
            >
              Practice with{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-1 sm:py-2 rounded-full">
                  VivaBot
                </span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-600 mt-6 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed"
            >
              Ace your interviews with AI-powered feedback, smart questions, and real-time insights. 
              Join thousands of successful candidates who landed their dream jobs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mt-10"
            >
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <BsArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <motion.button
                onClick={handleViewHistory}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-gray-700 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-300"
              >
                View History
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap justify-center gap-8 mt-16"
            >
              {[
                { value: "10K+", label: "Active Users" },
                { value: "50K+", label: "Interviews Completed" },
                { value: "95%", label: "Success Rate" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Steps Section */}
          <div className="mb-32">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-center mb-16"
            >
              How It{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 rounded-full">
                Works
              </span>
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (desktop only) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200 transform -translate-y-1/2" />
              
              {[
                {
                  icon: <BsRobot size={28} />,
                  step: "Step 01",
                  title: "Choose Your Role",
                  desc: "Select your target job role and experience level. AI adjusts difficulty accordingly.",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: <BsMic size={28} />,
                  step: "Step 02",
                  title: "Start Interview",
                  desc: "Answer voice-based questions with real-time feedback and dynamic follow-ups.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <BsClock size={28} />,
                  step: "Step 03",
                  title: "Get Insights",
                  desc: "Receive detailed analytics, scores, and improvement suggestions instantly.",
                  color: "from-purple-500 to-pink-500"
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 z-10"
                >
                  <div className={`absolute -top-4 left-8 bg-gradient-to-r ${item.color} text-white p-4 rounded-2xl shadow-lg`}>
                    {item.icon}
                  </div>
                  
                  <div className="mt-12">
                    <div className="text-sm font-semibold text-gray-400 mb-2">{item.step}</div>
                    <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>

                  {/* Progress indicator */}
                  <div className="absolute bottom-4 right-4 text-4xl font-bold text-gray-100">
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Grid - Why VivaBot */}
          <div className="mb-32">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-center mb-16"
            >
              Why Choose{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 rounded-full">
                VivaBot
              </span>
            </motion.h2>

            <div className="grid lg:grid-cols-2 gap-8">
              {[
                {
                  image: evalImg,
                  icon: <BsGraphUp size={24} />,
                  title: "AI-Powered Evaluation",
                  desc: "Advanced algorithms analyze your responses for technical accuracy, communication skills, and confidence levels.",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  image: resumeImg,
                  icon: <BsPersonWorkspace size={24} />,
                  title: "Resume-Based Questions",
                  desc: "Personalized questions generated from your resume to simulate real interview scenarios.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  image: pdfImg,
                  icon: <BsFileEarmark size={24} />,
                  title: "Comprehensive Reports",
                  desc: "Get detailed PDF reports with strengths, weaknesses, and actionable improvement tips.",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  image: analyticsImg,
                  icon: <BsBarChart size={24} />,
                  title: "Performance Analytics",
                  desc: "Track your progress over time with detailed metrics and visual insights.",
                  color: "from-orange-500 to-red-500"
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-2/5">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl blur-lg opacity-20`} />
                        <img
                          src={item.image}
                          alt={item.title}
                          className="relative w-full h-auto object-contain rounded-2xl"
                        />
                      </div>
                    </div>

                    <div className="w-full md:w-3/5">
                      <div className={`inline-flex bg-gradient-to-r ${item.color} text-white p-3 rounded-xl mb-4`}>
                        {item.icon}
                      </div>
                      <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Modes Section */}
          <div className="mb-32">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-center mb-16"
            >
              Interview{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 rounded-full">
                Modes
              </span>
            </motion.h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  img: HrImg,
                  title: "HR Interview",
                  desc: "Master behavioral questions and communication skills",
                  icon: <BsPersonWorkspace size={20} />,
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  img: techImg,
                  title: "Technical Mode",
                  desc: "Deep-dive into role-specific technical questions",
                  icon: <BsRobot size={20} />,
                  color: "from-purple-500 to-pink-500"
                },
                {
                  img: confidenceImg,
                  title: "Confidence Analysis",
                  desc: "Voice and tone analysis for better presentation",
                  icon: <BsShieldCheck size={20} />,
                  color: "from-green-500 to-emerald-500"
                },
                {
                  img: creditImg,
                  title: "Credit System",
                  desc: "Flexible plans for unlimited practice sessions",
                  icon: <BsStars size={20} />,
                  color: "from-orange-500 to-red-500"
                }
              ].map((mode, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${mode.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {mode.icon}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2">{mode.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{mode.desc}</p>
                    
                    <div className="w-20 h-20 mt-2">
                      <img 
                        src={mode.img} 
                        alt={mode.title} 
                        className="w-full h-full object-contain opacity-75 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of successful candidates who transformed their interview skills with VivaBot.
            </p>
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              Start Practicing Now
              <BsArrowRight />
            </motion.button>
          </motion.div>
        </div>
      </main>

      {showAuth && <AuthModel onclose={() => setShowAuth(false)} isOpen={showAuth} />}
      <Footer />
    </div>
  );
}

export default Home;