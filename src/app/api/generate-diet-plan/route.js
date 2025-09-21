import { NextResponse } from 'next/server';
import { dietPlanSchema } from "@/lib/schemas";
import { getSensayUserId } from "@/lib/sensayUserHelper";

/**
 * API route for generating personalized diet plans using Sensay AI
 * New strategy: Generate recipe pool → Random selection for each day
 */
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Diet planner API called');
    console.log('Request body:', body);

    // Get Sensay user ID (ensures user exists in Sensay)
    const finalUserId = await getSensayUserId(request);

    const {
      height,
      weight,
      age,
      gender,
      activityLevel,
      goal,
      dietPreference,
      bloodSugar,
      bloodPressure,
      dietaryRestrictions,
      allergies,
      targetDate
    } = body;

    // Validate required fields
    if (!height || !weight || !age || !gender || !activityLevel || !goal || !targetDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE based on activity level
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

    // Calculate target calories based on goal
    let targetCalories;
    switch (goal) {
      case 'cut':
        targetCalories = Math.round(tdee * 0.8); // 20% deficit
        break;
      case 'bulk':
        targetCalories = Math.round(tdee * 1.2); // 20% surplus
        break;
      case 'maintain':
        targetCalories = Math.round(tdee);
        break;
      case 'general_health':
        targetCalories = Math.round(tdee * 0.95); // 5% deficit for health
        break;
      default:
        targetCalories = Math.round(tdee);
    }

    // Calculate number of days needed based on target date
    const startDate = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    startDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // Calculate days from today to target date
    const timeDiff = startDate.getTime() - today.getTime();
    const daysFromToday = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // If target date is in the past, start from today
    // If target date is today or future, start from target date
    const actualStartDate = daysFromToday <= 0 ? new Date(today) : new Date(startDate);
    
    // Generate 7 days from the start date
    const daysNeeded = 7;
    const totalMealsNeeded = daysNeeded * 4; // 4 meals per day

    console.log(`Target date: ${targetDate}`);
    console.log(`Days from today: ${daysFromToday}`);
    console.log(`Actual start date: ${actualStartDate.toISOString().split('T')[0]}`);
    console.log(`Generating diet plan for ${daysNeeded} days, ${totalMealsNeeded} total meals needed`);

    // Create optimized prompt for recipe pool generation
    const prompt = `Generate 10 recipes for ${goal} goal:

User: ${age}y, ${gender}, ${height}cm, ${weight}kg, ${activityLevel}
Target: ${targetCalories} calories/day, ${goal} goal
Diet: ${dietPreference}

Return ONLY this JSON array:
[
  {
    "name": "Recipe Name",
    "type": "breakfast|lunch|dinner|snack",
    "calories": 400,
    "protein": 25,
    "carbs": 45,
    "fat": 15,
    "ingredients": [{"name": "Ingredient", "amount": "1 cup"}],
    "instructions": ["Step 1", "Step 2"],
    "healthBenefits": ["Benefit 1"]
  }
]

Requirements:
- ${getGoalRequirements(goal)}
- Mix of breakfast, lunch, dinner, snack types
- Keep instructions brief
- Return ONLY the JSON array, no other text`;

    // Call Sensay API with longer timeout for recipe generation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds

    let sensayResponse;
    try {
      sensayResponse = await fetch('https://api.sensay.io/v1/replicas/a05d0bab-6cce-483f-9bfd-f267435b3d5b/chat/completions', {
        method: 'POST',
        headers: {
          'X-ORGANIZATION-SECRET': 'f4369f9a7c4c4a2e84847fcf54f617ff78aace25df7f14388708ca392d788cff',
          'X-API-Version': '2025-03-25',
          'X-USER-ID': finalUserId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: prompt,
          skip_chat_history: false,
          source: "web"
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Network error calling Sensay API:', fetchError);
      
      // Use fallback data for timeout
      if (fetchError.name === 'AbortError') {
        console.log('API request timed out, using fallback data');
        const fallbackData = generateFallbackDietPlan(body, targetCalories, bmr, tdee, daysNeeded, actualStartDate);
        return NextResponse.json(fallbackData);
      }
      
      throw new Error(`Network connection failed: ${fetchError.message}`);
    }

    if (!sensayResponse.ok) {
      const errorText = await sensayResponse.text();
      console.error('Sensay API Error:', {
        status: sensayResponse.status,
        statusText: sensayResponse.statusText,
        body: errorText
      });
      throw new Error(`Failed to generate diet plan with Sensay API: ${sensayResponse.status} ${sensayResponse.statusText}`);
    }

    const sensayResult = await sensayResponse.json();
    console.log('Raw Sensay API Response:', JSON.stringify(sensayResult, null, 2));
    
    // Parse the JSON response from Sensay
    let recipePool;
    try {
      const jsonMatch = sensayResult.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log('Found JSON array match:', jsonMatch[0]);
        let jsonText = jsonMatch[0];
        
        // Check if JSON is complete
        const openBrackets = (jsonText.match(/\[/g) || []).length;
        const closeBrackets = (jsonText.match(/\]/g) || []).length;
        
        if (openBrackets !== closeBrackets) {
          console.warn('JSON appears incomplete, using fallback data');
          throw new Error('Incomplete JSON response');
        }
        
        recipePool = JSON.parse(jsonText);
        console.log(`Successfully parsed ${recipePool.length} recipes from AI`);
      } else {
        console.log('No JSON array found, trying to parse entire response');
        recipePool = JSON.parse(sensayResult.content);
        console.log(`Successfully parsed ${recipePool.length} recipes from entire response`);
      }
    } catch (parseError) {
      console.error('Failed to parse Sensay response as JSON:', parseError);
      console.log('Raw Sensay response:', sensayResult.content);
      const fallbackData = generateFallbackDietPlan(body, targetCalories, bmr, tdee, daysNeeded, actualStartDate);
      return NextResponse.json(fallbackData);
    }

    // Validate recipe pool
    if (!Array.isArray(recipePool) || recipePool.length < 4) {
      console.warn('Invalid recipe pool, using fallback data');
      const fallbackData = generateFallbackDietPlan(body, targetCalories, bmr, tdee, daysNeeded, actualStartDate);
      return NextResponse.json(fallbackData);
    }

    // Generate diet plan using recipe pool
    const dietPlanData = generateDietPlanFromPool(recipePool, body, targetCalories, bmr, tdee, daysNeeded, actualStartDate);

    // Validate the response against the schema
    try {
      const validatedDietPlan = dietPlanSchema.parse(dietPlanData);
      return NextResponse.json({ 
        ...validatedDietPlan,
        source: "sensay_ai_pool",
        timestamp: new Date().toISOString(),
        recipePoolSize: recipePool.length
      });
    } catch (validationError) {
      console.warn('Schema validation failed, returning unvalidated data:', validationError);
      return NextResponse.json({ 
        ...dietPlanData,
        source: "sensay_ai_pool",
        timestamp: new Date().toISOString(),
        validation_warning: "Response structure may not match expected schema",
        recipePoolSize: recipePool.length
      });
    }

  } catch (error) {
    console.error("Diet plan generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate diet plan. Please try again.",
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Generate diet plan from recipe pool using random selection
 */
function generateDietPlanFromPool(recipePool, body, targetCalories, bmr, tdee, daysNeeded, actualStartDate) {
  const { goal } = body;
  const bmi = parseFloat((body.weight / Math.pow(body.height / 100, 2)).toFixed(1));
  
  // Categorize recipes by type
  const recipesByType = {
    breakfast: recipePool.filter(r => r.type === 'breakfast'),
    lunch: recipePool.filter(r => r.type === 'lunch'),
    dinner: recipePool.filter(r => r.type === 'dinner'),
    snack: recipePool.filter(r => r.type === 'snack')
  };

  // Ensure we have at least one recipe per type
  Object.keys(recipesByType).forEach(type => {
    if (recipesByType[type].length === 0) {
      recipesByType[type] = recipePool.slice(0, 1); // Use any recipe as fallback
    }
  });

  // Generate days
  const days = [];
  for (let i = 0; i < daysNeeded; i++) {
    const date = new Date(actualStartDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    
    // Randomly select 4 meals (one of each type)
    const meals = ['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
      const availableRecipes = recipesByType[type];
      const randomIndex = Math.floor(Math.random() * availableRecipes.length);
      const selectedRecipe = availableRecipes[randomIndex];
      
      // Adjust calories to match daily target
      const targetMealCalories = Math.round(targetCalories * getMealCalorieRatio(type));
      const calorieRatio = targetMealCalories / (selectedRecipe.calories || 400);
      
      return {
        name: selectedRecipe.name,
        type: type,
        calories: Math.round((selectedRecipe.calories || 400) * calorieRatio),
        protein: Math.round((selectedRecipe.protein || 25) * calorieRatio),
        carbs: Math.round((selectedRecipe.carbs || 45) * calorieRatio),
        fat: Math.round((selectedRecipe.fat || 15) * calorieRatio),
        ingredients: selectedRecipe.ingredients || [{ name: "Ingredient", amount: "1 serving" }],
        instructions: selectedRecipe.instructions || ["Prepare and serve"],
        healthBenefits: selectedRecipe.healthBenefits || ["Nutritious meal"]
      };
    });
    
    days.push({
      day: dayName,
      date: dateStr,
      meals: meals
    });
  }

  return {
    userProfile: {
      bmi: bmi,
      targetCalories: targetCalories,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    },
    weeklyDietPlan: {
      startDate: actualStartDate.toISOString().split('T')[0],
      totalCalories: targetCalories,
      totalProtein: Math.round(targetCalories * 0.25 / 4),
      totalCarbs: Math.round(targetCalories * 0.45 / 4),
      totalFat: Math.round(targetCalories * 0.30 / 9),
      days: days,
      healthNotes: generateHealthNotes(body),
      hydrationGoal: "Drink at least 8-10 glasses of water daily",
      exerciseRecommendation: "Include 30 minutes of moderate exercise daily"
    }
  };
}

/**
 * Get calorie ratio for each meal type
 */
function getMealCalorieRatio(mealType) {
  const ratios = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.25,
    snack: 0.15
  };
  return ratios[mealType] || 0.25;
}

/**
 * Generate health notes based on user conditions
 */
function generateHealthNotes(body) {
  const { bloodSugar, bloodPressure, goal } = body;
  const notes = [];
  
  if (bloodSugar !== 'normal') {
    notes.push("Monitor blood sugar levels and consider smaller, more frequent meals");
  } else {
    notes.push("Maintain stable blood sugar with balanced meals");
  }
  
  if (bloodPressure !== 'normal') {
    notes.push("Keep sodium intake moderate and focus on potassium-rich foods");
  } else {
    notes.push("Continue heart-healthy eating patterns");
  }
  
  notes.push("Stay hydrated throughout the day");
  notes.push("Include variety in your meals");
  
  return notes;
}

/**
 * Generate fallback diet plan when AI fails
 */
function generateFallbackDietPlan(body, targetCalories, bmr, tdee, daysNeeded, actualStartDate) {
  const { goal } = body;
  const bmi = parseFloat((body.weight / Math.pow(body.height / 100, 2)).toFixed(1));
  
  // Create fallback recipe pool based on goal
  const fallbackRecipes = getFallbackRecipesForGoal(body.goal);
  
  return generateDietPlanFromPool(fallbackRecipes, body, targetCalories, bmr, tdee, daysNeeded, actualStartDate);
}

/**
 * Get specific requirements for each goal type
 */
function getGoalRequirements(goal) {
  switch (goal) {
    case 'bulk':
      return 'HIGH calorie, HIGH protein foods';
    case 'cut':
      return 'LOW calorie, HIGH protein foods';
    case 'maintain':
      return 'BALANCED nutrition';
    case 'general_health':
      return 'NUTRIENT-DENSE foods';
    default:
      return 'BALANCED nutrition';
  }
}

/**
 * Get fallback recipes based on goal type
 */
function getFallbackRecipesForGoal(goal) {
  const baseRecipes = [
    { name: "Oatmeal Bowl", type: "breakfast", calories: 400, protein: 15, carbs: 60, fat: 8, ingredients: [{ name: "Oatmeal", amount: "1 cup" }], instructions: ["Cook oatmeal"], healthBenefits: ["High fiber"] },
    { name: "Scrambled Eggs", type: "breakfast", calories: 350, protein: 20, carbs: 5, fat: 25, ingredients: [{ name: "Eggs", amount: "3 large" }], instructions: ["Scramble eggs"], healthBenefits: ["High protein"] },
    { name: "Greek Yogurt", type: "breakfast", calories: 300, protein: 25, carbs: 20, fat: 8, ingredients: [{ name: "Greek Yogurt", amount: "1 cup" }], instructions: ["Serve yogurt"], healthBenefits: ["Probiotics"] },
    { name: "Brown Rice Bowl", type: "lunch", calories: 500, protein: 25, carbs: 70, fat: 12, ingredients: [{ name: "Brown Rice", amount: "1 cup" }], instructions: ["Cook rice"], healthBenefits: ["Complex carbs"] },
    { name: "Grilled Chicken", type: "lunch", calories: 450, protein: 40, carbs: 10, fat: 20, ingredients: [{ name: "Chicken Breast", amount: "150g" }], instructions: ["Grill chicken"], healthBenefits: ["High protein"] },
    { name: "Quinoa Salad", type: "lunch", calories: 400, protein: 15, carbs: 55, fat: 12, ingredients: [{ name: "Quinoa", amount: "1 cup" }], instructions: ["Cook quinoa"], healthBenefits: ["Complete protein"] },
    { name: "Salmon Fillet", type: "dinner", calories: 450, protein: 35, carbs: 5, fat: 30, ingredients: [{ name: "Salmon", amount: "120g" }], instructions: ["Bake salmon"], healthBenefits: ["Omega-3"] },
    { name: "Beef Stir Fry", type: "dinner", calories: 500, protein: 30, carbs: 25, fat: 25, ingredients: [{ name: "Beef", amount: "150g" }], instructions: ["Stir fry beef"], healthBenefits: ["Iron rich"] },
    { name: "Vegetable Pasta", type: "dinner", calories: 400, protein: 15, carbs: 60, fat: 10, ingredients: [{ name: "Whole Wheat Pasta", amount: "1 cup" }], instructions: ["Cook pasta"], healthBenefits: ["Fiber rich"] },
    { name: "Mixed Nuts", type: "snack", calories: 200, protein: 8, carbs: 10, fat: 16, ingredients: [{ name: "Mixed Nuts", amount: "30g" }], instructions: ["Eat nuts"], healthBenefits: ["Healthy fats"] },
    { name: "Apple Slices", type: "snack", calories: 150, protein: 1, carbs: 35, fat: 1, ingredients: [{ name: "Apple", amount: "1 medium" }], instructions: ["Slice apple"], healthBenefits: ["Fiber"] },
    { name: "Protein Shake", type: "snack", calories: 250, protein: 25, carbs: 15, fat: 8, ingredients: [{ name: "Protein Powder", amount: "1 scoop" }], instructions: ["Mix shake"], healthBenefits: ["High protein"] }
  ];

  // Add goal-specific recipes
  switch (goal) {
    case 'bulk':
      return [
        ...baseRecipes,
        { name: "Peanut Butter Toast", type: "breakfast", calories: 500, protein: 20, carbs: 45, fat: 25, ingredients: [{ name: "Whole Wheat Bread", amount: "2 slices" }, { name: "Peanut Butter", amount: "2 tbsp" }], instructions: ["Toast bread", "Spread peanut butter"], healthBenefits: ["High calories"] },
        { name: "Sweet Potato Bowl", type: "lunch", calories: 600, protein: 30, carbs: 80, fat: 15, ingredients: [{ name: "Sweet Potato", amount: "1 large" }, { name: "Chicken", amount: "150g" }], instructions: ["Bake sweet potato", "Add chicken"], healthBenefits: ["Complex carbs"] },
        { name: "Pasta with Meat Sauce", type: "dinner", calories: 650, protein: 35, carbs: 70, fat: 20, ingredients: [{ name: "Whole Wheat Pasta", amount: "1.5 cups" }, { name: "Ground Beef", amount: "150g" }], instructions: ["Cook pasta", "Make meat sauce"], healthBenefits: ["High protein"] }
      ];
    case 'cut':
      return [
        ...baseRecipes,
        { name: "Egg White Scramble", type: "breakfast", calories: 200, protein: 25, carbs: 5, fat: 8, ingredients: [{ name: "Egg Whites", amount: "6 large" }], instructions: ["Scramble egg whites"], healthBenefits: ["Low calorie"] },
        { name: "Grilled Fish", type: "lunch", calories: 300, protein: 35, carbs: 5, fat: 15, ingredients: [{ name: "White Fish", amount: "150g" }], instructions: ["Grill fish"], healthBenefits: ["Lean protein"] },
        { name: "Green Salad", type: "dinner", calories: 250, protein: 20, carbs: 15, fat: 12, ingredients: [{ name: "Mixed Greens", amount: "2 cups" }, { name: "Chicken Breast", amount: "100g" }], instructions: ["Mix greens", "Add chicken"], healthBenefits: ["Low calorie"] }
      ];
    case 'general_health':
      return [
        ...baseRecipes,
        { name: "Berry Smoothie", type: "breakfast", calories: 300, protein: 15, carbs: 45, fat: 8, ingredients: [{ name: "Mixed Berries", amount: "1 cup" }, { name: "Greek Yogurt", amount: "1/2 cup" }], instructions: ["Blend ingredients"], healthBenefits: ["Antioxidants"] },
        { name: "Kale Salad", type: "lunch", calories: 350, protein: 20, carbs: 25, fat: 18, ingredients: [{ name: "Kale", amount: "2 cups" }, { name: "Avocado", amount: "1/2 medium" }], instructions: ["Massage kale", "Add avocado"], healthBenefits: ["Nutrient dense"] },
        { name: "Baked Cod", type: "dinner", calories: 400, protein: 30, carbs: 20, fat: 20, ingredients: [{ name: "Cod Fillet", amount: "150g" }, { name: "Broccoli", amount: "1 cup" }], instructions: ["Bake cod", "Steam broccoli"], healthBenefits: ["Omega-3"] }
      ];
    default:
      return baseRecipes;
  }
}