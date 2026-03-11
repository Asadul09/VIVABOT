// Step1Setup.jsx
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
  FaCode,
  FaProjectDiagram,
  FaCheckCircle,
  FaSpinner,
  FaArrowRight,
  FaRobot,
  FaLightbulb,
  FaTimes,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa"

import axios from 'axios'

const ServerUrl = "http://localhost:8000";

function Step1Setup({ onStart }) {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    projects: true
  });

  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    mode: "Technical"
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    } else {
      alert("Please upload a PDF file");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setResumeFile(file);
      } else {
        alert("Please upload a PDF file");
      }
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);
    setUploadProgress(0);

    const formdata = new FormData();
    formdata.append("resume", resumeFile);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formdata,
        { 
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      )

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("Resume Analysis Result:", result.data)

      const responseData = result.data;
      
      setFormData(prev => ({
        ...prev,
        role: responseData.role || prev.role,
        experience: responseData.experience || prev.experience
      }));
      
      setProjects(responseData.projects || responseData.data?.projects || []);
      setSkills(responseData.skills || responseData.data?.skills || []);
      setResumeText(responseData.resumeText || responseData.data?.resumeText || "");
      setAnalysisDone(true);

      setTimeout(() => setUploadProgress(0), 1000);

    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      console.log("Error uploading resume:", error)
      
      let errorMessage = "Failed to analyze resume. ";
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setAnalyzing(false)
    }
  }

  const handleStart = async () => {
    // Validate required fields
    if (!formData.role?.trim()) {
      alert("Please enter your target role");
      return;
    }
    if (!formData.experience?.trim()) {
      alert("Please enter your experience level");
      return;
    }

    setLoading(true)

    try {
      const requestData = {
        role: formData.role.trim(),
        experience: formData.experience.trim(),
        mode: formData.mode,
        resumeText: resumeText?.trim() || "",
        projects: Array.isArray(projects) ? projects : [],
        skills: Array.isArray(skills) ? skills : []
      };

      const result = await axios({
        method: 'post',
        url: ServerUrl + "/api/interview/generate-questions",
        data: requestData,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (userData && result.data.creditsLeft) {
        dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
      }

      // Smooth transition to interview
      setTimeout(() => {
        onStart({
          interviewId: result.data.interviewId,
          questions: result.data.questions || result.data.question || [],
          userName: result.data.userName,
          ...formData
        });
      }, 1000);

    } catch (error) {
      console.error("Start Interview Error:", error);
      
      let errorMessage = "Failed to start interview. ";
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      setLoading(false);
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getProjectName = (project) => {
    if (typeof project === 'string') return project;
    if (typeof project === 'object' && project !== null) {
      return project.title || project.name || project.projectName || "Untitled Project";
    }
    return "Untitled Project";
  }

  const getProjectDescription = (project) => {
    if (typeof project === 'string') return "";
    if (typeof project === 'object' && project !== null) {
      return project.description || project.desc || project.details || project.summary || "";
    }
    return "";
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-8'
    >
      <div className='w-full max-w-7xl bg-white rounded-3xl shadow-2xl grid lg:grid-cols-2 overflow-hidden'>
        {/* Left Panel - Welcome & Info */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-8 lg:p-12 flex flex-col justify-between'
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <FaRobot className="text-white text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-white">VivaBot AI</h1>
            </div>

            <h2 className='text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight'>
              Start Your AI-Powered Interview
            </h2>
            
            <p className='text-white/90 text-lg mb-12 leading-relaxed'>
              Practice real interview scenarios with our advanced AI. 
              Get instant feedback and improve your chances of success.
            </p>

            <div className='space-y-4'>
              {[
                { 
                  icon: <FaUserTie />, 
                  text: "Choose your role & experience",
                  gradient: "from-green-400 to-green-500"
                },
                { 
                  icon: <FaMicrophoneAlt />, 
                  text: "Smart voice-based interview",
                  gradient: "from-blue-400 to-blue-500"
                },
                { 
                  icon: <FaChartLine />, 
                  text: "Detailed performance analytics",
                  gradient: "from-purple-400 to-purple-500"
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className='flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20'
                >
                  <div className={`bg-gradient-to-r ${item.gradient} p-3 rounded-xl`}>
                    {React.cloneElement(item.icon, { className: "text-white text-xl" })}
                  </div>
                  <span className='text-white font-medium'>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative z-10 grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/20"
          >
            <div>
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-white/70 text-sm">Interviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-white/70 text-sm">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-white/70 text-sm">AI Support</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Panel - Setup Form */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='bg-white p-8 lg:p-12 overflow-y-auto max-h-[900px]'
        >
          <div className="max-w-xl mx-auto">
            <h2 className='text-3xl font-bold text-gray-800 mb-2'>
              Interview Setup
            </h2>
            <p className='text-gray-500 mb-8'>
              Fill in your details to personalize your interview experience
            </p>

            <div className='space-y-6'>
              {/* Role Input */}
              <div className='relative group'>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                <div className="relative bg-white">
                  <FaUserTie className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors' />
                  <input
                    type="text"
                    placeholder='Enter your target role (e.g., Frontend Developer)'
                    className='w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all'
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    value={formData.role}
                  />
                </div>
              </div>

              {/* Experience Input */}
              <div className='relative group'>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                <div className="relative bg-white">
                  <FaBriefcase className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors' />
                  <input
                    type="text"
                    placeholder='Years of experience (e.g., 3 years)'
                    className='w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all'
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    value={formData.experience}
                  />
                </div>
              </div>

              {/* Mode Selection */}
              <div className='relative'>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value }))}
                  className='w-full py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all appearance-none cursor-pointer bg-white'
                >
                  <option value="Technical">💻 Technical Interview</option>
                  <option value="HR">🤝 HR Interview</option>
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Resume Upload */}
              {!analysisDone && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                      relative border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer
                      transition-all duration-300 overflow-hidden
                      ${dragActive 
                        ? 'border-green-500 bg-green-50 scale-105' 
                        : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                      }
                      ${resumeFile ? 'bg-green-50 border-green-500' : ''}
                    `}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className='hidden'
                    />
                    
                    <div className="relative z-10">
                      <div className={`
                        w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center
                        transition-all duration-300
                        ${resumeFile ? 'bg-green-100' : 'bg-gray-100'}
                      `}>
                        <FaFileUpload className={`
                          text-3xl transition-all duration-300
                          ${resumeFile ? 'text-green-600' : 'text-gray-400'}
                        `} />
                      </div>
                      
                      <p className='text-gray-700 font-medium mb-2'>
                        {resumeFile ? resumeFile.name : "Upload your resume (optional)"}
                      </p>
                      <p className='text-gray-500 text-sm'>
                        {resumeFile 
                          ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Click to change`
                          : "PDF only • Drag & drop or click to browse"
                        }
                      </p>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-green-500"
                        />
                      </div>
                    )}
                  </div>

                  {resumeFile && !analysisDone && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleUploadResume}
                      disabled={analyzing}
                      className='mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                      {analyzing ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Analyzing Resume... {uploadProgress}%</span>
                        </>
                      ) : (
                        <>
                          <FaLightbulb />
                          <span>Analyze Resume with AI</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Resume Analysis Results */}
              <AnimatePresence>
                {analysisDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-4 border-2 border-green-100 rounded-2xl bg-gradient-to-br from-green-50 to-white p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-600 p-2 rounded-xl">
                          <FaCheckCircle className="text-white text-xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Resume Analysis Complete
                        </h3>
                      </div>
                      <button
                        onClick={() => setAnalysisDone(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    {/* Skills Section */}
                    {skills.length > 0 && (
                      <div className="mb-6">
                        <button
                          onClick={() => toggleSection('skills')}
                          className="w-full flex items-center justify-between text-left mb-3"
                        >
                          <div className="flex items-center gap-2">
                            <FaCode className="text-green-600" />
                            <h4 className="font-semibold text-gray-700">
                              Detected Skills
                            </h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              {skills.length}
                            </span>
                            {expandedSections.skills ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {expandedSections.skills && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-2 pt-2">
                                {skills.map((skill, idx) => (
                                  <motion.span
                                    key={idx}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="px-4 py-2 bg-white text-green-700 rounded-full text-sm font-medium shadow-sm border border-green-200 hover:shadow-md transition-shadow"
                                  >
                                    {skill}
                                  </motion.span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Projects Section */}
                    {projects.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleSection('projects')}
                          className="w-full flex items-center justify-between text-left mb-3"
                        >
                          <div className="flex items-center gap-2">
                            <FaProjectDiagram className="text-green-600" />
                            <h4 className="font-semibold text-gray-700">
                              Projects Found
                            </h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              {projects.length}
                            </span>
                            {expandedSections.projects ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedSections.projects && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 pt-2">
                                {projects.map((project, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all"
                                  >
                                    <h5 className="font-semibold text-gray-800 mb-1">
                                      {getProjectName(project)}
                                    </h5>
                                    {getProjectDescription(project) && (
                                      <p className="text-gray-600 text-sm">
                                        {getProjectDescription(project)}
                                      </p>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Start Interview Button */}
              <motion.button
                onClick={handleStart}
                disabled={!formData.role || !formData.experience || loading}
                whileHover={formData.role && formData.experience ? { scale: 1.02 } : {}}
                whileTap={formData.role && formData.experience ? { scale: 0.98 } : {}}
                className={`
                  w-full py-5 rounded-2xl text-lg font-semibold transition-all
                  flex items-center justify-center gap-3 relative overflow-hidden
                  ${formData.role && formData.experience && !loading
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl hover:from-green-700 hover:to-emerald-700' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Preparing your interview...</span>
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </>
                ) : (
                  <>
                    <span>Start Interview</span>
                    <FaArrowRight className="text-sm" />
                  </>
                )}
              </motion.button>

              {/* Helper Text */}
              <p className="text-center text-gray-400 text-sm mt-4">
                By starting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Step1Setup