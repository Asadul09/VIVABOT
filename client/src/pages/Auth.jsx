import React from 'react'
import { BsRobot } from 'react-icons/bs'
import { IoSparkles } from 'react-icons/io5'
import { FcGoogle } from 'react-icons/fc'
import { motion } from 'motion/react'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../Utils/firebase'
import axios from 'axios'
import { ServerURL } from '../App'
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import AuthModel from '../components/AuthModel'

function Auth({isModel = false}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const { displayName: name, email } = response.user;

      // Step 1: Authenticate with backend and set cookie
      await axios.post(ServerURL + '/api/auth/google', { name, email }, { withCredentials: true });

      // Step 2: Fetch current user with credits
      const currentUser = await axios.get(ServerURL + '/api/user/current-user', { withCredentials: true });

      // Step 3: Update Redux
      dispatch(setUserData(currentUser.data));

      // Step 4: Navigate to home
      navigate('/');
    } catch (error) {
      console.error("Error signing in with Google:", error);
      dispatch(setUserData(null));
    }
  }

  return (
    <div className={`w-full
       ${isModel ? "p-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20" }
      `}>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05, delay: 0.2 }}
        className={`w-full 
          ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
          bg-white shadow-2xl border border-gray-200 `}
      >
        <div className='flex items-center justify-center gap-3 mb-6'>
          <div className='bg-black text-white p-2 rounded-lg'>
            <BsRobot size={18} />
          </div>
          <h2 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>VivaBot.AI</h2>
        </div>

        <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
          Continue with{" "}
          <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
          Sign in to start your AI-powered interview preparation journey and unlock your full potential!
        </p>

        <motion.button
          onClick={handleGoogleSignIn}
          whileHover={{ opacity: 0.7, scale: 1.03 }}
          whileTap={{ opacity: 1, scale: 0.9 }}
          className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md'
        >
          <FcGoogle size={20} />
          Continue with Google
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Auth;