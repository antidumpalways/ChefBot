// URL utilities for the application
export const RANDOM_MEAL_URL = "https://www.themealdb.com/api/json/v1/1/random.php";
export const CATEGORIES_URL = "https://www.themealdb.com/api/json/v1/1/categories.php";
export const MEAL_URL = (params) => `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${params.meal}`;

export const URLs = {
  // Base URLs
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // API Endpoints
  API: {
    GENERATE_RECIPE: '/api/generate-recipe',
    GENERATE_DIET_PLAN: '/api/generate-diet-plan',
    SENSAY_CHAT: '/api/sensay-chat',
    ANALYZE_INGREDIENTS: '/api/analyze-ingredients',
    ANALYZE_NUTRIENTS: '/api/analyze-nutrients',
    GENERATE_RECIPE_IMAGE: '/api/generate-recipe-image',
    INGREDIENT_SIMILARITY: '/api/ingredient-similarity',
    DEBUG_REPLICAS: '/api/debug-replicas',
    TEST_SENSAY: '/api/test-sensay',
    TEST_DIET_PLAN: '/api/test-diet-plan',
  },

  // Page Routes
  PAGES: {
    HOME: '/',
    AI: '/ai',
    DASHBOARD: '/dashboard',
    LOGIN: '/login',
    COMMUNITY: '/community',
    FAVORITE: '/favorite',
    HISTORY: '/history',
    DIET_PLANNER: '/diet-planner',
    MY_DIET_PLAN: '/my-diet-plan',
    INGREDIENT_EXPLORER: '/ingredient-explorer',
    INGREDIENT_SIMILARITY: '/ingredient-similarity',
    RANDOM: '/random',
    RECIPE: '/recipe',
    UPLOAD_RECIPE: '/upload-recipe',
    CATEGORY: (category) => `/category/${category}`,
    MEAL: (meal) => `/meal/${meal}`,
  },

  // External URLs
  EXTERNAL: {
    SUPABASE: 'https://bvjqvlpxccfxxsammsoo.supabase.co',
    SENSAY_API: 'https://api.sensay.io',
    POLLINATIONS: 'https://image.pollinations.ai',
    UNSPLASH: 'https://images.unsplash.com',
    THEMEALDB: 'https://www.themealdb.com/api/json/v1/1',
  },

  // Helper functions
  buildUrl: (base, path) => `${base}${path}`,
  buildApiUrl: (endpoint) => `${URLs.BASE_URL}${endpoint}`,
  buildExternalUrl: (service, path) => `${URLs.EXTERNAL[service]}${path}`,
};

export default URLs;
