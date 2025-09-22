'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { savedRecipesService, cookingHistoryService } from '../lib/supabaseService'

export default function SaveRecipeButton({ 
  recipe, 
  className = '', 
  showText = true,
  onSave = () => {},
  onRemove = () => {}
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save recipes')
      return
    }

    if (!recipe) {
      setError('No recipe to save')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check if already saved
      const { isSaved: alreadySaved } = await savedRecipesService.isRecipeSaved(user.id, recipe.id || recipe.recipe_id)
      
      if (alreadySaved) {
        // Remove from saved
        const { error: removeError } = await savedRecipesService.removeSavedRecipe(user.id, recipe.id || recipe.recipe_id)
        
        if (removeError) throw removeError
        
        setIsSaved(false)
        onRemove()
      } else {
        // Save recipe
        const { error: saveError } = await savedRecipesService.saveRecipe(user.id, recipe)
        
        if (saveError) throw saveError
        
        setIsSaved(true)
        onSave()
        
        // Add to cooking history
        await cookingHistoryService.addCookingHistory(user.id, 'saved', recipe)
      }
    } catch (err) {
      console.error('Error saving/removing recipe:', err)
      setError(err.message || 'Failed to save recipe')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <button 
        className={`btn btn-outline btn-sm ${className}`}
        onClick={() => alert('Please sign in to save recipes')}
      >
        {showText && '💾 Save Recipe'}
        {!showText && '💾'}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button 
        className={`btn btn-sm ${isSaved ? 'btn-error' : 'btn-primary'} ${className}`}
        onClick={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <>
            {isSaved ? '🗑️ Remove' : '💾 Save'}
            {showText && (isSaved ? ' Recipe' : ' Recipe')}
          </>
        )}
      </button>
      
      {error && (
        <span className="text-xs text-error">{error}</span>
      )}
    </div>
  )
}


