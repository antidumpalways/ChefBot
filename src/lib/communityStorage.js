// Community recipes storage utilities
export const communityStorage = {
  // Get all community recipes
  getRecipes: () => {
    if (typeof window === 'undefined') return [];
    try {
      const recipes = localStorage.getItem('communityRecipes');
      return recipes ? JSON.parse(recipes) : [];
    } catch (error) {
      console.error('Error getting community recipes:', error);
      return [];
    }
  },

  // Save a recipe to community
  saveRecipe: (recipe) => {
    if (typeof window === 'undefined') return false;
    try {
      const recipes = communityStorage.getRecipes();
      const newRecipe = {
        ...recipe,
        id: recipe.id || `community_${Date.now()}`,
        createdAt: new Date().toISOString(),
        author: recipe.author || 'Anonymous',
        likes: 0,
        views: 0
      };
      recipes.push(newRecipe);
      localStorage.setItem('communityRecipes', JSON.stringify(recipes));
      return true;
    } catch (error) {
      console.error('Error saving community recipe:', error);
      return false;
    }
  },

  // Get recipe by ID
  getRecipe: (id) => {
    const recipes = communityStorage.getRecipes();
    return recipes.find(recipe => recipe.id === id);
  },

  // Update recipe
  updateRecipe: (id, updates) => {
    if (typeof window === 'undefined') return false;
    try {
      const recipes = communityStorage.getRecipes();
      const index = recipes.findIndex(recipe => recipe.id === id);
      if (index !== -1) {
        recipes[index] = { ...recipes[index], ...updates };
        localStorage.setItem('communityRecipes', JSON.stringify(recipes));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating community recipe:', error);
      return false;
    }
  },

  // Delete recipe
  deleteRecipe: (id) => {
    if (typeof window === 'undefined') return false;
    try {
      const recipes = communityStorage.getRecipes();
      const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
      localStorage.setItem('communityRecipes', JSON.stringify(filteredRecipes));
      return true;
    } catch (error) {
      console.error('Error deleting community recipe:', error);
      return false;
    }
  },

  // Like a recipe
  likeRecipe: (id) => {
    const recipe = communityStorage.getRecipe(id);
    if (recipe) {
      return communityStorage.updateRecipe(id, { likes: (recipe.likes || 0) + 1 });
    }
    return false;
  },

  // View a recipe
  viewRecipe: (id) => {
    const recipe = communityStorage.getRecipe(id);
    if (recipe) {
      return communityStorage.updateRecipe(id, { views: (recipe.views || 0) + 1 });
    }
    return false;
  },

  // Get popular recipes
  getPopularRecipes: (limit = 10) => {
    const recipes = communityStorage.getRecipes();
    return recipes
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, limit);
  },

  // Get recent recipes
  getRecentRecipes: (limit = 10) => {
    const recipes = communityStorage.getRecipes();
    return recipes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  // Search recipes
  searchRecipes: (query) => {
    const recipes = communityStorage.getRecipes();
    const lowercaseQuery = query.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title?.toLowerCase().includes(lowercaseQuery) ||
      recipe.description?.toLowerCase().includes(lowercaseQuery) ||
      recipe.ingredients?.some(ingredient => 
        ingredient.toLowerCase().includes(lowercaseQuery)
      )
    );
  },

  // Clear all recipes
  clearAll: () => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem('communityRecipes');
      return true;
    } catch (error) {
      console.error('Error clearing community recipes:', error);
      return false;
    }
  }
};

// Export individual functions for compatibility
export const saveCommunityRecipe = communityStorage.saveRecipe;
export const getCommunityRecipes = communityStorage.getRecipes;
export const getCommunityRecipe = communityStorage.getRecipe;
export const updateCommunityRecipe = communityStorage.updateRecipe;
export const deleteCommunityRecipe = communityStorage.deleteRecipe;
export const likeCommunityRecipe = communityStorage.likeRecipe;
export const viewCommunityRecipe = communityStorage.viewRecipe;
export const getPopularCommunityRecipes = communityStorage.getPopularRecipes;
export const getRecentCommunityRecipes = communityStorage.getRecentRecipes;
export const searchCommunityRecipes = communityStorage.searchRecipes;
export const clearAllCommunityRecipes = communityStorage.clearAll;

export default communityStorage;
