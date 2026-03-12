import React, { useState } from 'react'
import { FaArrowLeft, FaCheck } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react";

function Pricing() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState("free");

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "0tk",
      credits: 200,
      description: "Perfect for beginners starting interview.",
      features: [
        "200 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "starter",
      name: "Starter Pack",
      price: "199tk",
      credits: 500,
      description: "Great for regular interview practice.",
      features: [
        "500 AI Interview Credits",
        "Detailed Performance Report",
        "Voice Interview Access",
        "Full Interview History",
        "Resume Based Questions",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "499tk",
      credits: 1500,
      description: "Best for serious job preparation.",
      features: [
        "1500 AI Interview Credits",
        "Advanced AI Performance Analytics",
        "Unlimited Voice Interviews",
        "Complete Interview History",
        "Resume Based Smart Questions",
        "Priority AI Evaluation",
      ],
      badge: "Most Popular",
    },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 py-16 px-6'>

      {/* Header */}
      <div className='max-w-6xl mx-auto mb-16 flex items-start gap-4'>
        <button
          onClick={() => navigate("/")}
          className='mt-2 p-3 rounded-full bg-white shadow hover:shadow-lg transition'
        >
          <FaArrowLeft className='text-gray-600' />
        </button>

        <div className='text-center w-full'>
          <h1 className='text-4xl font-bold text-gray-900'>
            Choose Your Plan
          </h1>
          <p className='text-gray-500 mt-3 text-lg'>
            Flexible pricing designed for your interview preparation journey.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto'>

        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id

          return (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.05, y: -4 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`
                relative rounded-3xl p-10 transition-all duration-300 border
                shadow-lg hover:shadow-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/50
                backdrop-blur-md
                ${isSelected ? "border-emerald-500 shadow-2xl" : "border-gray-200"}
                ${plan.id === "pro" ? "ring-2 ring-emerald-500" : ""}
                cursor-pointer
              `}
            >

              {/* Badge */}
              {plan.badge && (
                <span className='absolute -top-4 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow-lg animate-pulse'>
                  {plan.badge}
                </span>
              )}

              {/* Default Tag */}
              {plan.default && (
                <span className='absolute -top-4 left-6 bg-gray-200 text-gray-700 text-xs px-4 py-1 rounded-full'>
                  Default
                </span>
              )}

              {/* Plan Name */}
              <h2 className='text-2xl font-semibold text-gray-900'>
                {plan.name}
              </h2>

              {/* Price */}
              <p className='text-4xl font-bold mt-3 text-gray-900'>
                {plan.price}
              </p>

              {/* Credits */}
              <p className='text-emerald-600 font-semibold mt-2'>
                {plan.credits} Credits
              </p>

              {/* Description */}
              <p className='text-gray-500 text-sm mt-4'>
                {plan.description}
              </p>

              {/* Features */}
              <ul className='mt-8 space-y-3 text-gray-700'>
                {plan.features.map((feature, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-center gap-2"
                    whileHover={{ x: 2 }}
                  >
                    <FaCheck className='text-emerald-500 text-xs' />
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                className={`
                  w-full mt-10 py-3 rounded-xl font-semibold transition
                  ${isSelected
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {isSelected ? "Selected Plan" : "Choose Plan"}
              </motion.button>

            </motion.div>
          )
        })}

      </div>
    </div>
  )
}

export default Pricing
