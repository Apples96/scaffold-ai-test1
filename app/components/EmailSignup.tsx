'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, CheckCircle } from 'lucide-react'

export default function EmailSignup() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setEmail('')
      } else {
        const data = await response.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 rounded-xl p-8 border border-white/10 max-w-md mx-auto"
      >
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">Thank you!</h3>
        <p className="text-white/70 text-center">
          You've been added to our waitlist. We'll notify you when we launch.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="w-full bg-white/5 border border-white/20 rounded-lg py-4 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-200"
          />
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm text-center"
          >
            {error}
          </motion.p>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              <span>Joining...</span>
            </>
          ) : (
            <>
              <span>Join Waitlist</span>
              <Send className="h-5 w-5" />
            </>
          )}
        </button>
        
        <p className="text-xs text-white/50 text-center">
          No spam, ever. Unsubscribe at any time.
        </p>
      </form>
    </motion.div>
  )
} 