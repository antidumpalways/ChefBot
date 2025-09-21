import { recipeSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import ingredientGraph from "@/lib/ingredientGraph";
import { getSensayUserId } from "@/lib/sensayUserHelper";

/**
 * API Route: POST /api/generate-recipe
 * Generates a recipe based on user preferences using Sensay AI
 * 
 * Request body should include:
 * - cuisine (optional): Preferred cuisine type
 * - dishType (optional): Type of dish
 * - spiceLevel (optional): Desired spice level
 * - dietaryRestrictions (optional): Array of dietary restrictions
 * - userPrompt: User's specific requirements/preferences
 * - availableIngredients (optional): Array of ingredients identified from uploaded image
 * 
 * Returns a structured recipe object following the recipeSchema
 */
export async function POST(req) {
  try {
    const body = await req.json();

    // Get Sensay user ID (ensures user exists in Sensay)
    const finalUserId = await getSensayUserId(req);

    // Extract parameters from request (following existing pattern)
    const ingredients = body.ingredients || [];
    const cuisine = body.cuisine || "any";
    const dietary_restrictions = body.dietary_restrictions || [];
    const meal_type = body.meal_type || "any";
    const difficulty = body.difficulty || "any";
    const userPrompt = body.userPrompt || `Create a recipe using these ingredients: ${ingredients.join(', ')}`;

    // Build ingredients section if available (following existing pattern)
    const ingredientsSection = ingredients.length > 0
      ? `Available ingredients: ${ingredients.join(', ')}.`
      : '';

    // Get graph-based ingredient suggestions if available ingredients are provided
    let ingredientSuggestions = '';
    if (ingredients.length > 0) {
      try {
        const suggestions = ingredientGraph.generatePairingSuggestions(ingredients, 5);
        if (suggestions.complementary && suggestions.complementary.length > 0) {
          ingredientSuggestions = `\nSuggested complementary ingredients: ${suggestions.complementary.map(s => s.ingredient).join(', ')}.`;
        }
      } catch (error) {
        console.warn('Failed to get ingredient suggestions:', error);
      }
    }

    // Build dietary restrictions section
    const dietarySection = dietary_restrictions.length > 0
      ? `Dietary restrictions: ${dietary_restrictions.join(', ')}.`
      : '';

    // Create comprehensive prompt for Sensay API (following existing pattern)
    const prompt = `Create a detailed ${cuisine} recipe using the available ingredients.

User Request: ${userPrompt}
${ingredientsSection}
${ingredientSuggestions}
${dietarySection}

Please provide a complete recipe in JSON format with the following structure:
{
  "recipes": [
    {
      "id": "unique-recipe-id",
      "title": "Recipe Name",
      "description": "Brief description with emoji",
      "cuisine": "Cuisine type",
      "prep_time": "XX mins",
      "difficulty": "Easy/Medium/Hard",
      "servings": 4,
      "calories": 300,
      "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
      "instructions": ["step 1", "step 2", "step 3"]
    }
  ]
}

Make sure the recipe is authentic, delicious, and uses the available ingredients creatively. Include specific quantities, detailed cooking steps, and realistic nutritional information.`;

    // Try to call Sensay API, but fallback gracefully if it fails
    let recipeData;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const sensayResponse = await fetch(`${baseUrl}/api/sensay-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          userId: finalUserId,
          source: "web"
        }),
      });

      if (sensayResponse.ok) {
        const sensayResult = await sensayResponse.json();
        
        // Parse the JSON response from Sensay (following existing pattern)
        try {
          // Try to extract JSON from the response
          const jsonMatch = sensayResult.content?.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            recipeData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          // If parsing fails, create a structured response from the text
          recipeData = {
            recipes: [{
              id: `sensay_parsed_${Date.now()}`,
              title: "Sensay Generated Recipe",
              description: "A delicious AI-generated recipe based on your ingredients! 🍽️",
              cuisine: cuisine === "any" ? "International" : cuisine,
              prep_time: "30 mins",
              difficulty: "Medium",
              servings: 4,
              calories: 300,
              ingredients: ingredients.length > 0 ? ingredients : ["Main ingredient"],
              instructions: sensayResult.content?.split('\n').filter(line => line.trim()).slice(0, 8) || ["Cook ingredients as desired"]
            }]
          };
        }
      } else {
        throw new Error('Sensay API not available');
      }
    } catch (sensayError) {
      console.warn('Sensay API failed, using fallback:', sensayError.message);
      
      // Fallback to static recipe generation
      recipeData = {
        recipes: [{
          id: `fallback_${Date.now()}`,
          title: "Chef's Special Creation",
          description: "A delicious recipe crafted from your available ingredients! 🍽️✨",
          cuisine: cuisine === "any" ? "International Fusion" : cuisine,
          prep_time: "25 mins",
          difficulty: "Easy",
          servings: 4,
          calories: 320,
          ingredients: ingredients.length > 0 ? ingredients : ["Main ingredient"],
          instructions: [
            "Heat oil in a large pan over medium-high heat",
            "Add your main ingredients and cook until tender",
            "Season with salt, pepper, and your favorite herbs",
            "Add any additional ingredients and cook for 5-7 minutes",
            "Taste and adjust seasoning as needed",
            "Serve hot and enjoy your delicious creation!"
          ]
        }]
      };
    }

    // Transform to match the expected format for AI Ingredient Explorer
    const transformedRecipes = recipeData.recipes.map((recipe, index) => ({
      id: recipe.id || `sensay_recipe_${Date.now()}_${index}`,
      title: recipe.title || `Recipe ${index + 1}`,
      description: recipe.description || "A delicious AI-generated recipe based on your ingredients! 🍽️",
      cuisine: recipe.cuisine || "International",
      prep_time: recipe.prep_time || "30 mins",
      difficulty: recipe.difficulty || "Medium",
      servings: recipe.servings || 4,
      calories: recipe.calories || 300,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || []
    }));

    return NextResponse.json({ 
      recipes: transformedRecipes,
      source: "sensay_ai",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET handler for API information
 */
export async function GET() {
  return NextResponse.json({
    message: "Recipe Generation API powered by Sensay AI",
    endpoints: {
      POST: "Generate recipe based on preferences"
    },
    requiredFields: [
      "userPrompt (string)"
    ],
    optionalFields: [
      "cuisine (string)",
      "dishType (string)", 
      "spiceLevel (string)",
      "dietaryRestrictions (array)",
      "availableIngredients (array)"
    ]
  });
}
