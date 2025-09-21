import { z } from "zod";

/**
 * Schema for recipe ingredients
 * Each ingredient has a name and amount
 * Example: { name: "Sugar", amount: "2 tablespoons" }
 */
const ingredientSchema = z.object({
    name: z.string().describe('The name of the ingredient.'),
    amount: z.string().describe('The quantity of the ingredient.'),
}).describe('An object representing an ingredient.');

/**
 * Main recipe schema that defines the structure of recipe data
 * Used for type validation and API response formatting
 * Contains:
 * - name: Recipe title
 * - area: Cuisine region/style
 * - category: Type of dish
 * - ingredients: List of required ingredients
 * - steps: Ordered preparation instructions
 */
export const recipeSchema = z.object({
    recipe: z.object({
        name: z.string().describe('The name of the recipe.'),
        area: z.string().describe('The geographical region or style of cuisine associated with the recipe.'),
        category: z.string().describe('The category of the recipe, such as appetizer, main course, or dessert.'),
        ingredients: z.array(ingredientSchema).describe('A list of ingredients required for the recipe.'),
        steps: z.array(z.string()).describe('A list of steps to prepare the recipe.'),
        description: z.string().describe('A one-line summary of the dish.'),
    }).describe('The main recipe object.'),
});

/**
 * Schema for a single meal in the diet plan
 * Contains nutritional information and recipe details
 */
const mealSchema = z.object({
    name: z.string().describe('The name of the meal.'),
    type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).describe('The type of meal.'),
    calories: z.number().describe('Estimated calories for this meal.'),
    protein: z.number().describe('Protein content in grams.'),
    carbs: z.number().describe('Carbohydrate content in grams.'),
    fat: z.number().describe('Fat content in grams.'),
    fiber: z.number().optional().describe('Fiber content in grams.'),
    sodium: z.number().optional().describe('Sodium content in milligrams.'),
    ingredients: z.array(ingredientSchema).describe('List of ingredients for this meal.'),
    instructions: z.array(z.string()).describe('Step-by-step cooking instructions.'),
    healthBenefits: z.array(z.string()).optional().describe('Health benefits specific to user goals and conditions.'),
}).describe('A single meal in the diet plan.');

/**
 * Schema for user profile data
 * Contains calculated health metrics
 */
const userProfileSchema = z.object({
    bmi: z.number().describe('Body Mass Index calculated from height and weight.'),
    targetCalories: z.number().describe('Daily calorie target based on goals and activity level.'),
    bmr: z.number().describe('Basal Metabolic Rate in calories per day.'),
    tdee: z.number().describe('Total Daily Energy Expenditure in calories per day.'),
}).describe('User health profile with calculated metrics.');

/**
 * Schema for a single day in the weekly diet plan
 */
const daySchema = z.object({
    day: z.string().describe('The day of the week (e.g., "Monday", "Tuesday").'),
    date: z.string().describe('The date for this day (YYYY-MM-DD format).'),
    meals: z.array(mealSchema).describe('Array of meals for this day.'),
}).describe('A single day in the weekly diet plan.');

/**
 * Schema for AI-generated weekly diet plan
 * Provides a complete 7-day meal plan based on user health parameters and goals
 */
export const dietPlanSchema = z.object({
    userProfile: userProfileSchema.describe('User health profile with calculated metrics.'),
    weeklyDietPlan: z.object({
        startDate: z.string().describe('The start date for this weekly diet plan (YYYY-MM-DD format).'),
        totalCalories: z.number().describe('Total daily calorie target.'),
        totalProtein: z.number().describe('Total daily protein target in grams.'),
        totalCarbs: z.number().describe('Total daily carbohydrate target in grams.'),
        totalFat: z.number().describe('Total daily fat target in grams.'),
        days: z.array(daySchema).describe('Array of 7 days with different meals for each day.'),
        healthNotes: z.array(z.string()).optional().describe('Important health considerations and tips based on user conditions.'),
        hydrationGoal: z.string().describe('Daily water intake recommendation.'),
        exerciseRecommendation: z.string().describe('Exercise suggestion that complements the diet plan.'),
    }).describe('Complete weekly diet plan tailored to user health profile and goals.'),
});