"use client";

import { useState, useEffect } from "react";
import { PlusIcon2, PlusIcon } from "@/components/Icons";
import TextToSpeech from "./TextToSpeech";
import SaveRecipeButton from "./SaveRecipeButton";
import ShareRecipeButton from "./ShareRecipeButton";
import { useCookingHistory } from "../hooks/useCookingHistory";

/**
 * AiRecipe Component
 * 
 * Enhanced component for displaying Sensay AI-generated recipes
 * Features interactive elements and better data handling
 * 
 * Props:
 * @param {Object} recipe - Recipe data from Sensay API
 * @param {Function} setShowRecipe - Controls visibility of the recipe display
 * @param {string} recipeImageUrl - URL of the generated recipe image
 */
export default function AiRecipe({ recipe, setShowRecipe, recipeImageUrl }) {
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { trackRecipeGeneration } = useCookingHistory();
  const [activeStep, setActiveStep] = useState(0);

  // Track recipe generation in cooking history
  useEffect(() => {
    if (recipe) {
      trackRecipeGeneration(recipe);
    }
  }, [recipe, trackRecipeGeneration]);

  // Validate recipe data on mount
  useEffect(() => {
    if (!recipe) {
      setError("Recipe data is unavailable. Please try generating a new recipe.");
      return;
    }
    
    // Check for required fields with flexible structure
    const hasName = recipe.name;
    const hasIngredients = recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0;
    const hasInstructions = (recipe.instructions && Array.isArray(recipe.instructions)) || 
                           (recipe.steps && Array.isArray(recipe.steps));
    
    if (!hasName || !hasIngredients || !hasInstructions) {
      setError("Recipe data is incomplete. Some information may be missing.");
    }
  }, [recipe]);

  if (error) {
    return (
      <div className="max-w-96 md:max-w-7xl w-full bg-base-100 text-base-content shadow-md rounded-lg overflow-hidden p-10">
        <button
          className="absolute top-10 right-10 btn btn-sm btn-secondary"
          onClick={() => setShowRecipe(false)}
        >
          ✕
        </button>
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{error}</span>
        </div>
        <div className="mt-4 text-center">
          <button 
            className="btn btn-primary"
            onClick={() => setShowRecipe(false)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null; 
  }

  // Handle both instructions and steps arrays
  const instructions = recipe.instructions || recipe.steps || [];
  const ingredients = recipe.ingredients || [];


  return (
    <div className="max-w-96 md:max-w-7xl w-full shadow-md rounded-lg overflow-hidden relative"
    style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <button
        className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost z-10"
        onClick={() => setShowRecipe(false)}
      >
        ✕
      </button>
      
      <div className="px-6 md:px-12 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm text-primary font-medium font-roboto-condensed">Sensay Generated Recipe</span>
            <span className="badge badge-success badge-sm">Sensay AI</span>
          </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 font-dm-serif-display"
        style={{
          color: 'var(--accent)'
        }}>
          {recipe.name} 🍲
        </h1>
        {recipe.description && (
          <p className="max-w-2xl mx-auto mb-4"
          style={{
            color: 'var(--text-secondary)'
          }}>
            {recipe.description}
          </p>
        )}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {recipe.area && <span className="badge badge-primary">{recipe.area}</span>}
            {recipe.category && <span className="badge badge-success">{recipe.category}</span>}
            <span className="badge badge-info">{ingredients.length} Ingredients</span>
            <span className="badge badge-warning">{instructions.length} Steps</span>
          </div>
          
          {/* Recipe Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {recipe.difficulty && (
              <div className="border rounded-lg p-3 text-center"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--text-secondary)'
              }}>
                <div className="text-2xl mb-1">
                  {recipe.difficulty === 'Easy' ? '🟢' : recipe.difficulty === 'Medium' ? '🟡' : '🔴'}
                </div>
                <div className="text-sm font-medium font-roboto-condensed"
                style={{
                  color: 'var(--text-primary)'
                }}>Difficulty</div>
                <div className="text-xs"
                style={{
                  color: 'var(--text-secondary)'
                }}>{recipe.difficulty}</div>
              </div>
            )}
            {recipe.cookingTime && (
              <div className="border rounded-lg p-3 text-center"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--text-secondary)'
              }}>
                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-sm font-medium font-roboto-condensed"
                style={{
                  color: 'var(--text-primary)'
                }}>Cooking</div>
                <div className="text-xs"
                style={{
                  color: 'var(--text-secondary)'
                }}>{recipe.cookingTime}</div>
              </div>
            )}
            {recipe.prepTime && (
              <div className="border rounded-lg p-3 text-center"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--text-secondary)'
              }}>
                <div className="text-sm font-medium font-roboto-condensed"
                style={{
                  color: 'var(--text-primary)'
                }}>Prep</div>
                <div className="text-xs"
                style={{
                  color: 'var(--text-secondary)'
                }}>{recipe.prepTime}</div>
              </div>
            )}
            {recipe.servings && (
              <div className="border rounded-lg p-3 text-center"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--text-secondary)'
              }}>
                <div className="text-2xl mb-1">👥</div>
                <div className="text-sm font-medium font-roboto-condensed"
                style={{
                  color: 'var(--text-primary)'
                }}>Servings</div>
                <div className="text-xs"
                style={{
                  color: 'var(--text-secondary)'
                }}>{recipe.servings}</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image and Info Section */}
          <div className="space-y-6">
            {recipeImageUrl ? (
              <div className="relative">
                <img
                  src={recipeImageUrl}
                  alt={recipe.name}
                  className="w-full h-auto max-h-80 object-contain rounded-lg shadow-lg bg-gray-100"
                />
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  Sensay Generated
                </div>
              </div>
            ) : (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🍽️</div>
                  <p className="text-base-content/60">Recipe Image</p>
                </div>
              </div>
            )}

            {/* Ingredients Section */}
            <div className="border rounded-lg p-6"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--text-secondary)'
            }}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center font-dm-serif-display"
              style={{
                color: 'var(--accent)'
              }}>
                <PlusIcon />
                <span className="ml-2">Ingredients</span>
              </h2>
              {ingredients.length > 0 ? (
                <div className="space-y-2">
                  {ingredients.map((ingredient, index) => {
                    // Handle different ingredient formats
                    const name = ingredient.name || ingredient;
                    const measure = ingredient.measure || ingredient.amount || "As needed";
                    
                    return (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0"
                      style={{
                        borderColor: 'var(--text-secondary)'
                      }}>
                        <span className="font-medium"
                        style={{
                          color: 'var(--text-primary)'
                        }}>{name}</span>
                        <span style={{
                          color: 'var(--accent)'
                        }}>{measure}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4"
                style={{
                  color: 'var(--text-secondary)'
                }}>
                  No ingredients available.
                </div>
              )}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="space-y-6">
            <div className="border rounded-lg p-6"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--text-secondary)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center font-dm-serif-display"
                style={{
                  color: 'var(--accent)'
                }}>
                  <PlusIcon2 />
                  <span className="ml-2">Instructions</span>
                </h2>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Collapse' : 'Expand All'}
                </button>
              </div>
              
              {instructions.length > 0 ? (
                <div className="space-y-4">
                  {instructions.map((instruction, index) => {
                    // Clean up instruction text
                    const cleanedInstruction = typeof instruction === 'string' 
                      ? instruction.replace(/^\s*\d+([.)]?)/, "").trim()
                      : String(instruction).trim();
                    
                    if (!cleanedInstruction) return null;
                    
                    return (
                      <div 
                        key={index} 
                        className={`collapse collapse-plus bg-base-100 ${
                          isExpanded || activeStep === index ? 'collapse-open' : ''
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isExpanded || activeStep === index}
                          onChange={() => setActiveStep(activeStep === index ? -1 : index)}
                        />
                        <div className="collapse-title text-lg font-medium flex items-center font-roboto-condensed"
                        style={{
                          color: 'var(--text-primary)'
                        }}>
                          <span className="badge badge-primary mr-3">{index + 1}</span>
                          Step {index + 1}
                        </div>
                        <div className="collapse-content">
                          <p className="leading-relaxed"
                          style={{
                            color: 'var(--text-secondary)'
                          }}>
                            {cleanedInstruction}
                          </p>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                  
                  {/* Text to Speech for Instructions */}
                  <div className="mt-6 pt-4 border-t"
                  style={{
                    borderColor: 'var(--text-secondary)'
                  }}>
                    <TextToSpeech 
                      sentences={instructions.map(inst => 
                        typeof inst === 'string' 
                          ? inst.replace(/^\s*\d+([.)]?)/, "").trim()
                          : String(inst).trim()
                      ).filter(Boolean)} 
                      onHighlightChange={(index) => setActiveStep(index)} 
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8"
                style={{
                  color: 'var(--text-secondary)'
                }}>
                  <div className="text-4xl mb-2">📝</div>
                  <p>No instructions available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nutritional Info and Cooking Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Nutritional Info */}
          {recipe.nutritionalInfo && Object.keys(recipe.nutritionalInfo).length > 0 && (
            <div className="border rounded-lg p-6"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--text-secondary)'
            }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center font-dm-serif-display"
              style={{
                color: 'var(--accent)'
              }}>
                🥗 Nutritional Info (per serving)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {recipe.nutritionalInfo.calories && (
                  <div className="text-center">
                    <div className="text-2xl font-bold"
                    style={{
                      color: 'var(--accent)'
                    }}>{recipe.nutritionalInfo.calories}</div>
                    <div className="text-sm"
                    style={{
                      color: 'var(--text-secondary)'
                    }}>Calories</div>
                  </div>
                )}
                {recipe.nutritionalInfo.protein && (
                  <div className="text-center">
                    <div className="text-2xl font-bold"
                    style={{
                      color: 'var(--accent)'
                    }}>{recipe.nutritionalInfo.protein}</div>
                    <div className="text-sm"
                    style={{
                      color: 'var(--text-secondary)'
                    }}>Protein</div>
                  </div>
                )}
                {recipe.nutritionalInfo.carbs && (
                  <div className="text-center">
                    <div className="text-2xl font-bold"
                    style={{
                      color: 'var(--accent)'
                    }}>{recipe.nutritionalInfo.carbs}</div>
                    <div className="text-sm"
                    style={{
                      color: 'var(--text-secondary)'
                    }}>Carbs</div>
                  </div>
                )}
                {recipe.nutritionalInfo.fat && (
                  <div className="text-center">
                    <div className="text-2xl font-bold"
                    style={{
                      color: 'var(--accent)'
                    }}>{recipe.nutritionalInfo.fat}</div>
                    <div className="text-sm"
                    style={{
                      color: 'var(--text-secondary)'
                    }}>Fat</div>
                  </div>
                )}
                {recipe.nutritionalInfo.fiber && (
                  <div className="text-center">
                    <div className="text-2xl font-bold"
                    style={{
                      color: 'var(--accent)'
                    }}>{recipe.nutritionalInfo.fiber}</div>
                    <div className="text-sm"
                    style={{
                      color: 'var(--text-secondary)'
                    }}>Fiber</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cooking Tips */}
          {recipe.cookingTips && recipe.cookingTips.length > 0 && (
            <div className="border rounded-lg p-6"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--text-secondary)'
            }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center font-dm-serif-display"
              style={{
                color: 'var(--accent)'
              }}>
                💡 Cooking Tips
              </h3>
              <div className="space-y-3">
                {recipe.cookingTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-lg"
                    style={{
                      color: 'var(--accent)'
                    }}>💡</div>
                    <p className="text-sm"
                    style={{
                      color: 'var(--text-secondary)'
                    }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4 justify-center"
        style={{
          borderColor: 'var(--text-secondary)'
        }}>
          <SaveRecipeButton 
            recipe={recipe}
            className="btn btn-primary"
            showText={true}
          />
          <ShareRecipeButton 
            recipe={recipe}
            className="btn btn-secondary"
            showText={true}
          />
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => {
              // Print recipe
              window.print();
            }}
          >
            🖨️ Print Recipe
          </button>
        </div>
      </div>
    </div>
  );
}