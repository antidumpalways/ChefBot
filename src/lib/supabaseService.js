import supabase from '../../lib/supabase'

// Saved Recipes Service
export const savedRecipesService = {
  // Get all saved recipes for a user
  async getSavedRecipes(userId) {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching saved recipes:', error)
      return { data: null, error }
    }
  },

  // Save a recipe
  async saveRecipe(userId, recipe) {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .insert([
          {
            user_id: userId,
            recipe_id: recipe.id || recipe.recipe_id || `recipe_${Date.now()}`,
            title: recipe.title || recipe.name || 'Untitled Recipe',
            description: recipe.description || '',
            image: recipe.image || recipe.imageUrl || '',
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || recipe.steps || [],
            prep_time: recipe.prepTime || recipe.prep_time || '',
            servings: recipe.servings || '',
            difficulty: recipe.difficulty || '',
            cuisine: recipe.cuisine || recipe.area || '',
            calories: recipe.calories || null,
            recipe_data: recipe // Store complete recipe object
          }
        ])
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error saving recipe:', error)
      return { data: null, error }
    }
  },

  // Remove a saved recipe
  async removeSavedRecipe(userId, recipeId) {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error removing saved recipe:', error)
      return { error }
    }
  },

  // Check if recipe is saved
  async isRecipeSaved(userId, recipeId) {
    try {
      if (!recipeId) {
        return { isSaved: false, error: null }
      }

      const { data, error } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
      return { isSaved: !!data, error: null }
    } catch (error) {
      console.error('Error checking if recipe is saved:', error)
      return { isSaved: false, error }
    }
  }
}

// Cooking History Service
export const cookingHistoryService = {
  // Get cooking history for a user
  async getCookingHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('cooking_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching cooking history:', error)
      return { data: null, error }
    }
  },

  // Add entry to cooking history
  async addCookingHistory(userId, action, recipe) {
    try {
      const { data, error } = await supabase
        .from('cooking_history')
        .insert([
          {
            user_id: userId,
            action: action, // 'viewed', 'generated', 'cooked', 'saved'
            recipe_id: recipe.id || recipe.recipe_id || `recipe_${Date.now()}`,
            recipe_title: recipe.title || recipe.name || 'Untitled Recipe',
            recipe_image: recipe.image || recipe.imageUrl || '',
            recipe_data: recipe
          }
        ])
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error adding cooking history:', error)
      return { data: null, error }
    }
  },

  // Clear cooking history
  async clearCookingHistory(userId) {
    try {
      const { error } = await supabase
        .from('cooking_history')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error clearing cooking history:', error)
      return { error }
    }
  }
}

// User Preferences Service
export const userPreferencesService = {
  // Get user preferences
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return { data: null, error }
    }
  },

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert([
          {
            user_id: userId,
            username: preferences.username,
            dietary_restrictions: preferences.dietaryRestrictions || [],
            favorite_cuisines: preferences.favoriteCuisines || [],
            skill_level: preferences.skillLevel || 'beginner',
            cooking_goals: preferences.cookingGoals || [],
            updated_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return { data: null, error }
    }
  },

  // Create user preferences with username (can be empty for manual setup later)
  async createUserPreferences(userId, username = '') {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert([
          {
            user_id: userId,
            username: username,
            dietary_restrictions: [],
            favorite_cuisines: [],
            skill_level: 'beginner',
            cooking_goals: []
          }
        ])
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error creating user preferences:', error)
      return { data: null, error }
    }
  },

  // Check if username is available
  async isUsernameAvailable(username) {
    try {
      // No character restrictions - allow any format
      if (!username || username.trim() === '') {
        return { available: false, error: null } // Empty username not allowed
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('username')
        .eq('username', username.trim())
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { available: !data, error: null }
    } catch (error) {
      console.error('Error checking username availability:', error)
      return { available: true, error: null } // Default to available on error
    }
  }
}

// Community Recipes Service
export const communityRecipesService = {
  // Get all public community recipes
  async getCommunityRecipes(limit = 10) {
    try {
      console.log('Fetching community recipes from database...');
      // Try query without is_public filter first to see all data
      const { data, error } = await supabase
        .from('community_recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      console.log('Raw database response:', { data, error });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Successfully fetched recipes:', data);
      console.log('First recipe structure:', data[0]);
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching community recipes:', error)
      return { data: null, error }
    }
  },

  // Share a recipe to community
  async shareRecipeToCommunity(userId, recipe, username) {
    try {
      const { data, error } = await supabase
        .from('community_recipes')
        .insert([
          {
            author_id: userId,
            author_username: username,
            title: recipe.title || recipe.name || 'Untitled Recipe',
            description: recipe.description || '',
            image: recipe.image || recipe.imageUrl || '',
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || recipe.steps || [],
            prep_time: recipe.prepTime || recipe.prep_time || '',
            servings: recipe.servings || '',
            difficulty: recipe.difficulty || '',
            cuisine: recipe.cuisine || recipe.area || '',
            calories: recipe.calories || null,
            tags: recipe.tags || [],
            recipe_data: recipe,
            is_public: true
          }
        ])
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error sharing recipe to community:', error)
      return { data: null, error }
    }
  },

  // Like a community recipe
  async likeRecipe(userId, recipeId) {
    try {
      const { data, error } = await supabase
        .from('community_recipe_likes')
        .insert([
          {
            user_id: userId,
            recipe_id: recipeId
          }
        ])
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error liking recipe:', error)
      return { data: null, error }
    }
  },

  // Unlike a community recipe
  async unlikeRecipe(userId, recipeId) {
    try {
      const { error } = await supabase
        .from('community_recipe_likes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error unliking recipe:', error)
      return { error }
    }
  },

  // Check if user liked a recipe
  async isRecipeLiked(userId, recipeId) {
    try {
      const { data, error } = await supabase
        .from('community_recipe_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { isLiked: !!data, error: null }
    } catch (error) {
      console.error('Error checking if recipe is liked:', error)
      return { isLiked: false, error }
    }
  }
}
