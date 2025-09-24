// Multi-language Support System
export const languages = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    code: 'en'
  },
  id: {
    name: 'Bahasa Indonesia',
    flag: '🇮🇩',
    code: 'id'
  }
};

export const translations = {
  en: {
    // Chatbot UI
    chatbotTitle: '🤖 ChefBot Assistant',
    chatbotSubtitle: 'Ask me anything about cooking!',
    placeholder: 'Ask me anything...',
    sendButton: 'Send',
    typing: 'Typing...',
    errorMessage: "Sorry, I'm having trouble right now. Please try again! 🔧",
    
    // Welcome messages
    welcomeTitle: '👋 Hi! I\'m your cooking assistant.',
    welcomeSubtitle: 'Ask me anything about recipes, ingredients, or cooking tips!',
    
    // Smart suggestions
    smartSuggestions: '💡 Smart Suggestions',
    basedOn: 'Based on',
    clickToStart: 'Click any suggestion to get started! 🚀',
    
    // Common suggestions
    generateRecipe: '🍳 Generate a custom recipe with AI',
    planMeals: '📊 Plan your weekly meals',
    browseRecipes: '👥 Browse community recipes',
    exploreIngredients: '🔍 Explore ingredients and substitutions',
    
    // Feature-specific suggestions
    recipeGenerator: {
      generatePasta: '🍝 Generate a pasta recipe',
      createSalad: '🥗 Create a healthy salad',
      makeDessert: '🍰 Make a dessert recipe',
      suggestMexican: '🌮 Suggest Mexican dishes'
    },
    dietPlanner: {
      planWeek: '📅 Plan this week\'s meals',
      calculateCalories: '⚖️ Calculate my daily calories',
      suggestLunch: '🥗 Suggest healthy lunch options',
      createMealPlan: '🍎 Create a balanced meal plan'
    },
    community: {
      showTrending: '👀 Show me trending recipes',
      findRated: '⭐ Find highly rated dishes',
      helpUpload: '📤 Help me upload my recipe',
      searchCuisines: '🔍 Search for specific cuisines'
    },
    ingredientExplorer: {
      findSubstitutes: '🔄 Find ingredient substitutes',
      exploreVegetables: '🥕 Explore vegetable options',
      checkSpices: '🧄 Check spice compatibility',
      findDairyAlternatives: '🥛 Find dairy alternatives'
    }
  },
  
  id: {
    // Chatbot UI
    chatbotTitle: '🤖 Asisten ChefBot',
    chatbotSubtitle: 'Tanyakan apapun tentang memasak!',
    placeholder: 'Tanyakan apapun...',
    sendButton: 'Kirim',
    typing: 'Mengetik...',
    errorMessage: 'Maaf, saya sedang mengalami masalah. Silakan coba lagi! 🔧',
    
    // Welcome messages
    welcomeTitle: '👋 Hai! Saya asisten memasak Anda.',
    welcomeSubtitle: 'Tanyakan apapun tentang resep, bahan, atau tips memasak!',
    
    // Smart suggestions
    smartSuggestions: '💡 Saran Cerdas',
    basedOn: 'Berdasarkan',
    clickToStart: 'Klik saran untuk memulai! 🚀',
    
    // Common suggestions
    generateRecipe: '🍳 Buat resep kustom dengan AI',
    planMeals: '📊 Rencanakan menu mingguan',
    browseRecipes: '👥 Jelajahi resep komunitas',
    exploreIngredients: '🔍 Jelajahi bahan dan substitusi',
    
    // Feature-specific suggestions
    recipeGenerator: {
      generatePasta: '🍝 Buat resep pasta',
      createSalad: '🥗 Buat salad sehat',
      makeDessert: '🍰 Buat resep dessert',
      suggestMexican: '🌮 Sarankan masakan Meksiko'
    },
    dietPlanner: {
      planWeek: '📅 Rencanakan menu minggu ini',
      calculateCalories: '⚖️ Hitung kalori harian saya',
      suggestLunch: '🥗 Sarankan opsi makan siang sehat',
      createMealPlan: '🍎 Buat rencana makan seimbang'
    },
    community: {
      showTrending: '👀 Tampilkan resep trending',
      findRated: '⭐ Temukan hidangan dengan rating tinggi',
      helpUpload: '📤 Bantu saya upload resep',
      searchCuisines: '🔍 Cari masakan tertentu'
    },
    ingredientExplorer: {
      findSubstitutes: '🔄 Temukan pengganti bahan',
      exploreVegetables: '🥕 Jelajahi opsi sayuran',
      checkSpices: '🧄 Periksa kompatibilitas rempah',
      findDairyAlternatives: '🥛 Temukan alternatif susu'
    }
  }
};

// Language detection and management
export class LanguageManager {
  constructor() {
    this.currentLanguage = this.detectLanguage();
  }

  detectLanguage() {
    if (typeof window === 'undefined') return 'en';
    
    // Check localStorage first
    const savedLanguage = localStorage.getItem('chefbot-language');
    if (savedLanguage && languages[savedLanguage]) {
      return savedLanguage;
    }
    
    // Check browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (languages[browserLanguage]) {
      return browserLanguage;
    }
    
    // Default to English
    return 'en';
  }

  setLanguage(languageCode) {
    if (languages[languageCode]) {
      this.currentLanguage = languageCode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('chefbot-language', languageCode);
      }
      return true;
    }
    return false;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getTranslation(key, fallback = '') {
    const translation = translations[this.currentLanguage];
    if (!translation) return fallback;
    
    // Support nested keys like 'recipeGenerator.generatePasta'
    const keys = key.split('.');
    let result = translation;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && result[k]) {
        result = result[k];
      } else {
        return fallback;
      }
    }
    
    return result;
  }

  getLanguageList() {
    return Object.entries(languages).map(([code, lang]) => ({
      code,
      ...lang
    }));
  }
}

// Export singleton instance
export const languageManager = new LanguageManager();




