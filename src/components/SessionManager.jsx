'use client'

import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SessionManager() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Handle page visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading) {
        // User came back to the tab, check if session is still valid
        if (!user) {
          // Session expired, but don't redirect if on public pages
          const currentPath = window.location.pathname
          const publicRoutes = ['/', '/login', '/ai', '/ingredient-explorer', '/community', '/random']
          const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith(route))
          
          if (!isPublicRoute) {
            // Only redirect to login if on protected route
            router.push('/login')
          }
        }
      }
    }

    // Handle beforeunload to save current state
    const handleBeforeUnload = () => {
      if (user) {
        // Save current page to sessionStorage
        sessionStorage.setItem('lastVisitedPage', window.location.pathname)
      }
    }

    // Restore last visited page if user was logged in
    const restoreLastPage = () => {
      // Disabled restore logic to prevent unwanted redirects
      // This was causing users to be redirected back to dashboard after clicking Quick Actions
      if (user && !loading) {
        // Clear the stored page without restoring
        sessionStorage.removeItem('lastVisitedPage')
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Restore page after a short delay to ensure auth state is loaded
    const restoreTimer = setTimeout(restoreLastPage, 100)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearTimeout(restoreTimer)
    }
  }, [user, loading, router])

  return null // This component doesn't render anything
}

