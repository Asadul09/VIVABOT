import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ServerURL } from '../App'
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaChartLine, 
  FaBriefcase,
  FaUserTie,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf
} from 'react-icons/fa'
import { motion } from 'framer-motion'

function InterviewHistory() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, completed, pending
  const navigate = useNavigate()

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        setLoading(true)
        const result = await axios.get(
          ServerURL + "/api/interview/get-interview",
          { withCredentials: true }
        )
        setInterviews(result.data)
      } catch (error) {
        console.error("Error fetching interviews:", error)
      } finally {
        setLoading(false)
      }
    }
    getMyInterviews()
  }, [])

  // Filter interviews based on status
  const filteredInterviews = interviews.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available"
    
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  // Get score color
  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400'
    if (score >= 8) return 'text-emerald-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-orange-600'
  }

  // Get score background
  const getScoreBg = (score) => {
    if (!score) return 'bg-gray-100'
    if (score >= 8) return 'bg-emerald-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-orange-100'
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 py-8 px-4 sm:px-6'
    >
      <div className='max-w-5xl mx-auto'>
        {/* Header with Back Button */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className='mb-8 flex items-center gap-4 flex-wrap'
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className='p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100'
          >
            <FaArrowLeft className='text-gray-600' size={18} />
          </motion.button>
          
          <div>
            <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-emerald-700 bg-clip-text text-transparent'>
              Interview History
            </h1>
            <p className='text-gray-500 mt-1 flex items-center gap-2'>
              <FaChartLine className='text-emerald-500' />
              <span>Track your progress and performance over time</span>
            </p>
          </div>
        </motion.div>

        {/* Stats Summary */}
        {interviews.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'
          >
            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
              <p className='text-2xl font-bold text-gray-800'>{interviews.length}</p>
              <p className='text-xs text-gray-500'>Total Interviews</p>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
              <p className='text-2xl font-bold text-emerald-600'>
                {interviews.filter(i => i.status === 'completed').length}
              </p>
              <p className='text-xs text-gray-500'>Completed</p>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
              <p className='text-2xl font-bold text-yellow-600'>
                {interviews.filter(i => i.status !== 'completed').length}
              </p>
              <p className='text-xs text-gray-500'>In Progress</p>
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
              <p className='text-2xl font-bold text-blue-600'>
                {Math.round(interviews.reduce((acc, i) => acc + (i.finalScore || 0), 0) / interviews.length * 10) / 10}
              </p>
              <p className='text-xs text-gray-500'>Avg Score</p>
            </div>
          </motion.div>
        )}

        {/* Filter Tabs */}
        {interviews.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='flex gap-2 mb-6 bg-white p-1 rounded-xl inline-block shadow-sm border border-gray-100'
          >
            {['all', 'completed', 'pending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                  ${filter === tab 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {tab}
                {tab !== 'all' && (
                  <span className='ml-2 text-xs'>
                    ({interviews.filter(i => i.status === (tab === 'completed' ? 'completed' : 'pending')).length})
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100'
          >
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin' />
              <p className='text-gray-500'>Loading your interview history...</p>
            </div>
          </motion.div>
        )}

        {/* No Interviews State */}
        {!loading && filteredInterviews.length === 0 && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className='bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100'
          >
            <div className='max-w-sm mx-auto'>
              <div className='w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FaChartLine className='text-emerald-600 text-3xl' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                {filter !== 'all' 
                  ? `No ${filter} interviews found` 
                  : 'No interviews yet'}
              </h3>
              <p className='text-gray-500 mb-6'>
                {filter !== 'all'
                  ? `You don't have any ${filter} interviews at the moment.`
                  : 'Start your first AI-powered interview to track your progress.'}
              </p>
              <button
                onClick={() => navigate('/')}
                className='bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all'
              >
                Start Interview
              </button>
            </div>
          </motion.div>
        )}

        {/* Interview Cards */}
        {!loading && filteredInterviews.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='grid gap-4'
          >
            {filteredInterviews.map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => navigate(`/report/${item._id}`)}
                className='bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group'
              >
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                  {/* Left Section - Interview Details */}
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors'>
                        <FaUserTie className='text-emerald-700 text-sm' />
                      </div>
                      <h3 className='text-lg font-semibold text-gray-800'>
                        {item.role || 'Role not specified'}
                      </h3>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 ml-11'>
                      {item.experience && (
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <FaBriefcase size={12} className='text-gray-400' />
                          <span>{item.experience}</span>
                        </div>
                      )}
                      
                      {item.mode && (
                        <div className='flex items-center gap-2 text-sm'>
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs font-medium
                            ${item.mode === 'Technical' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                            }
                          `}>
                            {item.mode}
                          </span>
                        </div>
                      )}

                      <div className='flex items-center gap-2 text-sm text-gray-500'>
                        <FaCalendarAlt size={12} className='text-gray-400' />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>

                      {item.duration && (
                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                          <FaClock size={12} className='text-gray-400' />
                          <span>{item.duration} min</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Score & Status */}
                  <div className='flex items-center gap-4 ml-11 md:ml-0'>
                    {/* Score Circle */}
                    <div className='text-right'>
                      <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center
                        ${getScoreBg(item.finalScore)} 
                        ${getScoreColor(item.finalScore)}
                        font-bold text-xl shadow-sm border-2 border-white
                      `}>
                        {item.finalScore || '?'}
                      </div>
                      <p className='text-xs text-gray-500 mt-1'>Score</p>
                    </div>

                    {/* Status Badge */}
                    <div className='min-w-[100px]'>
                      <div className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg
                        ${item.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-yellow-50 text-yellow-700'
                        }
                      `}>
                        {item.status === 'completed' 
                          ? <FaCheckCircle size={14} />
                          : <FaHourglassHalf size={14} />
                        }
                        <span className='text-sm font-medium capitalize'>
                          {item.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      {/* View Details Hint */}
                      <p className='text-xs text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        Click to view full report →
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default InterviewHistory