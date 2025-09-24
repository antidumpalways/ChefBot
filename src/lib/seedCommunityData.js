// Seed data for community recipes
export const seedCommunityData = () => {
  const sampleRecipes = [
    {
      id: 'community_1',
      title: 'Classic Spaghetti Carbonara',
      description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta.',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500',
      ingredients: [
        '400g spaghetti',
        '200g pancetta',
        '4 large eggs',
        '100g pecorino cheese',
        'Black pepper',
        'Salt'
      ],
      instructions: [
        'Cook spaghetti according to package directions',
        'Cut pancetta into small cubes and cook until crispy',
        'Beat eggs with grated cheese and black pepper',
        'Drain pasta and mix with pancetta',
        'Remove from heat and quickly mix in egg mixture',
        'Serve immediately with extra cheese'
      ],
      prepTime: '15 mins',
      cookTime: '20 mins',
      servings: 4,
      difficulty: 'Medium',
      cuisine: 'Italian',
      author: 'Chef Mario',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      likes: 45,
      views: 120
    },
    {
      id: 'community_2',
      title: 'Chicken Teriyaki Bowl',
      description: 'Delicious Japanese-inspired chicken with teriyaki sauce over rice.',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
      ingredients: [
        '2 chicken breasts',
        '1 cup jasmine rice',
        '1/4 cup soy sauce',
        '2 tbsp honey',
        '1 tbsp ginger',
        '2 cloves garlic',
        '1 bell pepper',
        '1 carrot'
      ],
      instructions: [
        'Cook rice according to package directions',
        'Cut chicken into bite-sized pieces',
        'Make teriyaki sauce with soy sauce, honey, ginger, and garlic',
        'Cook chicken until golden brown',
        'Add vegetables and teriyaki sauce',
        'Simmer until sauce thickens',
        'Serve over rice'
      ],
      prepTime: '20 mins',
      cookTime: '25 mins',
      servings: 2,
      difficulty: 'Easy',
      cuisine: 'Japanese',
      author: 'Sushi Master',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      likes: 38,
      views: 95
    },
    {
      id: 'community_3',
      title: 'Mediterranean Quinoa Salad',
      description: 'Healthy and refreshing quinoa salad with Mediterranean flavors.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
      ingredients: [
        '1 cup quinoa',
        '1 cucumber',
        '2 tomatoes',
        '1/2 red onion',
        '1/2 cup olives',
        '100g feta cheese',
        '3 tbsp olive oil',
        '2 tbsp lemon juice',
        'Fresh herbs'
      ],
      instructions: [
        'Cook quinoa according to package directions',
        'Dice cucumber, tomatoes, and red onion',
        'Mix vegetables with cooked quinoa',
        'Add olives and crumbled feta cheese',
        'Make dressing with olive oil and lemon juice',
        'Toss salad with dressing and fresh herbs',
        'Chill before serving'
      ],
      prepTime: '15 mins',
      cookTime: '15 mins',
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Mediterranean',
      author: 'Healthy Eats',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      likes: 52,
      views: 140
    }
  ];

  return sampleRecipes;
};

export const seedCommunityRecipes = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const existingRecipes = JSON.parse(localStorage.getItem('communityRecipes') || '[]');
    if (existingRecipes.length === 0) {
      const sampleRecipes = seedCommunityData();
      localStorage.setItem('communityRecipes', JSON.stringify(sampleRecipes));
      console.log('✅ Seeded community recipes');
    }
  } catch (error) {
    console.error('Error seeding community recipes:', error);
  }
};

export default seedCommunityData;
















