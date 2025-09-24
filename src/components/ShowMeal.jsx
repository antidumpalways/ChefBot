"use client";

import { PlusIcon, YoutubeIcon } from "@/components/Icons";
import { PlayIcon, PauseIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { savedRecipesService } from "@/lib/supabaseService";

// --- Self-contained helper components ---
function HighlightedSentence({ text, isActive, wordRange }) {
  if (!isActive || !wordRange) {
    return <span>{text}</span>;
  }

  const { startChar, endChar } = wordRange;
  const before = text.substring(0, startChar);
  const highlighted = text.substring(startChar, endChar);
  const after = text.substring(endChar);

  return (
    <span>
      {before}
      <span className="speaking-word">{highlighted}</span>
      {after}
    </span>
  );
}

function HighlightedIngredient({ text, temp, isActive, wordRange }) {
  if (!isActive || !wordRange) {
    return <span>{text}</span>;
  }
  const { startChar, endChar } = wordRange;
  const cellEndPos = temp + text.length;

  if (endChar <= temp || startChar >= cellEndPos) {
    return <span>{text}</span>;
  }

  const localStartChar = Math.max(0, startChar - temp);
  const localEndChar = Math.min(text.length, endChar - temp);

  const before = text.substring(0, localStartChar);
  const highlighted = text.substring(localStartChar, localEndChar);
  const after = text.substring(localEndChar);

  return (
    <span>
      {before}
      <span className="speaking-word">{highlighted}</span>
      {after}
    </span>
  );
}
function IngredientsTable({ mealData, activeIngRange }) {
  const ingredients = useMemo(
    () =>
      Object.keys(mealData)
        .map((key) => {
          if (key.startsWith("strIngredient") && mealData[key]) {
            const num = key.slice(13);
            if (mealData[`strMeasure${num}`])
              return {
                measure: mealData[`strMeasure${num}`],
                name: mealData[key],
              };
          }
          return null;
        })
        .filter(Boolean),
    [mealData]
  );
  return (
    <div className="overflow-x-auto mt-2">
      <table className="table w-full">
        <thead>
          <tr className="text-left">
            <th className="p-2 w-1/3 text-sm font-semibold text-primary font-roboto-condensed">
              Quantity
            </th>
            <th className="p-2 text-sm font-semibold text-primary font-roboto-condensed">
              Ingredient
            </th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing, i) => (
            <tr key={i} className="border-t border-base-300 hover:bg-base-200">
              <td className="p-2 font-medium text-secondary">
                <HighlightedIngredient
                  text={ing.measure}
                  temp={0}
                  isActive={i == activeIngRange.sentenceIndex}
                  wordRange={activeIngRange}
                />
              </td>
              <td className="p-2 text-base-content">
                <HighlightedIngredient
                  text={ing.name}
                  temp={ing.measure.length + 1}
                  isActive={i == activeIngRange.sentenceIndex}
                  wordRange={activeIngRange}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- The Main Page Component ---
function ShowMeal({ URL }) {
  const [mealData, setMealData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const hasLoadedRef = useRef(false);

  const handleSearchFocus = () => setShowResults(true);
  const handleBlur = () => setTimeout(() => setShowResults(false), 200);

  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const { data } = await savedRecipesService.getSavedRecipes(user.id);
          setFavorites(data || []);
        } catch (error) {
          console.error("Error loading favorites:", error);
        }
      } else {
        // Clear favorites when user logs out
        setFavorites([]);
      }
    };
    loadFavorites();
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const toggleFavorite = async (meal) => {
    if (!user) {
      alert('Please sign in to save recipes!');
      return;
    }

    try {
      console.log('Toggle favorite for meal:', meal.idMeal);
      console.log('Current favorites:', favorites);
      
      const isCurrentlyFavorite = favorites.some((f) => f.recipe_id === meal.idMeal);
      console.log('Is currently favorite:', isCurrentlyFavorite);
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        console.log('Removing from favorites...');
        await savedRecipesService.removeSavedRecipe(meal.idMeal);
        setFavorites(favorites.filter((f) => f.recipe_id !== meal.idMeal));
        console.log('Removed from favorites');
      } else {
        // Add to favorites
        console.log('Adding to favorites...');
        const recipeData = {
          recipe_id: meal.idMeal,
          title: meal.strMeal,
          description: meal.strInstructions?.substring(0, 200) || '',
          image: meal.strMealThumb,
          imageUrl: meal.strMealThumb,
          ingredients: Object.keys(meal)
            .filter(key => key.startsWith('strIngredient') && meal[key])
            .map(key => meal[key]),
          instructions: meal.strInstructions || '',
          prep_time: '30', // Default value
          servings: '4', // Default value
          difficulty: 'Medium', // Default value
          cuisine: meal.strArea || 'International',
          calories: '300' // Default value
        };
        
        console.log('Recipe data to save:', recipeData);
        const result = await savedRecipesService.saveRecipe(user.id, recipeData);
        console.log('Save result:', result);
        
        setFavorites([...favorites, { recipe_id: meal.idMeal, ...recipeData }]);
        console.log('Added to favorites');
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  const isFavorite = (idMeal) => favorites.some((f) => f.recipe_id === idMeal);

  // --- Instruction TTS - Coming Soon ---
  const [playerState, setPlayerState] = useState("idle");
  const [activeWordRange, setActiveWordRange] = useState({
    sentenceIndex: -1,
    startChar: -1,
    endChar: -1,
  });
   const [ingredientPlayerState, setIngredientPlayerState] = useState("idle");
  const [activeIngRange, setActiveIngRange] = useState({
    sentenceIndex: -1,
    startChar: -1,
    endChar: -1,
  });
  const utterances = useRef([]);

  const instructionSentences = useMemo(() => {
    if (!mealData?.strInstructions) return [];
    return mealData.strInstructions
      .split(/\r?\n/)
      .map((s) => s.replace(/^\s*\d+([.)])?\s*/, "").trim())
      .filter(Boolean);
  }, [mealData]);

  const allergenKeywords = [
    "milk",
    "cheese",
    "butter",
    "cream",
    "egg",
    "peanut",
    "almond",
    "cashew",
    "walnut",
    "pecan",
    "hazelnut",
    "wheat",
    "barley",
    "rye",
    "soy",
    "soybean",
    "shrimp",
    "prawn",
    "crab",
    "lobster",
    "clam",
    "mussel",
    "oyster",
    "fish",
  ];

  const detectedAllergens = useMemo(() => {
    if (!mealData) return [];
    const ingredients = Object.keys(mealData)
      .filter((k) => k.startsWith("strIngredient") && mealData[k])
      .map((k) => mealData[k].toLowerCase());

    return allergenKeywords.filter((allergen) =>
      ingredients.some((ing) => ing.includes(allergen))
    );
  }, [mealData]);

  // TTS feature is coming soon
  useEffect(() => {
    // Text-to-speech feature is coming soon
    console.log("Text-to-speech feature is coming soon!");
  }, [instructionSentences]);

  const handlePlay = useCallback(() => {
    // Text-to-speech feature is coming soon
    alert("🔊 Text-to-speech feature is coming soon! Stay tuned for updates.");
  }, [playerState, ingredientPlayerState]);

  const handlePause = useCallback(() => {
    // Text-to-speech feature is coming soon
    alert("🔊 Text-to-speech feature is coming soon! Stay tuned for updates.");
  }, [playerState]);

  // --- Fetch Random Meal ---
  const fetchRandomMeal = useCallback(() => {
    console.log('fetchRandomMeal called - URL:', URL);
    setIsLoading(true);
    fetch(URL)
      .then((res) => res.json())
      .then((data) => {
        console.log('Random meal fetched:', data.meals[0]?.strMeal);
        setMealData(data.meals[0]);
        setIsLoading(false);
        hasLoadedRef.current = true;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, [URL]);

  const handleRestart = useCallback(() => {
    // Fetch new random meal instead of restarting speech
    console.log('handleRestart called - manual refresh');
    fetchRandomMeal();
  }, [fetchRandomMeal]);

  // --- Ingredient TTS ---
  const ingredientSentences = useMemo(() => {
    if (!mealData) return [];
    return Object.keys(mealData)
      .map((key) => {
        if (key.startsWith("strIngredient") && mealData[key]) {
          const num = key.slice(13);
          const measure = mealData[`strMeasure${num}`];
          if (measure) return `${measure.trim()} ${mealData[key].trim()}`;
        }
        return null;
      })
      .filter(Boolean);
  }, [mealData]);

 
  const ingredientUtterances = useRef([]);

  // TTS feature is coming soon
  useEffect(() => {
    // Text-to-speech feature is coming soon
    console.log("Text-to-speech feature is coming soon!");
  }, [ingredientSentences]);

  const handleIngredientPlay = useCallback(() => {
    // Text-to-speech feature is coming soon
    alert("🔊 Text-to-speech feature is coming soon! Stay tuned for updates.");
  }, [ingredientPlayerState, playerState]);

  const handleIngredientPause = useCallback(() => {
    // Text-to-speech feature is coming soon
    alert("🔊 Text-to-speech feature is coming soon! Stay tuned for updates.");
  }, [ingredientPlayerState]);

  const handleIngredientRestart = useCallback(() => {
    // Fetch new random meal instead of restarting speech
    console.log('handleIngredientRestart called - manual refresh');
    fetchRandomMeal();
  }, [fetchRandomMeal]);

  useEffect(() => {
    // Only fetch random meal on component mount, not on re-renders
    if (!hasLoadedRef.current) {
      console.log('Initial load - fetching random meal');
      fetchRandomMeal();
    } else {
      console.log('Component re-render - not fetching random meal');
    }
  }, []); // Empty dependency array - only run on mount

  if (!mealData) {
    return (
      <>
        <Navbar
          showResults={showResults}
          setShowResults={setShowResults}
          handleSearchFocus={handleSearchFocus}
          handleBlur={handleBlur}
        />
        <div className={`min-h-screen mt-20 flex bg-base-100 p-4 transition-all duration-300 ${
          showResults ? "opacity-80 blur-sm" : "opacity-100"
        }`}>
          <div className="max-w-4xl w-full p-12 my-6 skeleton bg-base-200 rounded-xl shadow-md">
            <div className="animate-pulse">
              <div className="h-10 bg-base-300 rounded-md w-60 mx-auto mb-4"></div>
              <div className="h-6 bg-base-300 rounded-md w-40 mx-auto mb-10"></div>
              <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/2">
                  <div className="h-80 bg-base-300 rounded-lg"></div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <div className="h-8 bg-base-300 rounded-md w-40"></div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 bg-base-300 rounded-md"></div>
                  ))}
                </div>
              </div>
              <div className="h-8 bg-base-300 rounded-md w-40 mt-6"></div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-base-300 my-2 rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar
        showResults={showResults}
        setShowResults={setShowResults}
        handleSearchFocus={handleSearchFocus}
        handleBlur={handleBlur}
      />
      <div className={`min-h-screen py-10 mt-20 bg-base-100 transition-all duration-300 ${
        showResults ? "opacity-80 blur-sm" : "opacity-100"
      }`}>
        <div className="container-content">
          <div className="relative w-full bg-base-200 shadow-xl rounded-xl">
            <div className="p-6 md:p-12">
            <header className="relative text-center mb-8">
              <button
                onClick={() =>
                  toggleFavorite({
                    idMeal: mealData.idMeal,
                    strMeal: mealData.strMeal,
                    strMealThumb: mealData.strMealThumb,
                  })
                }
                className="absolute top-0 right-0 bg-black text-white rounded-full p-2 text-lg hover:bg-black hover:text-black transition"
                aria-label="Toggle favorite"
              >
                {isFavorite(mealData.idMeal) ? "💖" : "🤍"}
              </button>
              <h1 className="text-3xl md:text-5xl font-bold text-base-content font-dm-serif-display">
                {mealData.strMeal}
              </h1>
              <p className="text-lg text-primary mt-2">
                {mealData.strArea} Cuisine
              </p>
              {detectedAllergens.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {detectedAllergens.map((allergen) => (
                    <span
                      key={allergen}
                      className="badge badge-sm badge-error text-white"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              )}
            </header>
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
              <div className="md:w-1/2">
                <img
                  src={mealData.strMealThumb}
                  alt={mealData.strMeal}
                  className="w-full h-auto rounded-lg shadow-md mb-4"
                />
                <div className="flex items-center gap-4">
                  <span className="badge badge-lg badge-accent">
                    {mealData.strCategory}
                  </span>
                  {mealData.strYoutube && (
                    <Link
                      href={mealData.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-error btn-sm gap-2"
                    >
                      <YoutubeIcon /> Watch
                    </Link>
                  )}
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold mb-2 flex items-center justify-between text-base-content font-dm-serif-display">
                  <div className="flex items-center">
                    <PlusIcon />
                    <span className="ml-2">Ingredients</span>
                  </div>
                  <div className="flex items-center gap-2 p-1 border border-base-300 rounded-full bg-base-200">
                    <button
                      onClick={handleIngredientRestart}
                      className="btn btn-ghost btn-circle"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="loading loading-spinner loading-sm"></div>
                      ) : (
                        <ArrowPathIcon className="h-5 w-5 text-base-content/60" />
                      )}
                    </button>
                  </div>
                </h2>
                <IngredientsTable
                  mealData={mealData}
                  activeIngRange={activeIngRange}
                />
              </div>
            </div>

            <section id="instructions-section">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-base-content font-dm-serif-display">
                  Preparation Steps
                </h2>
                <div className="flex items-center gap-2 p-1 border border-base-300 rounded-full bg-base-200">
                  <button
                    onClick={handleRestart}
                    className="btn btn-ghost btn-circle"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="loading loading-spinner loading-sm"></div>
                    ) : (
                      <ArrowPathIcon className="h-5 w-5 text-base-content/60" />
                    )}
                  </button>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-4 text-base-content leading-relaxed">
                {instructionSentences.map((sentence, index) => (
                  <li key={index}>
                    <HighlightedSentence
                      text={sentence}
                      isActive={index === activeWordRange.sentenceIndex}
                      wordRange={activeWordRange}
                    />
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
        </div>
      </div>
      <div className="bg-base-100">
        <Footer />
      </div>
    </>
  );
}

export default ShowMeal;
