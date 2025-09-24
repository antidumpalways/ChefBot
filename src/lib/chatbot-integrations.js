// Chatbot Feature Integration System
export class ChatbotIntegrations {
  constructor() {
    this.features = {
      'recipe-generator': {
        name: 'AI Recipe Generator',
        path: '/ai',
        description: 'Generate custom recipes with AI',
        actions: ['generate-recipe', 'suggest-ingredients', 'modify-recipe']
      },
      'diet-planner': {
        name: 'Diet Planner',
        path: '/diet-planner',
        description: 'Plan your meals and track nutrition',
        actions: ['create-meal-plan', 'calculate-calories', 'suggest-meals']
      },
      'community': {
        name: 'Community Recipes',
        path: '/community',
        description: 'Share and discover community recipes',
        actions: ['browse-recipes', 'upload-recipe', 'rate-recipe']
      },
      'ingredient-explorer': {
        name: 'Ingredient Explorer',
        path: '/ingredient-explorer',
        description: 'Explore ingredients and substitutions',
        actions: ['find-substitutes', 'explore-ingredients', 'check-compatibility']
      }
    };
  }

  // Get current page context
  getCurrentPageContext() {
    if (typeof window === 'undefined') return null;
    
    const path = window.location.pathname;
    const pageTitle = document.title;
    
    // Find matching feature
    const currentFeature = Object.entries(this.features).find(([key, feature]) => 
      path.includes(feature.path)
    );
    
    return {
      path,
      pageTitle,
      feature: currentFeature ? currentFeature[1] : null,
      featureKey: currentFeature ? currentFeature[0] : null
    };
  }

  // Generate smart suggestions based on context
  generateSmartSuggestions(context) {
    if (!context.feature) {
      return [
        "🍳 Generate a custom recipe with AI",
        "📊 Plan your weekly meals",
        "👥 Browse community recipes",
        "🔍 Explore ingredients and substitutions"
      ];
    }

    const suggestions = {
      'recipe-generator': [
        "🍝 Generate a pasta recipe",
        "🥗 Create a healthy salad",
        "🍰 Make a dessert recipe",
        "🌮 Suggest Mexican dishes"
      ],
      'diet-planner': [
        "📅 Plan this week's meals",
        "⚖️ Calculate my daily calories",
        "🥗 Suggest healthy lunch options",
        "🍎 Create a balanced meal plan"
      ],
      'community': [
        "👀 Show me trending recipes",
        "⭐ Find highly rated dishes",
        "📤 Help me upload my recipe",
        "🔍 Search for specific cuisines"
      ],
      'ingredient-explorer': [
        "🔄 Find ingredient substitutes",
        "🥕 Explore vegetable options",
        "🧄 Check spice compatibility",
        "🥛 Find dairy alternatives"
      ]
    };

    return suggestions[context.featureKey] || [];
  }

  // Execute feature actions
  async executeAction(action, params = {}) {
    switch (action) {
      case 'generate-recipe':
        return this.generateRecipe(params);
      case 'create-meal-plan':
        return this.createMealPlan(params);
      case 'browse-recipes':
        return this.browseRecipes(params);
      case 'find-substitutes':
        return this.findSubstitutes(params);
      case 'analyze-nutrition':
        return this.analyzeNutrition(params);
      default:
        return { success: false, message: 'Action not implemented yet' };
    }
  }

  // Extract recipe parameters from user message
  extractRecipeParams(message) {
    const params = {
      ingredients: '',
      cuisine: '',
      diet: '',
      mealType: ''
    };

    // Extract ingredients
    const ingredientKeywords = ['chili', 'rice', 'chicken', 'beef', 'vegetables', 'pasta', 'noodles', 'tomato', 'onion', 'garlic'];
    const foundIngredients = ingredientKeywords.filter(ingredient => 
      message.toLowerCase().includes(ingredient)
    );
    if (foundIngredients.length > 0) {
      params.ingredients = foundIngredients.join(', ');
    }

    // Extract cuisine
    const cuisineKeywords = {
      'italian': ['italian', 'pasta', 'pizza', 'risotto'],
      'mexican': ['mexican', 'taco', 'burrito', 'chili'],
      'asian': ['asian', 'chinese', 'japanese', 'thai', 'korean'],
      'indian': ['indian', 'curry', 'masala', 'biryani'],
      'american': ['american', 'burger', 'bbq', 'grilled']
    };

    for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        params.cuisine = cuisine;
        break;
      }
    }

    // Extract diet preferences
    const dietKeywords = {
      'vegetarian': ['vegetarian', 'veggie', 'no meat'],
      'vegan': ['vegan', 'plant-based'],
      'keto': ['keto', 'low carb'],
      'gluten-free': ['gluten-free', 'gluten free'],
      'healthy': ['healthy', 'light', 'low fat']
    };

    for (const [diet, keywords] of Object.entries(dietKeywords)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        params.diet = diet;
        break;
      }
    }

    // Extract meal type
    const mealTypeKeywords = {
      'breakfast': ['breakfast', 'morning'],
      'lunch': ['lunch', 'midday'],
      'dinner': ['dinner', 'evening'],
      'snack': ['snack', 'appetizer'],
      'dessert': ['dessert', 'sweet', 'cake']
    };

    for (const [mealType, keywords] of Object.entries(mealTypeKeywords)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        params.mealType = mealType;
        break;
      }
    }

    return params;
  }

  // Detect language from user message
  detectLanguage(message) {
    const indonesianWords = ['saya', 'aku', 'kamu', 'anda', 'mau', 'ingin', 'bisa', 'tidak', 'ya', 'tidak', 'bagaimana', 'apa', 'dimana', 'kapan', 'mengapa', 'untuk', 'dengan', 'dari', 'ke', 'di', 'pada', 'adalah', 'yang', 'ini', 'itu', 'dan', 'atau', 'tetapi', 'jika', 'karena', 'sehingga', 'agar', 'supaya', 'meskipun', 'walaupun', 'namun', 'akan', 'sudah', 'belum', 'pernah', 'selalu', 'kadang', 'sering', 'jarang', 'tidak pernah'];
    const messageWords = message.toLowerCase().split(/\s+/);
    const indonesianCount = messageWords.filter(word => indonesianWords.includes(word)).length;
    return indonesianCount > 0 ? 'id' : 'en';
  }

  // AI-powered intent detection for inline buttons
  async detectUserIntentWithAI(userMessage, botResponse = '', conversationHistory = []) {
    try {
      const userLanguage = this.detectLanguage(userMessage);
      
      // Call Sensay AI for intent analysis
      const response = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Analyze this user message and determine if they want to use a specific feature:

User Message: "${userMessage}"
Bot Response: "${botResponse}"
Conversation History Length: ${conversationHistory.length}
User Language: ${userLanguage}

Please respond with ONLY a JSON object containing:
{
  "shouldShowButton": true | false,
  "actionType": "recipe-generator" | "diet-planner" | "community" | "ingredient-explorer" | "nutrition-analyzer" | null,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Only show button if user clearly wants to use a specific feature, not for general discussion.`,
          userId: 'chefbot-intent-analyzer',
          source: 'web',
          skipHistory: true
        })
      });

      const data = await response.json();
      if (data.success) {
        try {
          const analysis = JSON.parse(data.content);
          console.log('🤖 AI Button Analysis:', analysis);
          
          if (analysis.shouldShowButton && analysis.actionType) {
            const buttonTexts = {
              'recipe-generator': '🍳 Generate Detailed Recipe',
              'diet-planner': '📊 Create Meal Plan',
              'community': '👥 Browse Community',
              'ingredient-explorer': '🔍 Explore Ingredients',
              'nutrition-analyzer': '🍎 Analyze Nutrition'
            };
            
            return {
              type: analysis.actionType,
              text: buttonTexts[analysis.actionType] || '🚀 Use Feature',
              action: this.getActionFromType(analysis.actionType),
              confidence: analysis.confidence
            };
          }
        } catch (parseError) {
          console.warn('Failed to parse AI button analysis:', parseError);
        }
      }
    } catch (error) {
      console.warn('AI button detection failed:', error);
    }
    
    return this.fallbackButtonDetection(userMessage, botResponse);
  }

  // Fallback keyword-based button detection
  fallbackButtonDetection(userMessage, botResponse = '') {
    const message = userMessage.toLowerCase();
    const response = botResponse.toLowerCase();
    
    console.log('🔍 Fallback detecting intent for message:', message);
    
    // Recipe Generation Intent
    const recipePatterns = [
      'want to make', 'how to cook', 'recipe for', 'cooking instructions',
      'make a dish', 'prepare a meal', 'cook something', 'create recipe',
      'i want to cook', 'can you help me cook', 'show me how to make',
      'recipe generator', 'use recipe generator', 'generate recipe',
      'i want to use', 'use the recipe', 'recipe generator', 'generate a recipe',
      'make a recipe', 'create a recipe', 'help me make', 'cooking recipe',
      'ingredients', 'what can i make with', 'recipe with', 'cook with'
    ];
    
    // Check for explicit recipe generator request
    if (message.includes('recipe generator') || message.includes('use recipe generator')) {
      console.log('✅ Detected recipe generator intent');
      return {
        type: 'recipe-generator',
        text: '🍳 Generate Detailed Recipe',
        action: 'generate-recipe',
        confidence: 'high'
      };
    }
    
    if (recipePatterns.some(pattern => message.includes(pattern))) {
      return {
        type: 'recipe-generator',
        text: '🍳 Generate Detailed Recipe',
        action: 'generate-recipe',
        confidence: 'high'
      };
    }

    // Nutrition Analysis Intent
    const nutritionPatterns = [
      'how many calories', 'nutritional value', 'health benefits',
      'nutrition facts', 'calorie count', 'protein content',
      'is it healthy', 'nutritional information', 'health benefits of'
    ];
    
    if (nutritionPatterns.some(pattern => message.includes(pattern))) {
      return {
        type: 'nutrition-ai',
        text: '🍎 Analyze Nutrition',
        action: 'analyze-nutrition',
        confidence: 'high'
      };
    }

    // Diet Planning Intent
    const dietPatterns = [
      'meal plan', 'diet plan', 'weekly menu', 'meal prep',
      'plan my meals', 'diet planning', 'meal schedule',
      'i need a meal plan', 'help me plan meals'
    ];
    
    if (dietPatterns.some(pattern => message.includes(pattern))) {
      return {
        type: 'diet-planner',
        text: '📊 Create Meal Plan',
        action: 'create-meal-plan',
        confidence: 'high'
      };
    }

    // Community Recipes Intent
    const communityPatterns = [
      'share recipe', 'community recipes', 'popular recipes',
      'what others make', 'trending recipes', 'upload recipe',
      'browse recipes', 'see community'
    ];
    
    if (communityPatterns.some(pattern => message.includes(pattern))) {
      return {
        type: 'community',
        text: '👥 Browse Community',
        action: 'browse-recipes',
        confidence: 'high'
      };
    }

    // Ingredient Explorer Intent
    const ingredientPatterns = [
      'substitute', 'alternative', 'instead of', 'replace',
      'what can i use', 'ingredient substitute', 'food alternative',
      'can i use instead', 'similar ingredient'
    ];
    
    if (ingredientPatterns.some(pattern => message.includes(pattern))) {
      return {
        type: 'ingredient-explorer',
        text: '🔍 Explore Ingredients',
        action: 'find-substitutes',
        confidence: 'high'
      };
    }

    console.log('❌ No intent detected for message:', message);
    return null;
  }

  // Helper function to get action from type
  getActionFromType(actionType) {
    const actionMap = {
      'recipe-generator': 'generate-recipe',
      'diet-planner': 'create-meal-plan',
      'community': 'browse-recipes',
      'ingredient-explorer': 'find-substitutes',
      'nutrition-analyzer': 'analyze-nutrition'
    };
    return actionMap[actionType] || 'unknown';
  }

  // Main intent detection function (now AI-powered)
  async detectUserIntent(userMessage, botResponse = '', conversationHistory = []) {
    return await this.detectUserIntentWithAI(userMessage, botResponse, conversationHistory);
  }

  // AI-powered context analysis (kept for fallback)
  async analyzeConversationContextWithAI(messages) {
    if (!messages || messages.length < 3) return []; // Minimal 3 pesan untuk AI analysis

    try {
      const conversationText = messages.map(msg => 
        `${msg.sender}: ${msg.text}`
      ).join('\n');

      const analysisPrompt = `Analyze this conversation and determine if the user is interested in any of these specific features. Only suggest features if the user is clearly asking for or discussing them:

CONVERSATION:
${conversationText}

AVAILABLE FEATURES:
1. recipe-generator: User wants to create/generate a recipe, cook something, or get cooking instructions
2. nutrition-ai: User is asking about nutrition, calories, health benefits, or nutritional information
3. diet-planner: User wants meal planning, diet planning, or weekly meal schedules
4. community: User wants to share recipes, see community recipes, or browse popular recipes
5. ingredient-explorer: User is asking about ingredient substitutes, alternatives, or replacements

RESPONSE FORMAT: Return ONLY a JSON array of relevant features, or empty array [] if none are relevant.

EXAMPLES:
- "I want to make pasta" → ["recipe-generator"]
- "How many calories in chicken?" → ["nutrition-ai"]
- "I need a meal plan" → ["diet-planner"]
- "What can I use instead of butter?" → ["ingredient-explorer"]
- "Hi, how are you?" → []
- "Tell me about cooking" → []

RESPONSE:`;

      const response = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: analysisPrompt,
          userId: 'chefbot-context-analyzer',
          source: 'web',
          skipHistory: true
        })
      });

      const data = await response.json();
      
      if (data.success && data.content) {
        try {
          // Extract JSON from AI response
          const jsonMatch = data.content.match(/\[.*\]/);
          if (jsonMatch) {
            const suggestedFeatures = JSON.parse(jsonMatch[0]);
            return this.mapFeaturesToActions(suggestedFeatures);
          }
        } catch (parseError) {
          console.warn('Failed to parse AI context analysis:', parseError);
        }
      }
    } catch (error) {
      console.error('AI context analysis failed:', error);
    }

    return [];
  }

  // Map feature types to action objects
  mapFeaturesToActions(features) {
    const actionMap = {
      'recipe-generator': {
        type: 'recipe-generator',
        title: '🍳 Generate Detailed Recipe',
        description: 'Create a complete recipe with AI',
        action: 'generate-recipe',
        icon: '🍳'
      },
      'nutrition-ai': {
        type: 'nutrition-ai',
        title: '🍎 Analyze Nutrition',
        description: 'Get detailed nutrition information',
        action: 'analyze-nutrition',
        icon: '🍎'
      },
      'diet-planner': {
        type: 'diet-planner',
        title: '📊 Create Meal Plan',
        description: 'Plan your weekly meals',
        action: 'create-meal-plan',
        icon: '📊'
      },
      'community': {
        type: 'community',
        title: '👥 Browse Community',
        description: 'Discover shared recipes',
        action: 'browse-recipes',
        icon: '👥'
      },
      'ingredient-explorer': {
        type: 'ingredient-explorer',
        title: '🔍 Explore Ingredients',
        description: 'Find substitutes and alternatives',
        action: 'find-substitutes',
        icon: '🔍'
      }
    };

    return features.map(feature => actionMap[feature]).filter(Boolean);
  }

  // Fallback keyword-based analysis (for when AI fails)
  analyzeConversationContext(messages) {
    if (!messages || messages.length < 4) return []; // Higher threshold for fallback

    const relevantActions = [];
    const allText = messages.map(msg => msg.text).join(' ').toLowerCase();
    
    // Only trigger on very specific, clear intent
    const clearRecipeIntent = [
      'i want to make', 'how to cook', 'recipe for', 'cooking instructions',
      'make a dish', 'prepare a meal', 'cook something'
    ];
    
    if (clearRecipeIntent.some(intent => allText.includes(intent))) {
      relevantActions.push({
        type: 'recipe-generator',
        title: '🍳 Generate Detailed Recipe',
        description: 'Create a complete recipe with AI',
        action: 'generate-recipe',
        icon: '🍳'
      });
    }

    const clearNutritionIntent = [
      'how many calories', 'nutritional value', 'health benefits',
      'nutrition facts', 'calorie count'
    ];
    
    if (clearNutritionIntent.some(intent => allText.includes(intent))) {
      relevantActions.push({
        type: 'nutrition-ai',
        title: '🍎 Analyze Nutrition',
        description: 'Get detailed nutrition information',
        action: 'analyze-nutrition',
        icon: '🍎'
      });
    }

    return relevantActions;
  }

  // Recipe generation action
  async generateRecipe(params) {
    try {
      // Navigate to AI recipe generator with pre-filled data
      if (typeof window !== 'undefined') {
        const { ingredients, cuisine, diet, mealType } = params;
        
        // Store recipe parameters in localStorage for AI page to use
        if (ingredients || cuisine || diet || mealType) {
          localStorage.setItem('chatbot-recipe-params', JSON.stringify({
            ingredients: ingredients || '',
            cuisine: cuisine || '',
            diet: diet || '',
            mealType: mealType || '',
            source: 'chatbot'
          }));
        }
        
        window.location.href = '/ai';
      }
      return { success: true, message: 'Redirecting to AI Recipe Generator...' };
    } catch (error) {
      return { success: false, message: 'Failed to navigate to recipe generator' };
    }
  }

  // Meal planning action
  async createMealPlan(params) {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = '/diet-planner';
      }
      return { success: true, message: 'Redirecting to Diet Planner...' };
    } catch (error) {
      return { success: false, message: 'Failed to navigate to diet planner' };
    }
  }

  // Community recipes action
  async browseRecipes(params) {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = '/community';
      }
      return { success: true, message: 'Redirecting to Community Recipes...' };
    } catch (error) {
      return { success: false, message: 'Failed to navigate to community' };
    }
  }

  // Ingredient exploration action
  async findSubstitutes(params) {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = '/ingredient-explorer';
      }
      return { success: true, message: 'Redirecting to Ingredient Explorer...' };
    } catch (error) {
      return { success: false, message: 'Failed to navigate to ingredient explorer' };
    }
  }

  // Nutrition analysis action
  async analyzeNutrition(params) {
    try {
      if (typeof window !== 'undefined') {
        // Store nutrition context for AI page
        if (params.food || params.ingredients) {
          localStorage.setItem('chatbot-nutrition-context', JSON.stringify({
            food: params.food || '',
            ingredients: params.ingredients || '',
            source: 'chatbot'
          }));
        }
        
        window.location.href = '/ai#nutrition-ai';
      }
      return { success: true, message: 'Redirecting to Nutrition AI...' };
    } catch (error) {
      return { success: false, message: 'Failed to navigate to nutrition AI' };
    }
  }

  // Get feature-specific prompts
  getFeaturePrompt(featureKey) {
    const prompts = {
      'recipe-generator': `You are ChefBot on the AI Recipe Generator page. Help users create amazing recipes by:
- Suggesting creative ingredient combinations
- Providing cooking techniques and tips
- Offering recipe modifications and variations
- Explaining cooking methods in detail`,
      
      'diet-planner': `You are ChefBot on the Diet Planner page. Help users with meal planning by:
- Creating balanced meal plans
- Calculating nutritional information
- Suggesting healthy alternatives
- Providing portion size guidance`,
      
      'community': `You are ChefBot on the Community page. Help users discover and share recipes by:
- Recommending trending recipes
- Helping with recipe uploads
- Suggesting recipe improvements
- Encouraging community engagement`,
      
      'ingredient-explorer': `You are ChefBot on the Ingredient Explorer page. Help users with ingredients by:
- Finding perfect substitutes
- Explaining ingredient properties
- Suggesting flavor combinations
- Providing storage and preparation tips`
    };

    return prompts[featureKey] || `You are ChefBot, a helpful cooking assistant. Provide friendly, expert advice about cooking, recipes, and culinary techniques.`;
  }
}

// Export singleton instance
export const chatbotIntegrations = new ChatbotIntegrations();

