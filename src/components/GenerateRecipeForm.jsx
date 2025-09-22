"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  CheckboxField,
  InputField,
  SelectField,
} from "@/components/FormComponents";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/contexts/AuthContext";

/**
 * GenerateRecipeForm Component
 * 
 * A form component that collects user preferences for recipe generation
 * Uses react-hook-form for form state management
 * Integrated with Sensay API for AI-powered recipe generation
 * 
 * Props:
 * @param {Function} setRecipe - Updates parent component with generated recipe
 * @param {Function} setShowRecipe - Controls recipe display visibility
 * @param {Function} setRecipeImageUrl - Updates recipe image URL
 */
function GenerateRecipeForm({ setRecipe, setShowRecipe, setRecipeImageUrl, onResetRef }) {
  const { user } = useAuth();
  const [analyzedIngredients, setAnalyzedIngredients] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      userPrompt: "",
      dishType: "Snack",
      cuisine: "Indian",
      dietaryRestrictions: [],
      spiceLevel: "Spicy",
      skillLevel: "Intermediate",
      cookingMethod: "Any",
    },
  });

  // Handle data from diet planner
  const [dietMealInfo, setDietMealInfo] = useState(null);
  
  useEffect(() => {
    const dietMealData = sessionStorage.getItem('dietMealData');
    if (dietMealData) {
      try {
        const mealData = JSON.parse(dietMealData);
        setValue('userPrompt', mealData.prompt);
        
        // Set appropriate dish type based on meal type
        const mealTypeMap = {
          'breakfast': 'Breakfast',
          'lunch': 'Main Course',
          'dinner': 'Main Course',
          'snack': 'Appetizer'
        };
        setValue('dishType', mealTypeMap[mealData.mealType.toLowerCase()] || 'Main Course');
        
        // Store meal info for display
        setDietMealInfo(mealData);
        
        // Clear the stored data after using it
        sessionStorage.removeItem('dietMealData');
      } catch (error) {
        console.error('Error parsing diet meal data:', error);
      }
    }
  }, [setValue]);

  if (onResetRef) {
    onResetRef.current = reset;
  }

  /**
   * Form submission handler
   * Uses Sensay API for recipe generation
   */
  const onSubmit = async (data) => {
    setError(null);
    setIsLoading(true);

    try {
      // Build comprehensive prompt
      const ingredientsText = analyzedIngredients.length > 0 
        ? `Available ingredients: ${analyzedIngredients.map(ing => `${ing.name}${ing.quantity ? ` (${ing.quantity})` : ''}`).join(', ')}.` 
        : '';
      
      const dietaryText = data.dietaryRestrictions.length > 0 
        ? `Dietary restrictions: ${data.dietaryRestrictions.join(', ')}.` 
        : '';

      const skillLevelText = data.skillLevel ? `Skill Level: ${data.skillLevel}. ` : '';
      const cookingMethodText = data.cookingMethod && data.cookingMethod !== 'Any' ? `Cooking Method: ${data.cookingMethod}. ` : '';

      const sensayPrompt = `Create a detailed ${data.cuisine} ${data.dishType} recipe with ${data.spiceLevel.toLowerCase()} spice level.

User Request: ${data.userPrompt}
${ingredientsText}
${dietaryText}
${skillLevelText}${cookingMethodText}

Please provide the recipe in this structured format:

Recipe Name: [Name of the dish]
Cuisine: ${data.cuisine}
Type: ${data.dishType}
Difficulty: [Easy/Medium/Hard]
Cooking Time: [Total time in minutes]
Prep Time: [Preparation time in minutes]
Servings: [Number of servings]

Ingredients:
- [Ingredient 1]: [Quantity]
- [Ingredient 2]: [Quantity]
- [Ingredient 3]: [Quantity]
- [Ingredient 4]: [Quantity]
- [Ingredient 5]: [Quantity]
- [Ingredient 6]: [Quantity]

Instructions:
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]
5. [Step 5]
6. [Step 6]

Nutritional Info (per serving):
- Calories: [Number] kcal
- Protein: [Number]g
- Carbs: [Number]g
- Fat: [Number]g
- Fiber: [Number]g

Cooking Tips:
- [Tip 1]
- [Tip 2]
- [Tip 3]

Description: [Brief description of the dish]

Make sure to include specific quantities, detailed cooking steps, and realistic nutritional information.`;

      // Call Sensay API with better error handling
      const sensayResponse = await fetch("/api/sensay-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: sensayPrompt,
          userId: user?.id || "sensay-user",
          source: "web"
        }),
      });

      if (!sensayResponse.ok) {
        const errorData = await sensayResponse.json().catch(() => ({}));
        throw new Error(`Sensay API error (${sensayResponse.status}): ${errorData.error || sensayResponse.statusText}`);
      }

      const sensayResult = await sensayResponse.json();
      
      // Better validation of Sensay response
      if (!sensayResult.success) {
        throw new Error(`Sensay API failed: ${sensayResult.error || 'Unknown error'}`);
      }
      
      if (!sensayResult.content) {
        throw new Error('Sensay API returned empty response');
      }
      
      // Debug: Log the raw response
      console.log('🔍 Raw AI Response:', sensayResult.content);
      
      // Parse Sensay response with better error handling
      let recipe;
      try {
        // Try to extract JSON from response (might be wrapped in text)
        const content = sensayResult.content;
        let jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const recipeData = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!recipeData.name || !recipeData.ingredients || !recipeData.instructions) {
          throw new Error('Invalid recipe format from AI');
        }
        
        recipe = recipeData;
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // If not JSON, parse structured text response
        console.warn('Failed to parse JSON recipe, parsing structured text:', parseError);
        
        const content = sensayResult.content;
        
        // Parse structured text format
        const recipeNameMatch = content.match(/Recipe Name:\s*([^\n]+)/i);
        const recipeName = recipeNameMatch ? recipeNameMatch[1].trim() : 
                          content.match(/(?:recipe|dish|name)[:\s]*([^\n,]+)/i)?.[1]?.trim() || 
                          `${data.cuisine} ${data.dishType}`;
        
        // Extract difficulty level
        const difficultyMatch = content.match(/Difficulty:\s*([^\n]+)/i);
        const difficulty = difficultyMatch ? difficultyMatch[1].trim() : 'Medium';
        
        // Extract cooking time
        const cookingTimeMatch = content.match(/Cooking Time:\s*([^\n]+)/i);
        const cookingTime = cookingTimeMatch ? cookingTimeMatch[1].trim() : '30 minutes';
        
        // Extract prep time
        const prepTimeMatch = content.match(/Prep Time:\s*([^\n]+)/i);
        const prepTime = prepTimeMatch ? prepTimeMatch[1].trim() : '15 minutes';
        
        // Extract servings
        const servingsMatch = content.match(/Servings:\s*([^\n]+)/i);
        const servings = servingsMatch ? servingsMatch[1].trim() : '4';
        
        // Extract ingredients from structured format
        const ingredientsSection = content.match(/Ingredients:([\s\S]*?)(?=Instructions:|$)/i);
        let extractedIngredients = [];
        
        if (ingredientsSection) {
          const ingredientLines = ingredientsSection[1].split('\n').filter(line => line.trim().startsWith('-'));
          extractedIngredients = ingredientLines.map(line => {
            const match = line.match(/-\s*([^:]+):\s*(.+)/);
            return match ? { name: match[1].trim(), measure: match[2].trim() } : null;
          }).filter(Boolean);
        }
        
        // Extract instructions from structured format
        const instructionsSection = content.match(/Instructions:([\s\S]*?)(?=Nutritional Info:|$)/i);
        let extractedInstructions = [];
        
        if (instructionsSection) {
          const instructionLines = instructionsSection[1].split('\n').filter(line => line.trim().match(/^\d+\./));
          extractedInstructions = instructionLines.map(line => {
            const match = line.match(/^\d+\.\s*(.+)/);
            return match ? match[1].trim() : null;
          }).filter(Boolean);
        }
        
        // Extract nutritional info
        const nutritionalSection = content.match(/Nutritional Info \(per serving\):([\s\S]*?)(?=Cooking Tips:|$)/i);
        let nutritionalInfo = {};
        
        if (nutritionalSection) {
          const nutritionalLines = nutritionalSection[1].split('\n').filter(line => line.trim().startsWith('-'));
          nutritionalLines.forEach(line => {
            const caloriesMatch = line.match(/Calories:\s*([^\s]+)/i);
            const proteinMatch = line.match(/Protein:\s*([^\s]+)/i);
            const carbsMatch = line.match(/Carbs:\s*([^\s]+)/i);
            const fatMatch = line.match(/Fat:\s*([^\s]+)/i);
            const fiberMatch = line.match(/Fiber:\s*([^\s]+)/i);
            
            if (caloriesMatch) nutritionalInfo.calories = caloriesMatch[1];
            if (proteinMatch) nutritionalInfo.protein = proteinMatch[1];
            if (carbsMatch) nutritionalInfo.carbs = carbsMatch[1];
            if (fatMatch) nutritionalInfo.fat = fatMatch[1];
            if (fiberMatch) nutritionalInfo.fiber = fiberMatch[1];
          });
        }
        
        // Extract cooking tips
        const tipsSection = content.match(/Cooking Tips:([\s\S]*?)(?=Description:|$)/i);
        let cookingTips = [];
        
        if (tipsSection) {
          const tipLines = tipsSection[1].split('\n').filter(line => line.trim().startsWith('-'));
          cookingTips = tipLines.map(line => {
            const match = line.match(/-\s*(.+)/);
            return match ? match[1].trim() : null;
          }).filter(Boolean);
        }
        
        // Extract description
        const descriptionMatch = content.match(/Description:\s*([^\n]+)/i);
        const description = descriptionMatch ? descriptionMatch[1].trim() : 
                           `A delicious ${data.cuisine} ${data.dishType} with ${data.spiceLevel.toLowerCase()} spice level.`;
        
        // Create better structured recipe based on user input
        const generateRealisticIngredients = () => {
          const baseIngredients = {
            Italian: [
              { name: "Pasta", measure: "400g" },
              { name: "Tomatoes", measure: "400g" },
              { name: "Garlic", measure: "4 cloves" },
              { name: "Olive oil", measure: "3 tbsp" },
              { name: "Salt", measure: "to taste" }
            ],
            Mexican: [
              { name: "Tortillas", measure: "8 pieces" },
              { name: "Beans", measure: "400g" },
              { name: "Cheese", measure: "200g" },
              { name: "Onions", measure: "1 medium" },
              { name: "Cilantro", measure: "1 bunch" }
            ],
            Indian: [
              { name: "Rice", measure: "2 cups" },
              { name: "Lentils", measure: "1 cup" },
              { name: "Onions", measure: "2 medium" },
              { name: "Ginger", measure: "1 inch" },
              { name: "Garlic", measure: "6 cloves" }
            ],
            Chinese: [
              { name: "Rice", measure: "2 cups" },
              { name: "Soy sauce", measure: "3 tbsp" },
              { name: "Vegetables", measure: "300g" },
              { name: "Ginger", measure: "1 inch" },
              { name: "Sesame oil", measure: "1 tbsp" }
            ]
          };
          
          return baseIngredients[data.cuisine] || baseIngredients.Italian;
        };

        const generateRealisticInstructions = () => {
          const baseInstructions = {
            "Main Course": [
              "Prepare all ingredients and chop vegetables",
              "Heat oil in a large pan over medium heat",
              "Add aromatics and cook until fragrant",
              "Add main ingredients and cook until tender",
              "Season with spices and herbs",
              "Simmer for 15-20 minutes until flavors meld",
              "Taste and adjust seasoning",
              "Serve hot with rice or bread"
            ],
            "Appetizer": [
              "Prepare all ingredients and preheat oven",
              "Mix ingredients in a bowl until well combined",
              "Shape into desired form or portion",
              "Arrange on baking sheet",
              "Cook until golden brown and crispy",
              "Let cool slightly before serving",
              "Serve immediately with dipping sauce"
            ],
            "Dessert": [
              "Preheat oven to required temperature",
              "Mix dry ingredients in a large bowl",
              "Add wet ingredients and combine until smooth",
              "Pour into prepared pan or mold",
              "Bake until golden and set in center",
              "Let cool completely before serving",
              "Garnish with fresh fruits or cream"
            ]
          };
          
          return baseInstructions[data.dishType] || baseInstructions["Main Course"];
        };
        
        recipe = {
          name: recipeName,
          area: data.cuisine,
          category: data.dishType,
          difficulty: difficulty,
          cookingTime: cookingTime,
          prepTime: prepTime,
          servings: servings,
          ingredients: extractedIngredients.length > 0 ? extractedIngredients : (analyzedIngredients.length > 0 ? analyzedIngredients.map(ing => ({
            name: ing.name,
            measure: ing.quantity || "As needed"
          })) : generateRealisticIngredients()),
          instructions: extractedInstructions.length > 0 ? extractedInstructions : generateRealisticInstructions(),
          nutritionalInfo: Object.keys(nutritionalInfo).length > 0 ? nutritionalInfo : {
            calories: "350",
            protein: "15g",
            carbs: "45g",
            fat: "12g",
            fiber: "3g"
          },
          cookingTips: cookingTips.length > 0 ? cookingTips : [
            "Taste and adjust seasoning as you cook",
            "Don't overcook the main ingredients",
            "Let the dish rest for a few minutes before serving"
          ],
          description: description
        };
      }

      // Generate recipe image (optional, non-blocking)
      let imageUrl = null;
      try {
        const imagePrompt = `${data.userPrompt}, ${recipe.name}`;
        const resImage = await fetch("/api/generate-recipe-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: imagePrompt }),
        });
        
        if (resImage.ok) {
          const imageResult = await resImage.json();
          imageUrl = imageResult.url;
          setRecipeImageUrl(imageResult.url);
        }
      } catch (imageError) {
        console.warn('Image generation failed:', imageError.message);
        // Continue without image - not critical
      }

      // Add image to recipe object
      const recipeWithImage = {
        ...recipe,
        image: imageUrl,
        imageUrl: imageUrl
      };

      setRecipe(recipeWithImage);

      setShowRecipe(true);
    } catch (err) {
      console.error('Recipe generation error:', err);
      setError(`Recipe generation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const dietaryDescriptions = {
    Vegetarian: "Suitable for those avoiding meat and fish.",
    Vegan: "Excludes all animal products, including dairy and eggs.",
    "Gluten-Free": "Avoids gluten, a protein found in wheat, barley, and rye. Suitable for people with celiac disease or gluten sensitivity.",
    "Dairy-Free": "Avoids milk and all dairy products, including cheese, butter, and yogurt.",
    "Nut-Free": "Excludes all tree nuts and peanuts. Important for those with nut allergies.",
    Halal: "Follows Islamic dietary laws. Prohibits pork and alcohol; meat must be prepared in a specific way (halal-certified).",
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-xl p-6 rounded-lg shadow-xl border space-y-4"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--text-secondary)'
      }}
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold font-dm-serif-display"
        style={{
          color: 'var(--accent)'
        }}>AI Recipe Generator</h2>
        <p className="text-sm"
        style={{
          color: 'var(--text-secondary)'
        }}>Powered by Sensay AI</p>
      </div>

      {/* Diet Planner Integration */}
      {dietMealInfo && (
        <div className="rounded-lg p-4 mb-4 border" style={{backgroundColor: 'rgba(255, 140, 0, 0.1)', borderColor: 'var(--text-secondary)'}}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🥗</span>
            <h3 className="font-semibold"
            style={{
              color: 'var(--accent)'
            }}>From Your Diet Plan</h3>
          </div>
          <div className="text-sm"
          style={{
            color: 'var(--text-secondary)'
          }}>
            <p><strong>Meal Type:</strong> {dietMealInfo.mealType}</p>
            {dietMealInfo.targetNutrition && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <span>Calories: {dietMealInfo.targetNutrition.calories}</span>
                <span>Protein: {dietMealInfo.targetNutrition.protein}g</span>
                <span>Carbs: {dietMealInfo.targetNutrition.carbs}g</span>
                <span>Fat: {dietMealInfo.targetNutrition.fat}g</span>
              </div>
            )}
          </div>
        </div>
      )}

      <ImageUpload
        onIngredientsAnalyzed={setAnalyzedIngredients}
        analyzedIngredients={analyzedIngredients}
      />

      <InputField
        label="Describe about dish:"
        name="userPrompt"
        register={register}
        watch={watch}
      />

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <SelectField
          label="Type of Dish:"
          name="dishType"
          options={["", "Appetizer", "Main Course", "Dessert", "Snack", "Beverage", "Breakfast", "Lunch", "Dinner", "Soup", "Salad", "Pasta", "Rice Dish", "Grilled", "Baked", "Fried", "Steamed", "Raw/Sushi", "Smoothie", "Cocktail"]}
          register={register}
        />

        <SelectField
          label="Cuisine Preference:"
          name="cuisine"
          options={["", "Italian", "Mexican", "Indian", "Chinese", "American", "Mediterranean", "Thai", "Japanese", "Korean", "French", "Spanish", "Greek", "Turkish", "Lebanese", "Indonesian", "Vietnamese", "Filipino", "Brazilian", "Peruvian", "Moroccan", "Ethiopian"]}
          register={register}
        />
      </div>

      <CheckboxField
        label="Dietary Restrictions:"
        name="dietaryRestrictions"
        options={["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal"]}
        register={register}
        descriptions={dietaryDescriptions}
      />

      <div className="flex flex-col sm:flex-row gap-4 w-full">
      <SelectField
        label="Spice Level:"
        name="spiceLevel"
        options={["", "Mild", "Medium", "Spicy", "Extra Spicy"]}
        register={register}
      />

        <SelectField
          label="Cooking Skill Level:"
          name="skillLevel"
          options={["", "Beginner", "Intermediate", "Advanced", "Expert"]}
          register={register}
        />
      </div>

      <SelectField
        label="Cooking Method:"
        name="cookingMethod"
        options={["", "Any", "Stovetop", "Oven", "Grill", "Slow Cooker", "Pressure Cooker", "Air Fryer", "No-Cook", "One-Pot", "Sheet Pan"]}
        register={register}
      />

      {/* Quick Preset Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium font-roboto-condensed"
      style={{
        color: 'var(--text-primary)'
      }}>Quick Presets:</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setValue('cuisine', 'Italian');
              setValue('dishType', 'Pasta');
              setValue('spiceLevel', 'Medium');
              setValue('skillLevel', 'Beginner');
            }}
            className="rounded-lg py-2 px-3 text-sm font-medium transition-colors border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--text-secondary)'
            }}
          >
            🍝 Italian Pasta
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('cuisine', 'Japanese');
              setValue('dishType', 'Raw/Sushi');
              setValue('spiceLevel', 'Mild');
              setValue('skillLevel', 'Advanced');
            }}
            className="rounded-lg py-2 px-3 text-sm font-medium transition-colors border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--text-secondary)'
            }}
          >
            🍣 Japanese Sushi
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('cuisine', 'Mexican');
              setValue('dishType', 'Main Course');
              setValue('spiceLevel', 'Spicy');
              setValue('skillLevel', 'Intermediate');
            }}
            className="rounded-lg py-2 px-3 text-sm font-medium transition-colors border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--text-secondary)'
            }}
          >
            🌶️ Mexican Spicy
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('cuisine', 'American');
              setValue('dishType', 'Breakfast');
              setValue('spiceLevel', 'Mild');
              setValue('skillLevel', 'Beginner');
            }}
            className="rounded-lg py-2 px-3 text-sm font-medium transition-colors border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--text-secondary)'
            }}
          >
            🥞 American Breakfast
          </button>
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full text-white rounded-lg py-3 px-4 font-medium transition-colors"
        style={{
          backgroundColor: 'var(--accent)',
          border: 'none'
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            👨‍🍳 AI is cooking...
          </>
        ) : (
          "👨‍🍳 Generate Recipe with Sensay AI"
        )}
      </button>
      
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}

export default GenerateRecipeForm;