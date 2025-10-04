# 🍳 ChefBot Pro - Your AI-Powered Culinary Companion

ChefBot Pro is an innovative AI-driven platform designed to transform the way individuals approach cooking, meal planning, and recipe discovery. Leveraging cutting-edge artificial intelligence, ChefBot Pro offers a highly personalized and interactive culinary experience, catering to everyone from novice cooks to seasoned chefs through our revolutionary AI chatbot assistant.

![ChefBot Pro](https://img.shields.io/badge/ChefBot-Pro-orange?style=for-the-badge&logo=chef-hat)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Green?style=for-the-badge&logo=supabase)
![AI Chatbot](https://img.shields.io/badge/AI-Chatbot-purple?style=for-the-badge&logo=robot)

## ✨ Features

### 🤖 AI-Powered Recipe Generation
- **Smart Recipe Creation**: Generate custom recipes using Sensay AI based on your preferences
- **Ingredient Analysis**: Analyze available ingredients and suggest recipes
- **Nutrition Insights**: Get detailed nutrition facts and health benefits
- **Smart Substitutions**: AI-powered ingredient substitution suggestions

### 📅 Personalized Diet Planning
- **7-Day Meal Plans**: AI-generated comprehensive weekly meal plans
- **Goal-Based Planning**: Customized for bulk, cut, maintain, or general health goals
- **Interactive Calendar**: Visual meal scheduling with date selection
- **Save & Manage**: Store multiple diet plans and track progress

### 💬 Intelligent Chatbot Assistant
- **AI-Powered Conversations**: Natural language interactions with Sensay AI
- **Context-Aware Responses**: Understands current page and conversation history
- **Smart Intent Detection**: Automatically detects when users want to use specific features
- **Language-Aware CTAs**: Call-to-action text matches conversation language (English/Indonesian)
- **Inline Action Buttons**: Contextual buttons appear within chat responses
- **Multi-Language Support**: Automatic language detection and response
- **Mobile-Optimized**: Responsive chat interface for all devices
- **Feature Integration**: Direct access to all app features through chat
- **Off-Topic Handling**: Graceful redirection when users ask non-cooking questions
- **Enhanced Nutrition Detection**: Direct nutrition questions like "how much nutrition in garlic?"
- **Improved General Chat**: Better handling of greetings and general conversations
- **Template Response Prevention**: No more generic "mix-up" messages

### 👥 Community Features
- **Recipe Sharing**: Share your favorite recipes with the community
- **Browse Community**: Discover recipes created by other users
- **Like & Save**: Favorite recipes and build your personal collection
- **User Profiles**: Track cooking history and achievements

### 🔍 Smart Discovery
- **Random Generator**: Discover new recipes with surprise element
- **Category Browsing**: Explore recipes by cuisine and meal type
- **Ingredient Search**: Find recipes based on available ingredients
- **Nutrition Analysis**: Detailed health and nutrition information

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Smooth Animations**: Fluid transitions and hover effects
- **Intuitive Interface**: User-friendly design with clear navigation
- **Floating Chat Button**: Easy access to AI assistant from any page

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - User authentication and authorization
- **Row Level Security (RLS)** - Database security policies

### AI & External Services
- **Sensay AI** - AI recipe generation and chat
- **TheMealDB API** - Recipe database and categories
- **Pollinations.ai** - AI-generated recipe images
- **API Ninjas** - Nutrition analysis

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Supabase** account
- **Sensay AI** API access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/antidumpalways/ChefBot-Pro.git
   cd ChefBot-Pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Sensay AI Configuration
   NEXT_PUBLIC_SENSAY_API_KEY=your_sensay_api_key
   NEXT_PUBLIC_ORGANIZATION_ID=your_organization_id
   NEXT_PUBLIC_REPLICA_UUID=your_replica_uuid
   
   # API Keys
   API_NINJAS_KEY=your_api_ninjas_key
   SENSAY_ORGANIZATION_SECRET=your_sensay_organization_secret
   ```

4. **Database Setup**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Run the complete schema from `final-complete-schema.sql`
   - This will create all necessary tables, policies, and triggers

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ChefBot-Pro/
├── public/                     # Static assets
│   ├── images/                # Image assets
│   │   └── chefbot_pro.png    # Main logo
│   └── placeholder.svg        # Default placeholder
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── analyze-ingredients/
│   │   │   ├── analyze-nutrients/
│   │   │   ├── generate-diet-plan/
│   │   │   ├── generate-recipe/
│   │   │   ├── generate-recipe-image/
│   │   │   ├── ingredient-similarity/
│   │   │   └── sensay-chat/
│   │   ├── ai/               # AI recipe generator page
│   │   ├── categories/       # Recipe categories
│   │   ├── category/         # Dynamic category pages
│   │   ├── community/        # Community recipes
│   │   ├── dashboard/        # User dashboard
│   │   ├── diet-planner/     # AI diet planning
│   │   ├── favorite/         # Saved recipes
│   │   ├── history/          # Cooking history
│   │   ├── ingredient-explorer/ # Ingredient search
│   │   ├── ingredient-similarity/ # Ingredient similarity
│   │   ├── login/            # Authentication
│   │   ├── meal/             # Individual meal pages
│   │   ├── my-diet-plan/     # Saved diet plans
│   │   ├── random/           # Random recipe generator
│   │   ├── recipe/           # Recipe details
│   │   ├── settings/         # User settings
│   │   ├── upload-recipe/    # Recipe upload
│   │   ├── globals.css       # Global styles
│   │   ├── layout.jsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/           # Reusable components
│   │   ├── community/        # Community-specific components
│   │   ├── AiRecipe.jsx      # AI recipe display
│   │   ├── AnimatedFoodBackground.tsx # Animated background
│   │   ├── BackButton.tsx    # Navigation button
│   │   ├── Chatbot.jsx       # Enhanced AI chatbot assistant
│   │   ├── ChefKnifeCursor.tsx # Custom cursor
│   │   ├── ContextualActions.jsx # Contextual action buttons
│   │   ├── Footer.jsx        # Site footer
│   │   ├── FormComponents.jsx # Form components
│   │   ├── GenerateRecipeForm.jsx # Recipe generation form
│   │   ├── GoogleTranslate.js # Translation utilities
│   │   ├── ImageUpload.jsx   # Image upload component
│   │   ├── IngredientSimilarity.jsx # Ingredient similarity
│   │   ├── InstructionStep.jsx # Recipe instruction steps
│   │   ├── LanguageSelector.jsx # Language selection
│   │   ├── LoginRequiredButton.jsx # Login requirement
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   ├── RecipeSearchBar.tsx # Recipe search
│   │   ├── SaveRecipeButton.jsx # Save recipe functionality
│   │   ├── ScrollToTop.jsx   # Scroll to top button
│   │   ├── SessionManager.jsx # Session management
│   │   ├── ShareRecipeButton.jsx # Share recipe functionality
│   │   ├── ShowMeal.jsx      # Meal display component
│   │   ├── SmartSuggestions.jsx # Smart suggestions
│   │   ├── SpoonCursor.tsx   # Spoon cursor animation
│   │   ├── TextToSpeech.jsx  # Text-to-speech functionality
│   │   └── ThemeToggle.jsx   # Theme switcher
│   ├── config/               # Configuration files
│   │   └── sensay.ts         # Sensay AI configuration
│   ├── contexts/             # React contexts
│   │   └── AuthContext.jsx   # Authentication context
│   ├── hooks/                # Custom hooks
│   │   └── useCookingHistory.js # Cooking history hook
│   ├── lib/                  # Utility libraries
│   │   ├── chatbot-integrations.js # Enhanced chatbot integrations
│   │   ├── communityService.js # Community services
│   │   ├── communityStorage.js # Community data storage
│   │   ├── ingredientGraph.js # Ingredient relationships
│   │   ├── language-support.js # Multi-language support
│   │   ├── mockAuth.js       # Mock authentication
│   │   ├── schemas.js        # Data validation schemas
│   │   ├── seedCommunityData.js # Community data seeding
│   │   ├── sensay-client.ts  # Sensay AI client
│   │   ├── sensay-config.js  # Sensay AI configuration
│   │   ├── sensayUserHelper.js # Sensay user management
│   │   ├── supabase.js       # Supabase client
│   │   ├── supabaseService.js # Database services
│   │   ├── ThemeContext.js   # Theme management
│   │   └── urls.js           # URL constants
│   ├── services/             # External services
│   │   └── sensay-service.ts # Sensay AI integration
│   ├── types/                # TypeScript type definitions
│   │   └── sensay-api.ts     # Sensay API types
│   └── utils/                # Utility functions
├── docs/                     # Documentation
├── final-complete-schema.sql # Database schema
├── next.config.mjs          # Next.js configuration
├── package.json             # Dependencies and scripts
├── postcss.config.mjs       # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🔧 API Endpoints

### Recipe Generation
- `POST /api/generate-recipe` - Generate AI-powered recipes
- `POST /api/generate-recipe-image` - Generate recipe images
- `POST /api/analyze-ingredients` - Analyze ingredient combinations
- `POST /api/analyze-nutrients` - Get nutrition information

### Diet Planning
- `POST /api/generate-diet-plan` - Create personalized diet plans
- `GET /api/ingredient-similarity` - Find similar ingredients

### AI Chat
- `POST /api/sensay-chat` - Sensay AI chat completions with context awareness

### Request Examples

**Generate Recipe:**
```javascript
const response = await fetch('/api/generate-recipe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ingredients: ['chicken', 'rice', 'vegetables'],
    cuisine: 'asian',
    dietary_restrictions: ['gluten-free'],
    difficulty: 'easy'
  })
});
```

**Generate Diet Plan:**
```javascript
const response = await fetch('/api/generate-diet-plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    height: 170,
    weight: 70,
    age: 25,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
    targetDate: '2025-10-01'
  })
});
```

**AI Chat with Context:**
```javascript
const response = await fetch('/api/sensay-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'I want to create a recipe with chicken and rice',
    userId: 'user123',
    source: 'web',
    skipHistory: false,
    context: 'Current page: AI Recipe Generator (/ai)',
    currentPage: '/ai'
  })
});
```

## 🗄️ Database Schema

### Core Tables
- **users** - User authentication data
- **user_preferences** - User settings and preferences
- **saved_recipes** - User's favorite recipes
- **community_recipes** - Shared community recipes
- **my_diet_plan** - Saved diet plans
- **cooking_history** - User cooking activity

### Key Features
- **Row Level Security (RLS)** - Secure data access
- **Automatic Timestamps** - Created/updated tracking
- **Foreign Key Relationships** - Data integrity
- **Indexes** - Optimized query performance

## 🤖 Recent Chatbot Improvements

### Enhanced User Experience
- **Template Response Prevention**: Eliminated generic "mix-up" messages that confused users
- **Off-Topic Detection**: Intelligent detection of non-cooking questions with graceful redirection
- **Enhanced Nutrition AI**: Direct nutrition analysis for questions like "how much nutrition in garlic?"
- **Improved General Chat**: Better handling of greetings and general conversations

### Smart Conversation Flow
- **Greeting Detection**: Proper responses to "hi", "hello", "hey", etc.
- **Context Preservation**: Maintains cooking focus throughout conversations
- **Multiple Response Variations**: Keeps conversations fresh and engaging
- **Double-Layer Protection**: Catches and redirects off-topic AI responses

### Examples of Improved Interactions

**Before (Template Response):**
```
User: "hi"
Bot: "It seems like there might have been a little mix-up. Could you let me know what you're looking for..."
```

**After (Improved Response):**
```
User: "hi"
Bot: "Hello! 👋 I'm your cooking assistant. I can help you with:
• 🍳 Recipe generation
• 📊 Diet planning  
• 🍎 Nutrition analysis
• 🧠 Health advice

What would you like to cook today?"
```

**Off-Topic Handling:**
```
User: "How's the weather today?"
Bot: "I'm ChefBot, your cooking assistant! 👨‍🍳 I specialize in helping with:
• 🍳 Recipe creation & cooking tips
• 📊 Meal planning & diet advice
• 🍎 Nutrition analysis
• 🧠 Health & wellness tips

What would you like to cook or learn about cooking today?"
```

## 🎯 Key Features Explained

### AI Recipe Generation
Uses Sensay AI to generate personalized recipes based on:
- User preferences and dietary restrictions
- Available ingredients
- Cuisine preferences
- Difficulty level and cooking time

### Diet Planning System
Creates comprehensive 7-day meal plans with:
- Goal-specific calorie targets (bulk/cut/maintain)
- Balanced macronutrient distribution
- Variety in meals and ingredients
- Interactive calendar interface
- Save and manage multiple plans

### Intelligent Chatbot Assistant
Revolutionary AI-powered conversational interface featuring:
- **Natural Language Processing**: Understands user intent and context
- **Smart Intent Detection**: Automatically detects when users want to use specific features
- **Context-Aware Responses**: Considers current page and conversation history
- **Language Detection**: Automatically detects and responds in user's language (English/Indonesian)
- **Inline Action Buttons**: Contextual buttons appear within chat responses for direct feature access
- **Feature Integration**: Direct access to recipe generation, diet planning, community features, and more
- **Mobile-Optimized**: Responsive design that works perfectly on all devices
- **Conversation Memory**: Maintains context throughout the conversation
- **Off-Topic Detection**: Intelligent detection of non-cooking questions with graceful redirection
- **Enhanced Nutrition AI**: Direct nutrition analysis for questions like "how much nutrition in garlic?"
- **Improved User Experience**: Better handling of greetings, general questions, and edge cases
- **Template Response Prevention**: Eliminates generic "mix-up" messages with helpful cooking-focused responses
- **Double-Layer Protection**: Catches off-topic responses from AI and redirects appropriately

### Community Features
- Share recipes with detailed information
- Browse and discover community recipes
- Like and save favorite recipes
- User profiles with cooking history

### Smart Discovery
- Random recipe generator for inspiration
- Category-based browsing (cuisine, meal type)
- Ingredient-based recipe search
- Nutrition analysis and health benefits

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Enable automatic deployments

2. **Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure all API keys are properly configured

3. **Deploy**
   - Deploy automatically on every push to main branch
   - Preview deployments for pull requests

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **DigitalOcean App Platform** - Container deployment
- **AWS Amplify** - AWS integration

### Environment Variables for Production
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Sensay AI (Required)
NEXT_PUBLIC_SENSAY_API_KEY=your_sensay_api_key
NEXT_PUBLIC_ORGANIZATION_ID=your_organization_id
NEXT_PUBLIC_REPLICA_UUID=your_replica_uuid
SENSAY_ORGANIZATION_SECRET=your_organization_secret

# API Keys (Required)
API_NINJAS_KEY=your_api_ninjas_key

# Optional
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🧪 Testing

### Manual Testing
- Test all user flows (signup, login, recipe generation)
- Verify responsive design on different devices
- Test theme switching functionality
- Validate form submissions and error handling

### API Testing
```bash
# Test recipe generation
curl -X POST http://localhost:3000/api/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{"ingredients":["chicken","rice"],"cuisine":"asian"}'

# Test diet plan generation
curl -X POST http://localhost:3000/api/generate-diet-plan \
  -H "Content-Type: application/json" \
  -d '{"height":170,"weight":70,"goal":"maintain"}'
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/ChefBot-Pro.git
   cd ChefBot-Pro
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Link any related issues
   - Request review from maintainers

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation for new features

## 📄 License

This project is licensed under the ChefBot Pro License - see the [LICENSE](LICENSE) file for details.

### License Summary:
- **Personal Use**: Free for personal, educational, and non-commercial purposes
- **Commercial Use**: Requires a commercial license (contact us for pricing)
- **Attribution**: Credit required for all uses
- **Protection**: Intellectual property protected with legal enforcement

For commercial licensing inquiries, please contact the development team.

## 🙏 Acknowledgments

- **[Sensay AI](https://sensay.io)** - AI recipe generation and chat capabilities
- **[TheMealDB](https://www.themealdb.com)** - Comprehensive recipe database
- **[Supabase](https://supabase.com)** - Backend-as-a-Service platform
- **[DaisyUI](https://daisyui.com)** - Beautiful UI components
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Next.js](https://nextjs.org)** - React framework for production

## 📞 Support

If you have any questions or need help:

- **GitHub Issues** - Report bugs or request features
- **Discussions** - Ask questions and share ideas
- **Email** - Contact us at [your-email@domain.com]

## 🗺️ Roadmap

### ✅ Completed Features
- [x] **AI-Powered Chatbot** - Intelligent conversational assistant with Sensay AI
- [x] **Smart Intent Detection** - Automatic detection of user intent and actions
- [x] **Language-Aware CTAs** - Context-aware call-to-action text in multiple languages
- [x] **Inline Action Buttons** - Contextual buttons within chat responses
- [x] **Multi-Language Support** - Automatic language detection (English/Indonesian)
- [x] **Context-Aware Responses** - AI understands current page and conversation history
- [x] **Mobile-Optimized Chat** - Responsive chat interface for all devices
- [x] **Off-Topic Question Handling** - Graceful redirection for non-cooking questions
- [x] **Enhanced Nutrition Detection** - Direct nutrition analysis for specific questions
- [x] **Template Response Prevention** - Eliminated generic "mix-up" messages
- [x] **Improved General Chat** - Better handling of greetings and general conversations
- [x] **Double-Layer Protection** - Catches and redirects off-topic AI responses

### Upcoming Features
- [ ] **Voice Commands** - Voice-controlled recipe search and chat
- [ ] **Recipe Rating System** - Rate and review recipes
- [ ] **Meal Prep Planning** - Batch cooking and meal prep
- [ ] **Grocery List Generation** - Auto-generate shopping lists
- [ ] **Nutrition Tracking** - Track daily nutrition intake
- [ ] **Recipe Scaling** - Scale recipes for different serving sizes
- [ ] **Offline Mode** - Access saved recipes offline
- [ ] **Recipe Video Integration** - Embed cooking videos
- [ ] **Advanced AI Features** - More sophisticated AI interactions
- [ ] **Chatbot Analytics** - Track usage and improve suggestions

### Performance Improvements
- [ ] **Image Optimization** - Advanced image compression
- [ ] **Caching Strategy** - Implement Redis caching
- [ ] **CDN Integration** - Global content delivery
- [ ] **Database Optimization** - Query performance improvements

---

⭐ **Star this repository if you found it helpful!**

🍳 **Happy Cooking with ChefBot Pro!**
















