"use client";

import AiRecipe from "@/components/AiRecipe";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import GenerateRecipeForm from "@/components/GenerateRecipeForm";
import Navbar from "@/components/Navbar";
import { useRef, useState, useEffect } from "react";

function Page() {
  const [recipe, setRecipe] = useState(null);
  const [recipeImageUrl, setRecipeImageUrl] = useState(null);
  const [showRecipe, setShowRecipe] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [nutrition, setNutrition] = useState(null);
const [nutritionInput, setNutritionInput] = useState("");
const [loadingNutrition, setLoadingNutrition] = useState(false);
const [showNutrition, setShowNutrition] = useState(false);


  const formResetRef = useRef();

  const handleSearchFocus = () => setShowResults(true);
  const handleBlur = () => setTimeout(() => setShowResults(false), 200);

  // Handle hash scroll to nutrition AI section
  useEffect(() => {
    if (window.location.hash === '#nutrition-ai') {
      setTimeout(() => {
        const element = document.getElementById('nutrition-ai');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const handleReset = () => {
    setRecipe(null);
    setShowRecipe(false);
    setRecipeImageUrl(null);

    if (formResetRef.current) {
      formResetRef.current();
    }
  };
  
  const fetchNutrition = async () => {
  if (!nutritionInput.trim()) return;
  setLoadingNutrition(true);
  setNutrition(null);

  try {
    const res = await fetch("/api/analyze-nutrients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe: nutritionInput }),
    });

    const data = await res.json();
    setNutrition(data.nutrition);
  } catch (err) {
    console.error("Nutrition API error:", err);
    setNutrition({ error: "⚠️ Failed to fetch nutrition info." });
  } finally {
    setLoadingNutrition(false);
  }
};

  return (
   <>
      <Navbar
        showResults={showResults}
        setShowResults={setShowResults}
        handleSearchFocus={handleSearchFocus}
        handleBlur={handleBlur}
      />
      <div className={`min-h-screen py-10 theme-bg flex flex-col items-center justify-center mt-20 relative transition-all duration-300 ${
        showResults ? "opacity-80 blur-sm" : "opacity-100"
      }`}>
        <BackButton />
        
        {/* Main Content Container - Centered */}
        <div className="content-container flex flex-col items-center pt-24">
          {showRecipe && recipe ? (
            <AiRecipe
              recipe={recipe}
              recipeImageUrl={recipeImageUrl}
              setShowRecipe={setShowRecipe}
            />
          ) : (
            <GenerateRecipeForm
              setRecipe={setRecipe}
              setShowRecipe={setShowRecipe}
              setRecipeImageUrl={setRecipeImageUrl}
              onResetRef={formResetRef}
            />
          )}

          {!showRecipe && (
            <div className="flex flex-wrap gap-2 mt-5 justify-center">
              {/* Only show Clear button when not showing recipe */}
              <button
                className="rounded-lg py-2 px-4 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--text-secondary)',
                  color: 'var(--bg-primary)',
                  border: 'none'
                }}
                onClick={handleReset}
              >
                Clear
              </button>

              {/* Back to Diet Planner button */}
              <a
                href="/diet-planner"
                className="rounded-lg py-2 px-4 text-sm font-medium transition-colors border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--text-secondary)'
                }}
              >
                🥗 Back to Diet Planner
              </a>

              {/* Only show View Recipe button when recipe exists */}
              {recipe && (
                <button
                  className="rounded-lg py-2 px-4 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={() => setShowRecipe(true)}
                >
                  View Recipe
                </button>
              )}
            </div>
          )}

          {/* --- Nutrition AI Section - Centered --- */}
          <div id="nutrition-ai" className="w-full max-w-2xl mt-10 p-6 rounded-xl shadow-lg border" 
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--text-secondary)'
          }}>
            <h2 className="text-2xl font-bold mb-4 font-dm-serif-display text-center"
            style={{
              color: 'var(--accent)'
            }}>🍎 Nutrition AI</h2>

            {!showNutrition ? (
              // ✅ Open Nutrition AI Button
              <div className="text-center">
                <button
                  className="text-white rounded-lg py-3 px-6 font-medium transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--accent)',
                    border: 'none'
                  }}
                  onClick={() => setShowNutrition(true)}
                >
                  Open Nutrition AI
                </button>
              </div>
            ) : (
              <>
                <textarea
                  className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--text-secondary)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent)'
                  }}
                  placeholder="Paste your recipe ingredients here..."
                  value={nutritionInput}
                  onChange={(e) => setNutritionInput(e.target.value)}
                  rows={4}
                />

                <div className="flex space-x-3 justify-center">
                  {/* ✅ Get Nutrition Info Button */}
                  <button
                    onClick={fetchNutrition}
                    disabled={loadingNutrition}
                    className="text-white rounded-lg py-2 px-4 font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--accent)',
                      border: 'none'
                    }}
                  >
                    {loadingNutrition ? "Analyzing..." : "Get Nutrition Info"}
                  </button>

                  {/* ✅ Close Button */}
                  <button
                    className="text-white rounded-lg py-2 px-4 font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--accent)',
                      border: 'none'
                    }}
                    onClick={() => {
                      setShowNutrition(false);
                      setNutrition(null);
                      setNutritionInput("");
                    }}
                  >
                    Close
                  </button>
                </div>

                {nutrition && !nutrition.error && (
                  <div className="mt-6 p-4 rounded-lg border shadow"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--text-secondary)'
                  }}>
                    <h3 className="text-lg font-bold mb-2 font-dm-serif-display text-center"
                    style={{
                      color: 'var(--accent)'
                    }}>
                      Nutrition Facts (per serving)
                    </h3>
                    <table className="w-full border rounded-lg"
                    style={{
                      borderColor: 'var(--text-secondary)'
                    }}>
                      <tbody>
                        {Object.entries(nutrition).map(([key, value]) => (
                          <tr key={key} className="border-t"
                          style={{
                            borderColor: 'var(--text-secondary)'
                          }}>
                            <td className="p-2 font-semibold capitalize"
                            style={{
                              color: 'var(--text-primary)'
                            }}>{key}</td>
                            <td className="p-2"
                            style={{
                              color: 'var(--text-secondary)'
                            }}>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {nutrition?.error && (
                  <p className="text-red-500 mt-4 text-center">{nutrition.error}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Page;
