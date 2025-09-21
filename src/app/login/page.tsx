'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { userPreferencesService } from '../../lib/supabaseService'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const { signUp, signIn } = useAuth() as any
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password)
        
        // If signup successful, create user preferences without username (will be set manually later)
        if (result.user && !result.error) {
          console.log('Creating user preferences for:', result.user.id)
          const { data, error } = await userPreferencesService.createUserPreferences(result.user.id, '')
          if (error) {
            console.error('Error creating user preferences:', error)
          } else {
            console.log('User preferences created successfully:', data)
          }
        }
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        setMessage(result.error.message)
        setMessageType('error')
      } else {
        if (isSignUp) {
          setMessage('Account created successfully! You can now sign in.')
          setMessageType('success')
          // Switch to sign in mode after successful signup
          setTimeout(() => {
            setIsSignUp(false)
            setMessage('')
          }, 2000)
        } else {
          setMessage('Successfully signed in!')
          setMessageType('success')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-base-content/70">
            {isSignUp ? 'Join ChefBot Pro community' : 'Welcome back to ChefBot Pro'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-base-content">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 input input-bordered w-full"
                placeholder="Enter your email"
              />
            </div>

            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-base-content">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 input input-bordered w-full"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {message && (
            <div className={`alert ${messageType === 'error' ? 'alert-error' : 'alert-success'}`}>
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
            
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="btn btn-outline w-full"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link href="/" className="text-sm text-primary hover:text-primary/80">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
