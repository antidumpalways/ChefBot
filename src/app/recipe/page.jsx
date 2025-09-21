"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import { PlusIcon } from "@/components/Icons";
import { Clock, Users } from "lucide-react";
import supabase from "@/lib/supabase"; 

export default function ViewRecipePage() {
  const [showResults, setShowResults] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const handleSearchFocus = () => setShowResults(true);
  const handleBlur = () => setTimeout(() => setShowResults(false), 200);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // First, try to get recipe from localStorage (for community recipes)
        const storedRecipe = localStorage.getItem('current_recipe');
        if (storedRecipe) {
          const recipeData = JSON.parse(storedRecipe);
          setRecipe(recipeData);
          setLoading(false);
          // Clean up localStorage after use
          localStorage.removeItem('current_recipe');
          return;
        }

        // If no localStorage data, try to get from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');
        
        if (!recipeId) {
          setError('No recipe data found');
          setLoading(false);
          return;
        }

        // Try to get from saved_recipes first
        const { data: savedRecipe, error: savedError } = await supabase
          .from('saved_recipes')
          .select('*')
          .eq('recipe_id', recipeId)
          .single();

        if (savedRecipe && !savedError) {
          // Convert saved recipe to display format
          const recipeData = {
            id: savedRecipe.recipe_id,
            title: savedRecipe.title,
            name: savedRecipe.title,
            description: savedRecipe.description,
            image: savedRecipe.image,
            ingredients: savedRecipe.ingredients || [],
            instructions: savedRecipe.instructions || [],
            prepTime: savedRecipe.prep_time,
            servings: savedRecipe.servings,
            difficulty: savedRecipe.difficulty,
            cuisine: savedRecipe.cuisine,
            calories: savedRecipe.calories,
            type: 'Saved Recipe'
          };
          setRecipe(recipeData);
        } else {
          // Try to get from community_recipes
          const { data: communityRecipe, error: communityError } = await supabase
            .from('community_recipes')
            .select('*')
            .eq('id', recipeId)
            .single();

          if (communityRecipe && !communityError) {
            const recipeData = {
              id: communityRecipe.id,
              title: communityRecipe.title,
              name: communityRecipe.title,
              description: communityRecipe.description,
              image: communityRecipe.image,
              ingredients: communityRecipe.ingredients || [],
              instructions: communityRecipe.instructions || [],
              prepTime: communityRecipe.prep_time,
              servings: communityRecipe.servings,
              difficulty: communityRecipe.difficulty,
              cuisine: communityRecipe.cuisine,
              calories: communityRecipe.calories,
              type: 'Community Recipe',
              author_username: communityRecipe.author_username,
              created_at: communityRecipe.created_at
            };
            setRecipe(recipeData);
          } else {
            // Try to get from cooking_history
            const { data: historyRecipe, error: historyError } = await supabase
              .from('cooking_history')
              .select('*')
              .eq('recipe_id', recipeId)
              .single();

            if (historyRecipe && !historyError) {
              const recipeData = {
                id: historyRecipe.recipe_id,
                title: historyRecipe.recipe_title,
                name: historyRecipe.recipe_title,
                description: '',
                image: historyRecipe.recipe_image,
                ingredients: historyRecipe.recipe_data?.ingredients || [],
                instructions: historyRecipe.recipe_data?.instructions || [],
                prepTime: historyRecipe.recipe_data?.prepTime || '',
                servings: historyRecipe.recipe_data?.servings || '',
                difficulty: historyRecipe.recipe_data?.difficulty || '',
                cuisine: historyRecipe.recipe_data?.cuisine || '',
                calories: historyRecipe.recipe_data?.calories || null,
                type: 'Cooking History'
              };
              setRecipe(recipeData);
            } else {
              setError('Recipe not found');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Recipe Found</h1>
          <p className="text-base-content/60 mb-4">The recipe data could not be loaded.</p>
        </div>
      </div>
    );
  }

  return renderRecipe(recipe);

  function renderRecipe(recipeData) {
    return (
      <>
        <Navbar
          showResults={showResults}
          setShowResults={setShowResults}
          handleSearchFocus={handleSearchFocus}
          handleBlur={handleBlur}
        />
        <div
          className={`min-h-screen py-10 px-4 mt-20 bg-base-100 flex justify-center items-start transition-all duration-300 ${
            showResults ? "opacity-80 blur-sm" : "opacity-100"
          }`}
        >
          <div className="relative max-w-4xl w-full bg-base-200 shadow-xl rounded-xl">
            <div className="p-6 md:p-12">
              <header className="relative text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-base-content">
                  {recipeData.title}
                </h1>
                {recipeData.description && (
                  <p className="text-lg text-base-content/80 mt-2">
                    {recipeData.description}
                  </p>
                )}
                
                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-base-content/60">
                  {recipeData.cookTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{recipeData.cookTime}</span>
                    </div>
                  )}
                  {recipeData.servings && (
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{recipeData.servings} servings</span>
                    </div>
                  )}
                  {recipeData.difficulty && (
                    <div className="badge badge-primary">{recipeData.difficulty}</div>
                  )}
                </div>
              </header>
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
                <div className="md:w-1/2">
                  <img
                    src={recipeData.image || '/placeholder.svg'}
                    alt={recipeData.title || recipeData.name || 'Recipe'}
                    className="w-full h-auto rounded-lg shadow-md mb-4"
                    onError={(e) => {
                      const target = e.target;
                      if (target.src !== '/placeholder.svg') {
                        target.src = '/placeholder.svg';
                      }
                    }}
                  />
                  <div className="flex items-center gap-4">
                    <span className="badge badge-lg badge-accent">
                      {recipeData.type || 'Community'}
                    </span>
                    {recipeData.author && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={recipeData.author.avatar} 
                          alt={recipeData.author.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium">{recipeData.author.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:w-1/2">
                  <h2 className="text-2xl font-bold mb-4 flex items-center text-base-content">
                    <PlusIcon />
                    <span className="ml-2">Ingredients</span>
                  </h2>
                  
                  <div className="bg-base-100 rounded-lg p-4">
                    <ul className="space-y-2">
                      {recipeData.ingredients && recipeData.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary font-medium">•</span>
                          <span className="text-base-content">
                            {typeof ingredient === 'string' 
                              ? ingredient 
                              : `${ingredient.measure || ''} ${ingredient.name || ingredient}`.trim()
                            }
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <section id="instructions-section">
                <h2 className="text-2xl font-bold text-base-content mb-4">
                  Preparation Steps
                </h2>

                <div className="bg-base-100 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-4 text-base-content leading-relaxed">
                    {recipeData.instructions && recipeData.instructions.map((instruction, index) => (
                      <li key={index} className="pl-2">
                        <span className="ml-2">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            </div>
          </div>
        </div>
        <div className="bg-base-100">
          <Footer />
        </div>
      </>
    );
  }
}
