"use client";

import BackButton from "@/components/BackButton";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { savedRecipesService } from "@/lib/supabaseService";
import ProtectedRoute from "@/components/ProtectedRoute";

interface SavedRecipe {
  id: string;
  recipe_id: string;
  title: string;
  description: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  servings: string;
  difficulty: string;
  cuisine: string;
  calories: number;
  created_at: string;
}

export default function FavoritePage() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth() as any;

  const handleSearchFocus = () => setShowResults(true);
  const handleBlur = () => setTimeout(() => setShowResults(false), 200);

  useEffect(() => {
    if (user) {
      loadSavedRecipes();
    }
  }, [user]);

  const loadSavedRecipes = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await savedRecipesService.getSavedRecipes(user.id);
      
      if (error) {
        throw error;
      }
      
      setSavedRecipes(data || []);
    } catch (err) {
      console.error('Error loading saved recipes:', err);
      setError('Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedRecipe = async (recipeId: string) => {
    if (!user) return;
    
    try {
      const { error } = await savedRecipesService.removeSavedRecipe(user.id, recipeId);
      
      if (error) {
        throw error;
      }
      
      // Remove from local state
      setSavedRecipes(prev => prev.filter(recipe => recipe.recipe_id !== recipeId));
    } catch (err) {
      console.error('Error removing saved recipe:', err);
      setError('Failed to remove recipe');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-base-100 relative">
          <BackButton fallbackUrl="/" />
          <Navbar 
            showResults={showResults}
            setShowResults={setShowResults}
            handleSearchFocus={handleSearchFocus}
            handleBlur={handleBlur}
          />
          <div className="container mx-auto md:mt-16 mt-28 px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-base-100 relative">
        <BackButton fallbackUrl="/" />
        
        <Navbar 
          showResults={showResults}
          setShowResults={setShowResults}
          handleSearchFocus={handleSearchFocus}
          handleBlur={handleBlur}
        />

        <div className={`container mx-auto md:mt-16 mt-28 px-4 py-8 transition-all duration-300 ${
          showResults ? "opacity-80 blur-sm" : "opacity-100"
        }`}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Your Saved Recipes
            </h1>
            <p className="text-lg text-base-content/70">
              All your favorite recipes in one place
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">
                Dismiss
              </button>
            </div>
          )}

          {savedRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-base-content mb-2">
                No saved recipes yet
              </h3>
              <p className="text-base-content/70 mb-6">
                Start exploring recipes and save your favorites!
              </p>
              <Link href="/ai" className="btn btn-primary">
                Generate Recipe
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <div key={recipe.id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                  <figure className="aspect-video">
                    <Image
                      src={recipe.image || "/placeholder.svg"}
                      alt={recipe.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </figure>
                  
                  <div className="card-body">
                    <h3 className="card-title text-base-content line-clamp-2">
                      {recipe.title}
                    </h3>
                    
                    {recipe.description && (
                      <p className="text-base-content/70 text-sm line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-base-content/70">
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        {recipe.prep_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👥</span>
                        {recipe.servings}
                      </div>
                      <div className={`badge ${
                        recipe.difficulty === "Easy" 
                          ? "badge-success" 
                          : recipe.difficulty === "Medium" 
                          ? "badge-warning" 
                          : "badge-error"
                      }`}>
                        {recipe.difficulty}
                      </div>
                    </div>

                    {recipe.cuisine && (
                      <div className="badge badge-outline mb-4">
                        {recipe.cuisine}
                      </div>
                    )}

                    <div className="card-actions justify-between">
                      <Link 
                        href={`/recipe?id=${recipe.recipe_id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Recipe
                      </Link>
                      <button
                        onClick={() => removeSavedRecipe(recipe.recipe_id)}
                        className="btn btn-error btn-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}