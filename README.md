# 🍳 ChefBot Pro - AI Recipe & Diet Planning Platform

A modern, AI-powered recipe and diet planning application that helps users discover, create, and share delicious recipes while maintaining healthy eating habits.

![ChefBot Pro](https://img.shields.io/badge/ChefBot-Pro-orange?style=for-the-badge&logo=chef-hat)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Green?style=for-the-badge&logo=supabase)

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
   git clone https://github.com/antidumpalways/ChefBot.git
   cd ChefBot
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
ChefBot/
├── public/                     # Static assets
│   ├── images/                # Image assets
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
│   │   ├── category/[category]/ # Dynamic category pages
│   │   ├── community/        # Community recipes
│   │   ├── dashboard/        # User dashboard
│   │   ├── diet-planner/     # AI diet planning
│   │   ├── favorite/         # Saved recipes
│   │   ├── history/          # Cooking history
│   │   ├── ingredient-explorer/ # Ingredient search
│   │   ├── login/            # Authentication
│   │   ├── meal/[meal]/      # Individual meal pages
│   │   ├── my-diet-plan/     # Saved diet plans
│   │   ├── random/           # Random recipe generator
│   │   ├── recipe/           # Recipe details
│   │   ├── upload-recipe/    # Recipe upload
│   │   ├── globals.css       # Global styles
│   │   ├── layout.jsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/           # Reusable components
│   │   ├── community/        # Community-specific components
│   │   ├── AiRecipe.jsx      # AI recipe display
│   │   ├── BackButton.tsx    # Navigation button
│   │   ├── Footer.jsx        # Site footer
│   │   ├── GenerateRecipeForm.jsx # Recipe generation form
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   ├── SaveRecipeButton.jsx # Save recipe functionality
│   │   ├── ShareRecipeButton.jsx # Share recipe functionality
│   │   ├── ShowMeal.jsx      # Meal display component
│   │   └── ThemeToggle.jsx   # Theme switcher
│   ├── contexts/             # React contexts
│   │   └── AuthContext.jsx   # Authentication context
│   ├── hooks/                # Custom hooks
│   │   └── useCookingHistory.js # Cooking history hook
│   ├── lib/                  # Utility libraries
│   │   ├── communityStorage.js # Community data storage
│   │   ├── ingredientGraph.js # Ingredient relationships
│   │   ├── schemas.js        # Data validation schemas
│   │   ├── sensayUserHelper.js # Sensay user management
│   │   ├── supabase.js       # Supabase client
│   │   ├── supabaseService.js # Database services
│   │   ├── urls.js           # URL constants
│   │   └── ThemeContext.js   # Theme management
│   ├── services/             # External services
│   │   └── sensay-service.ts # Sensay AI integration
│   └── types/                # TypeScript type definitions
│       └── sensay-api.ts     # Sensay API types
├── final-complete-schema.sql # Database schema
├── next.config.mjs          # Next.js configuration
├── package.json             # Dependencies and scripts
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
- `POST /api/sensay-chat` - Sensay AI chat completions

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
   git clone https://github.com/yourusername/ChefBot.git
   cd ChefBot
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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

### Upcoming Features
- [ ] **Recipe Rating System** - Rate and review recipes
- [ ] **Meal Prep Planning** - Batch cooking and meal prep
- [ ] **Grocery List Generation** - Auto-generate shopping lists
- [ ] **Nutrition Tracking** - Track daily nutrition intake
- [ ] **Recipe Scaling** - Scale recipes for different serving sizes
- [ ] **Offline Mode** - Access saved recipes offline
- [ ] **Voice Commands** - Voice-controlled recipe search
- [ ] **Recipe Video Integration** - Embed cooking videos

### Performance Improvements
- [ ] **Image Optimization** - Advanced image compression
- [ ] **Caching Strategy** - Implement Redis caching
- [ ] **CDN Integration** - Global content delivery
- [ ] **Database Optimization** - Query performance improvements

---

⭐ **Star this repository if you found it helpful!**

🍳 **Happy Cooking with ChefBot Pro!**
