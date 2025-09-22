import { useAuth } from '../contexts/AuthContext'
import { cookingHistoryService } from '../lib/supabaseService'

export const useCookingHistory = () => {
  const { user } = useAuth()

  const trackAction = async (action, recipe) => {
    if (!user || !recipe) return

    try {
      await cookingHistoryService.addCookingHistory(user.id, action, recipe)
    } catch (error) {
      console.error('Error tracking cooking history:', error)
    }
  }

  const trackRecipeView = (recipe) => {
    trackAction('viewed', recipe)
  }

  const trackRecipeGeneration = (recipe) => {
    trackAction('generated', recipe)
  }

  const trackRecipeCooked = (recipe) => {
    trackAction('cooked', recipe)
  }

  const trackRecipeSaved = (recipe) => {
    trackAction('saved', recipe)
  }

  return {
    trackRecipeView,
    trackRecipeGeneration,
    trackRecipeCooked,
    trackRecipeSaved,
    trackAction
  }
}


