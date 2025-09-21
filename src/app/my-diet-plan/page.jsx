'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function MyDietPlanPage() {
  const { user } = useAuth();
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDietPlans();
    }
  }, [user]);

  const fetchDietPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('my_diet_plan')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDietPlans(data || []);
    } catch (error) {
      console.error('Error fetching diet plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDietPlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this diet plan?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('my_diet_plan')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setDietPlans(prev => prev.filter(plan => plan.id !== planId));
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error deleting diet plan:', error);
      alert('Failed to delete diet plan. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <p className="text-lg">Loading your diet plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-4">My Diet Plans</h1>
            <p className="text-center text-base-content/70 max-w-2xl mx-auto">
              View and manage your saved diet plans. Click on any plan to see the detailed weekly menu.
            </p>
          </div>

          {dietPlans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-semibold mb-2">No Diet Plans Yet</h3>
              <p className="text-base-content/70 mb-6">
                You haven't saved any diet plans yet. Generate your first diet plan to get started!
              </p>
              <a href="/diet-planner" className="btn btn-primary">
                Generate Diet Plan
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Diet Plans List */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Saved Plans</h2>
                {dietPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`card bg-base-100 shadow-md cursor-pointer transition-all ${
                      selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="card-title text-lg">
                            Diet Plan - {formatDate(plan.plan_date)}
                          </h3>
                          <p className="text-sm text-base-content/70">
                            Created: {formatDate(plan.created_at)}
                          </p>
                          {plan.diet_plan_data?.userProfile && (
                            <div className="mt-2 text-sm">
                              <span className="badge badge-outline">
                                {plan.diet_plan_data.userProfile.goal}
                              </span>
                              <span className="badge badge-outline ml-2">
                                {plan.diet_plan_data.userProfile.targetCalories} cal/day
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDietPlan(plan.id);
                          }}
                          className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Plan Details */}
              <div className="space-y-4">
                {selectedPlan ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold">
                        {formatDate(selectedPlan.plan_date)}
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
                          disabled={selectedDayIndex === 0}
                          className="btn btn-sm btn-outline"
                        >
                          ← Previous
                        </button>
                        <button
                          onClick={() => setSelectedDayIndex(Math.min(
                            (selectedPlan.diet_plan_data?.weeklyDietPlan?.days?.length || 1) - 1,
                            selectedDayIndex + 1
                          ))}
                          disabled={selectedDayIndex >= (selectedPlan.diet_plan_data?.weeklyDietPlan?.days?.length || 1) - 1}
                          className="btn btn-sm btn-outline"
                        >
                          Next →
                        </button>
                      </div>
                    </div>

                    {/* Day Navigation */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedPlan.diet_plan_data?.weeklyDietPlan?.days?.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedDayIndex(index)}
                          className={`btn btn-sm ${
                            selectedDayIndex === index ? 'btn-primary' : 'btn-outline'
                          } whitespace-nowrap`}
                        >
                          {day.dayName}
                        </button>
                      ))}
                    </div>

                    {/* Day Details */}
                    {selectedPlan.diet_plan_data?.weeklyDietPlan?.days?.[selectedDayIndex] && (
                      <div className="card bg-base-100 shadow-md">
                        <div className="card-body">
                          <h3 className="card-title text-xl mb-4">
                            {selectedPlan.diet_plan_data.weeklyDietPlan.days[selectedDayIndex].dayName}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedPlan.diet_plan_data.weeklyDietPlan.days[selectedDayIndex].meals?.map((meal, mealIndex) => (
                              <div key={mealIndex} className="card bg-base-200 shadow-sm">
                                <div className="card-body p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">
                                      {meal.type === 'breakfast' && '🌅'}
                                      {meal.type === 'lunch' && '☀️'}
                                      {meal.type === 'dinner' && '🌙'}
                                      {meal.type === 'snack' && '🍎'}
                                    </span>
                                    <h4 className="font-semibold capitalize">{meal.type}</h4>
                                  </div>
                                  
                                  <h5 className="font-medium text-lg mb-2">{meal.name}</h5>
                                  
                                  <div className="flex gap-2 mb-2 text-sm">
                                    <span>{meal.calories} cal</span>
                                    <span>{meal.protein}g protein</span>
                                    <span>{meal.carbs}g carbs</span>
                                    <span>{meal.fat}g fat</span>
                                  </div>
                                  
                                  {meal.ingredients && (
                                    <div className="mb-2">
                                      <p className="text-sm font-medium mb-1">Ingredients:</p>
                                      <ul className="text-sm text-base-content/70">
                                        {meal.ingredients.slice(0, 3).map((ingredient, idx) => (
                                          <li key={idx}>
                                            {typeof ingredient === 'string' 
                                              ? ingredient 
                                              : `${ingredient.amount || ''} ${ingredient.name || ingredient}`.trim()
                                            }
                                          </li>
                                        ))}
                                        {meal.ingredients.length > 3 && (
                                          <li className="text-primary">+{meal.ingredients.length - 3} more...</li>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {meal.instructions && (
                                    <div>
                                      <p className="text-sm font-medium mb-1">Instructions:</p>
                                      <p className="text-sm text-base-content/70">
                                        {meal.instructions.slice(0, 2).join(' ')}
                                        {meal.instructions.length > 2 && '...'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">👆</div>
                    <h3 className="text-xl font-semibold mb-2">Select a Diet Plan</h3>
                    <p className="text-base-content/70">
                      Click on any diet plan from the list to view its details.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
