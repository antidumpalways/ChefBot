import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { recipe } = await req.json();

    if (!recipe) {
      return NextResponse.json({ error: "No recipe provided" }, { status: 400 });
    }

    // Check if API key exists
    const apiKey = process.env.API_NINJAS_KEY;
    
    if (!apiKey) {
      console.warn("⚠️ API_NINJAS_KEY not found, using fallback nutrition data");
      return NextResponse.json({ 
        nutrition: generateFallbackNutrition(recipe),
        source: "fallback",
        message: "Using estimated nutrition data (API key not configured)"
      });
    }

    // Call API Ninjas Nutrition API
    const response = await fetch(
      `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(recipe)}`,
      {
        headers: {
          "X-Api-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ API Ninjas failed (${response.status}), using fallback`);
      return NextResponse.json({ 
        nutrition: generateFallbackNutrition(recipe),
        source: "fallback",
        message: "API unavailable, using estimated nutrition data"
      });
    }

    const data = await response.json();

    // 🚀 Debug raw response
    console.log("🍽️ Raw Nutrition API Response:", JSON.stringify(data, null, 2));

    // ✅ Aggregate nutrition info
    let nutrition = {
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
    };

    data.forEach((item) => {
      nutrition.carbs += item.carbohydrates_total_g || 0;
      nutrition.fat += item.fat_total_g || 0;
      nutrition.fiber += item.fiber_g || 0;
      nutrition.sugar += item.sugar_g || 0;
      nutrition.sodium += item.sodium_mg || 0;
      nutrition.cholesterol += item.cholesterol_mg || 0;
    });

    // Round values
    for (let key in nutrition) {
      nutrition[key] = Math.round(nutrition[key] * 10) / 10;
    }

    return NextResponse.json({ 
      nutrition,
      source: "api_ninjas"
    });
  } catch (error) {
    console.error("🔥 Nutrition API error:", error);
    
    // Return fallback data instead of error
    try {
      const { recipe } = await req.json();
      return NextResponse.json({ 
        nutrition: generateFallbackNutrition(recipe),
        source: "fallback",
        message: "Error occurred, using estimated nutrition data"
      });
    } catch (parseError) {
      return NextResponse.json(
        { error: "Failed to process nutrition request" },
        { status: 500 }
      );
    }
  }
}

// Fallback nutrition generator
function generateFallbackNutrition(recipe) {
  // Simple estimation based on common ingredients
  const commonIngredients = recipe.toLowerCase();
  
  let baseNutrition = {
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
  };

  // Estimate based on ingredient keywords
  if (commonIngredients.includes('rice') || commonIngredients.includes('pasta')) {
    baseNutrition.carbs += 45;
    baseNutrition.fiber += 2;
  }
  
  if (commonIngredients.includes('chicken') || commonIngredients.includes('meat')) {
    baseNutrition.fat += 8;
    baseNutrition.cholesterol += 50;
  }
  
  if (commonIngredients.includes('cheese') || commonIngredients.includes('dairy')) {
    baseNutrition.fat += 12;
    baseNutrition.cholesterol += 30;
  }
  
  if (commonIngredients.includes('oil') || commonIngredients.includes('butter')) {
    baseNutrition.fat += 15;
  }
  
  if (commonIngredients.includes('vegetable') || commonIngredients.includes('salad')) {
    baseNutrition.fiber += 4;
  }
  
  if (commonIngredients.includes('salt') || commonIngredients.includes('sauce')) {
    baseNutrition.sodium += 400;
  }
  
  if (commonIngredients.includes('sugar') || commonIngredients.includes('sweet')) {
    baseNutrition.sugar += 20;
    baseNutrition.carbs += 25;
  }

  // Add some base values if nothing detected
  if (baseNutrition.carbs === 0) baseNutrition.carbs = 30;
  if (baseNutrition.fat === 0) baseNutrition.fat = 10;
  if (baseNutrition.fiber === 0) baseNutrition.fiber = 3;
  if (baseNutrition.sodium === 0) baseNutrition.sodium = 200;

  return baseNutrition;
}
