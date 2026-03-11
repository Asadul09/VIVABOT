import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from 'react-icons/fa'
import Auth from '../pages/Auth'

function AuthModel({ onclose }) {
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    if (userData) onclose()
  }, [userData, onclose])

  return (
    <div
      className='fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4'
      onClick={onclose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='relative w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden p-6 sm:p-8'
      >
        <button
          onClick={onclose}
          className='absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 z-50'
        >
          <FaTimes size={16} />
        </button>

        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Sign in to access your premium dashboard and enjoy all features.
          </p>
        </div>

        <Auth isModel={true} />
      </div>
    </div>
  )
}

export default AuthModel