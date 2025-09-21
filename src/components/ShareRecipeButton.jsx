'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { communityRecipesService, userPreferencesService } from '../lib/supabaseService'

export default function ShareRecipeButton({ 
  recipe, 
  className = '', 
  showText = true,
  onShare = () => {}
}) {
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(false)
  const { user } = useAuth()

  const handleShare = async () => {
    console.log('ShareRecipeButton clicked - sharing to community!')
    if (!user) {
      alert('Please sign in to share recipes to the community!')
      return
    }

    setSharing(true)

    try {
      // Get user preferences to get username
      const { data: userPrefs } = await userPreferencesService.getUserPreferences(user.id)
      console.log('User preferences:', userPrefs)

      if (!userPrefs?.username || userPrefs.username.trim() === '') {
        alert('Please set your username in dashboard before sharing recipes!')
        setSharing(false)
        return
      }

      // Share recipe to community
      const { data, error } = await communityRecipesService.shareRecipeToCommunity(
        user.id,
        recipe,
        userPrefs.username
      )

      if (error) {
        throw error
      }

      setShared(true)
      setTimeout(() => setShared(false), 3000)
      onShare()
    } catch (error) {
      console.error('Error sharing recipe to community:', error)
      alert('Failed to share recipe to community. Please try again.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="relative">
      <button 
        className={`btn btn-secondary btn-sm ${className} ${sharing ? 'loading' : ''}`}
        onClick={handleShare}
        disabled={sharing}
      >
        {shared ? (
          <>
            ✅ Shared!
          </>
        ) : sharing ? (
          <>
            {showText && 'Sharing...'}
          </>
        ) : (
          <>
            🌐 {showText && 'Share to Community'}
          </>
        )}
      </button>
      
      {shared && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-base-200 text-xs px-2 py-1 rounded shadow-lg">
          Recipe shared to community!
        </div>
      )}
    </div>
  )
}

