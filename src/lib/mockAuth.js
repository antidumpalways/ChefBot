// Mock authentication for development/testing
export const mockAuth = {
  // Mock user data
  mockUser: {
    id: 'mock-user-123',
    email: 'test@example.com',
    username: 'Test User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    createdAt: new Date().toISOString()
  },

  // Mock authentication state
  isAuthenticated: false,
  isLoading: false,

  // Mock authentication methods
  signIn: async (email, password) => {
    console.log('Mock sign in:', { email, password });
    mockAuth.isAuthenticated = true;
    return { user: mockAuth.mockUser, error: null };
  },

  signUp: async (email, password, username) => {
    console.log('Mock sign up:', { email, password, username });
    mockAuth.isAuthenticated = true;
    return { user: { ...mockAuth.mockUser, username }, error: null };
  },

  signOut: async () => {
    console.log('Mock sign out');
    mockAuth.isAuthenticated = false;
    return { error: null };
  },

  getCurrentUser: () => {
    return mockAuth.isAuthenticated ? mockAuth.mockUser : null;
  },

  // Mock session management
  getSession: async () => {
    return mockAuth.isAuthenticated ? { user: mockAuth.mockUser } : null;
  },

  onAuthStateChange: (callback) => {
    // Mock auth state change
    callback(mockAuth.isAuthenticated ? mockAuth.mockUser : null);
    
    // Return unsubscribe function
    return () => {
      console.log('Mock auth state change unsubscribed');
    };
  },

  // Mock user preferences
  getUserPreferences: async () => {
    return {
      username: mockAuth.mockUser.username,
      theme: 'light',
      language: 'en',
      notifications: true
    };
  },

  updateUserPreferences: async (preferences) => {
    console.log('Mock update preferences:', preferences);
    return { success: true };
  },

  // Mock saved recipes
  getSavedRecipes: async () => {
    return [
      {
        id: 'saved-1',
        title: 'Mock Saved Recipe',
        description: 'This is a mock saved recipe',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
        prepTime: '30 mins',
        difficulty: 'Easy',
        cuisine: 'International'
      }
    ];
  },

  saveRecipe: async (recipe) => {
    console.log('Mock save recipe:', recipe);
    return { success: true };
  },

  removeSavedRecipe: async (recipeId) => {
    console.log('Mock remove recipe:', recipeId);
    return { success: true };
  }
};

// Export individual functions for compatibility
export const getCurrentUser = mockAuth.getCurrentUser;
export const signIn = mockAuth.signIn;
export const signUp = mockAuth.signUp;
export const signOut = mockAuth.signOut;

export default mockAuth;
