import supabase from '../../lib/supabase'

// Community Recipes Service
export const communityService = {
  // Get all public community recipes
  async getCommunityRecipes(limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('community_recipes')
        .select(`
          *,
          author:author_id
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching community recipes:', error)
      return { data: null, error }
    }
  },

  // Get community recipe by ID
  async getCommunityRecipeById(recipeId) {
    try {
      const { data, error } = await supabase
        .from('community_recipes')
        .select(`
          *,
          author:author_id
        `)
        .eq('id', recipeId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching community recipe:', error)
      return { data: null, error }
    }
  },

  // Create a new community recipe
  async createCommunityRecipe(userId, recipe) {
    try {
      const { data, error } = await supabase
        .from('community_recipes')
        .insert([
          {
            author_id: userId,
            title: recipe.title,
            description: recipe.description,
            image: recipe.image,
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || [],
            prep_time: recipe.prepTime,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            cuisine: recipe.cuisine,
            calories: recipe.calories,
            tags: recipe.tags || [],
            recipe_data: recipe,
            is_public: recipe.isPublic !== false // Default to public
          }
        ])
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error creating community recipe:', error)
      return { data: null, error }
    }
  },

  // Update community recipe
  async updateCommunityRecipe(userId, recipeId, updates) {
    try {
      const { data, error } = await supabase
        .from('community_recipes')
        .update(updates)
        .eq('id', recipeId)
        .eq('author_id', userId) // Ensure user owns the recipe
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error updating community recipe:', error)
      return { data: null, error }
    }
  },

  // Delete community recipe
  async deleteCommunityRecipe(userId, recipeId) {
    try {
      const { error } = await supabase
        .from('community_recipes')
        .delete()
        .eq('id', recipeId)
        .eq('author_id', userId) // Ensure user owns the recipe

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting community recipe:', error)
      return { error }
    }
  },

  // Like/Unlike a community recipe
  async toggleLike(userId, recipeId) {
    try {
      // Check if user already liked the recipe
      const { data: existingLike, error: checkError } = await supabase
        .from('community_recipe_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      if (existingLike) {
        // Unlike the recipe
        const { error: deleteError } = await supabase
          .from('community_recipe_likes')
          .delete()
          .eq('user_id', userId)
          .eq('recipe_id', recipeId)

        if (deleteError) throw deleteError

        // Decrease likes count
        const { error: updateError } = await supabase
          .from('community_recipes')
          .update({ likes_count: supabase.raw('likes_count - 1') })
          .eq('id', recipeId)

        if (updateError) throw updateError

        return { liked: false, error: null }
      } else {
        // Like the recipe
        const { error: insertError } = await supabase
          .from('community_recipe_likes')
          .insert([{ user_id: userId, recipe_id: recipeId }])

        if (insertError) throw insertError

        // Increase likes count
        const { error: updateError } = await supabase
          .from('community_recipes')
          .update({ likes_count: supabase.raw('likes_count + 1') })
          .eq('id', recipeId)

        if (updateError) throw updateError

        return { liked: true, error: null }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      return { liked: null, error }
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
  },

  // Increment view count
  async incrementViewCount(recipeId) {
    try {
      const { error } = await supabase
        .from('community_recipes')
        .update({ views_count: supabase.raw('views_count + 1') })
        .eq('id', recipeId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error incrementing view count:', error)
      return { error }
    }
  },

  // Search community recipes
  async searchCommunityRecipes(query, filters = {}) {
    try {
      let queryBuilder = supabase
        .from('community_recipes')
        .select('*')
        .eq('is_public', true)

      // Text search
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      }

      // Apply filters
      if (filters.cuisine) {
        queryBuilder = queryBuilder.eq('cuisine', filters.cuisine)
      }

      if (filters.difficulty) {
        queryBuilder = queryBuilder.eq('difficulty', filters.difficulty)
      }

      if (filters.minPrepTime) {
        queryBuilder = queryBuilder.gte('prep_time', filters.minPrepTime)
      }

      // Order by
      const orderBy = filters.orderBy || 'created_at'
      const ascending = filters.ascending !== false
      queryBuilder = queryBuilder.order(orderBy, { ascending })

      const { data, error } = await queryBuilder

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error searching community recipes:', error)
      return { data: null, error }
    }
  }
}

// User Collections Service
export const collectionsService = {
  // Get user collections
  async getUserCollections(userId) {
    try {
      const { data, error } = await supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user collections:', error)
      return { data: null, error }
    }
  },

  // Create a new collection
  async createCollection(userId, name, description = '') {
    try {
      const { data, error } = await supabase
        .from('user_collections')
        .insert([
          {
            user_id: userId,
            name,
            description,
            is_public: false
          }
        ])
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error creating collection:', error)
      return { data: null, error }
    }
  },

  // Add recipe to collection
  async addRecipeToCollection(collectionId, recipeId, recipeType = 'community') {
    try {
      const { data, error } = await supabase
        .from('collection_recipes')
        .insert([
          {
            collection_id: collectionId,
            recipe_id: recipeId,
            recipe_type: recipeType
          }
        ])
        .select()

      if (error) throw error
      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error adding recipe to collection:', error)
      return { data: null, error }
    }
  },

  // Remove recipe from collection
  async removeRecipeFromCollection(collectionId, recipeId) {
    try {
      const { error } = await supabase
        .from('collection_recipes')
        .delete()
        .eq('collection_id', collectionId)
        .eq('recipe_id', recipeId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error removing recipe from collection:', error)
      return { error }
    }
  }
}


