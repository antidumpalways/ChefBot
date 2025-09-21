"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../lib/supabase'; 

export default function DietPlannerPage() {
  const { user } = useAuth();
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "",
    activityLevel: "",
    goal: "",
    dietPreference:"",
    bloodSugar: "",
    bloodPressure: "",
    dietaryRestrictions: [],
    allergies: [],
    targetDate: new Date().toISOString().split('T')[0]
  });

  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [saving, setSaving] = useState(false);

  const [showResults, setShowResults] = useState(false);

  const handleSearchFocus = () => setShowResults(true);

  const handleBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  const handleSaveDietPlan = async () => {
    if (!user) {
      alert('Please sign in to save your diet plan!');
      return;
    }

    if (!dietPlan) {
      alert('No diet plan to save!');
      return;
    }

    setSaving(true);
    try {
      console.log('Saving diet plan...');
      console.log('User ID:', user.id);
      console.log('Diet plan data:', dietPlan);
      console.log('Plan date:', dietPlan.weeklyDietPlan?.startDate || selectedDate.toISOString().split('T')[0]);
      
      // Save the entire weekly diet plan
      const { data, error } = await supabase
        .from('my_diet_plan')
        .insert([
          {
            user_id: user.id,
            diet_plan_data: dietPlan,
            plan_date: dietPlan.weeklyDietPlan?.startDate || selectedDate.toISOString().split('T')[0]
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      console.log('Diet plan saved successfully:', data);
      alert('Weekly diet plan saved successfully!');
    } catch (error) {
      console.error('Error saving diet plan:', error);
      console.error('Error details:', error.message);
      console.error('Diet plan data:', dietPlan);
      alert(`Failed to save diet plan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e, field) => {
    const value = e.target.value;
    const array = value ? value.split(',').map(item => item.trim()) : [];
    setFormData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDietPlan(null);

    try {
      const apiEndpoint = '/api/generate-diet-plan';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          age: parseInt(formData.age)
        }),
      });

            const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate diet plan');
      }

      setDietPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 relative">
      {/* Back Button */}
      <BackButton fallbackUrl="/" />
      
      {/* Navigation */}
      <Navbar
        showResults={showResults}
        setShowResults={setShowResults}
        handleSearchFocus={handleSearchFocus}
        handleBlur={handleBlur}
      />

      <div className={`container mx-auto md:mt-16 mt-28 px-4 py-8 transition-all duration-300 ${
        showResults ? "opacity-80 blur-sm" : "opacity-100"
      }`}>
        <div className="text-center mb-8 mt-12 md:mt-0">
          <h1 className="text-4xl font-bold text-primary mb-4 font-dm-serif-display">
            🥗 AI Diet Planner
          </h1>
          <p className="text-lg text-base-content/70">
            Get personalized daily meal plans based on your health profile and fitness goals
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="badge badge-success badge-sm">🤖 Powered by Sensay AI</span>
            <span className="badge badge-info badge-sm">Real-time Generation</span>
          </div>
          <div className="mt-4">
            <Link href="/ai" className="btn btn-outline btn-sm">
              🤖 Generate Custom Recipes
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Your Health Profile</h2>



{/* Vegetarian Toggle */}
<div className="form-control">
  <label className="label cursor-pointer">
    <span className="label-text">Vegetarian Mode</span>
    <input
      type="checkbox"
      checked={isVegetarian}
      onChange={(e) => setIsVegetarian(e.target.checked)}
      className="toggle toggle-success"
    />
  </label>
  <div className="label">
    <span className="label-text-alt">
      {isVegetarian ? "Showing only vegetarian dishes" : "Showing all dishes"}
    </span>
  </div>
</div>     
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Height (cm)</span>
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      placeholder="175"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Weight (kg)</span>
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      placeholder="70"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Age</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      placeholder="25"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Gender</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Activity & Goals */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Activity Level</span>
                  </label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                    className="select select-bordered"
                    required
                  >
                    <option value="">Select Activity Level</option>
                    <option value="sedentary">Sedentary (little/no exercise)</option>
                    <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                    <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                    <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                    <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Fitness Goal</span>
                  </label>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="select select-bordered"
                    required
                  >
                    <option value="">Select Goal</option>
                    <option value="bulk">Bulk (Gain Muscle Mass)</option>
                    <option value="cut">Cut (Lose Fat)</option>
                    <option value="maintain">Maintain Current Weight</option>
                    <option value="general_health">General Health</option>
                  </select>
                </div>
                {/* Diet Preference Dropdown (added above Dietary Restrictions) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Diet Preference</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.dietPreference || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dietPreference: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select your diet preference
                    </option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                  <div className="label">
                  </div>
                </div>
                {/* Health Conditions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Blood Sugar Level</span>
                    </label>
                    <select
                      name="bloodSugar"
                      value={formData.bloodSugar}
                      onChange={handleInputChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="normal">Normal</option>
                      <option value="prediabetic">Prediabetic</option>
                      <option value="diabetic">Diabetic</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Blood Pressure</span>
                    </label>
                    <select
                      name="bloodPressure"
                      value={formData.bloodPressure}
                      onChange={handleInputChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="normal">Normal</option>
                      <option value="elevated">Elevated</option>
                      <option value="high_stage1">High Stage 1</option>
                      <option value="high_stage2">High Stage 2</option>
                    </select>
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Dietary Restrictions (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => handleArrayInputChange(e, 'dietaryRestrictions')}
                    className="input input-bordered"
                    placeholder="vegetarian, gluten-free, dairy-free"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Allergies (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => handleArrayInputChange(e, 'allergies')}
                    className="input input-bordered"
                    placeholder="nuts, shellfish, eggs"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Target Date</span>
                  </label>
                  <input
                    type="date"
                    name="targetDate"
                    value={formData.targetDate}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading
                    ? '👨‍🍳 Working... (30-60s)'
                    : 'Generate AI Diet Plan'
                  }
                </button>
              </form>

              {error && (
                <div className="alert alert-error mt-4">
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-primary font-dm-serif-display mb-2">AI Diet Planner</h2>
                <p className="text-lg text-neutral">Your Personalized Diet Plan</p>
                <p className="text-sm text-neutral/70">AI-Powered Nutrition Planning</p>
              </div>

              {!dietPlan && !loading && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-base-content/70">
                    Fill out your health profile to get your personalized diet plan
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="loading loading-spinner loading-lg text-primary mb-6"></div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary">Generating your personalized weekly diet plan...</h3>
                    <p className="text-base-content/70 max-w-md mx-auto">
                      Hang tight! Sensay AI is crafting a personalized diet plan just for you.
                    </p>
                    <div className="flex justify-center">
                      <div className="progress progress-primary w-80">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width: "75%"}}></div>
                      </div>
                    </div>
                    <p className="text-sm text-base-content/60">
                      This may take 30-60 seconds. If it takes longer, we'll show a sample plan.
                    </p>
                  </div>
                </div>
              )}

              {dietPlan && (
                <div className="space-y-6">
                  {/* Weekly Navigation */}
                  <div className="bg-base-100 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Your Weekly Diet Plan</h3>
                    
                    {/* Day Navigation */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dietPlan.weeklyDietPlan?.days?.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedDayIndex(index)}
                          className={`btn btn-sm ${
                            selectedDayIndex === index 
                              ? 'btn-primary' 
                              : 'btn-outline'
                          }`}
                        >
                          {day.day}
                        </button>
                      ))}
                    </div>
                    
                    {/* Selected Day Info */}
                    {dietPlan.weeklyDietPlan?.days?.[selectedDayIndex] && (
                      <div className="text-center mb-4">
                        <h4 className="font-semibold text-lg">
                          {dietPlan.weeklyDietPlan.days[selectedDayIndex].day}
                        </h4>
                        <p className="text-sm text-base-content/70">
                          {new Date(dietPlan.weeklyDietPlan.days[selectedDayIndex].date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-center space-y-3">
                      <button
                        onClick={handleSaveDietPlan}
                        disabled={saving}
                        className={`btn btn-primary ${saving ? 'loading' : ''}`}
                      >
                        {saving ? 'Saving...' : '💾 Save Weekly Diet Plan'}
                      </button>
                      <div>
                        <a href="/my-diet-plan" className="btn btn-outline btn-sm">
                          📋 View My Saved Plans
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* User Profile Summary */}
                  <div className="bg-base-100 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Your Profile</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>BMI: {dietPlan.userProfile?.bmi || 'N/A'}</span>
                      <span>Target Calories: {dietPlan.userProfile?.targetCalories || 'N/A'}</span>
                      <span>BMR: {dietPlan.userProfile?.bmr || 'N/A'}</span>
                      <span>TDEE: {dietPlan.userProfile?.tdee || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Diet Plan Overview */}
                  <div className="bg-base-100 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Daily Targets</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>Calories: {dietPlan.weeklyDietPlan?.totalCalories || 'N/A'}</span>
                      <span>Protein: {dietPlan.weeklyDietPlan?.totalProtein || 'N/A'}g</span>
                      <span>Carbs: {dietPlan.weeklyDietPlan?.totalCarbs || 'N/A'}g</span>
                      <span>Fat: {dietPlan.weeklyDietPlan?.totalFat || 'N/A'}g</span>
                    </div>
                  </div>

                  {/* Selected Day's Meals */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">
                      {dietPlan.weeklyDietPlan?.days?.[selectedDayIndex]?.day || 'Today'}'s Meals
                    </h3>
                    
                    {/* Display meals from selected day */}
                    {(dietPlan.weeklyDietPlan?.days?.[selectedDayIndex]?.meals || []).map((meal, index) => (
                      <div key={index} className="bg-base-100 p-4 rounded-lg">
                        <h4 className="font-semibold text-md capitalize mb-2">
                          {meal.type} - {meal.name}
                        </h4>
                        <div className="text-sm text-base-content/70 mb-2">
                          {meal.calories} cal | {meal.protein}g protein | {meal.carbs}g carbs | {meal.fat}g fat
                          {meal.fiber && ` | ${meal.fiber}g fiber`}
                          {meal.sodium && ` | ${meal.sodium}mg sodium`}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <div className="collapse collapse-arrow bg-base-200 flex-1">
                            <input type="checkbox" />
                            <div className="collapse-title text-sm font-medium">
                              View Recipe & Instructions
                            </div>
                            <div className="collapse-content text-sm">
                              <div className="mb-2">
                                <strong>Ingredients:</strong>
                                <ul className="list-disc list-inside ml-2">
                                  {meal.ingredients.map((ing, i) => (
                                    <li key={i}>{ing.amount} {ing.name}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="mb-2">
                                <strong>Instructions:</strong>
                                <ol className="list-decimal list-inside ml-2">
                                  {meal.instructions.map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                              {meal.healthBenefits && meal.healthBenefits.length > 0 && (
                                <div>
                                  <strong>Health Benefits:</strong>
                                  <ul className="list-disc list-inside ml-2">
                                    {meal.healthBenefits.map((benefit, i) => (
                                      <li key={i}>{benefit}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              // Navigate to recipe generator with meal details
                              const mealPrompt = `Create a detailed recipe for ${meal.name} - a ${meal.type} meal. 
                              Target nutrition: ${meal.calories} calories, ${meal.protein}g protein, ${meal.carbs}g carbs, ${meal.fat}g fat.
                              Include these ingredients: ${meal.ingredients.map(ing => `${ing.amount} ${ing.name}`).join(', ')}.`;
                              
                              // Store meal data for recipe generation
                              sessionStorage.setItem('dietMealData', JSON.stringify({
                                prompt: mealPrompt,
                                mealType: meal.type,
                                targetNutrition: {
                                  calories: meal.calories,
                                  protein: meal.protein,
                                  carbs: meal.carbs,
                                  fat: meal.fat
                                }
                              }));
                              
                              // Navigate to AI recipe page
                              window.location.href = '/ai';
                            }}
                          >
                            🤖 Generate Recipe
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Health Notes */}
                  {dietPlan.weeklyDietPlan?.healthNotes && dietPlan.weeklyDietPlan.healthNotes.length > 0 && (
                    <div className="bg-base-100 p-4 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">Health Notes</h3>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {dietPlan.weeklyDietPlan.healthNotes.map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Additional Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-base-100 p-4 rounded-lg">
                      <h3 className="font-bold text-md mb-2">💧 Hydration</h3>
                      <p className="text-sm">{dietPlan.weeklyDietPlan?.hydrationGoal}</p>
                    </div>
                    <div className="bg-base-100 p-4 rounded-lg">
                      <h3 className="font-bold text-md mb-2">🏃‍♂️ Exercise</h3>
                      <p className="text-sm">{dietPlan.weeklyDietPlan?.exerciseRecommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}