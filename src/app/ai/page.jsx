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

  // Handle chatbot parameters
  useEffect(() => {
    const chatbotParams = localStorage.getItem('chatbot-recipe-params');
    const nutritionContext = localStorage.getItem('chatbot-nutrition-context');
    
    if (chatbotParams) {
      try {
        const params = JSON.parse(chatbotParams);
        console.log('🤖 Chatbot recipe parameters received:', params);
        
        // Clear the parameters after reading
        localStorage.removeItem('chatbot-recipe-params');
        
        // You can use these parameters to pre-fill the form
        if (params.source === 'chatbot' || params.source === 'chatbot-suggestion' || params.source === 'chatbot-message') {
          console.log('📝 Pre-filling form with chatbot data:', {
            ingredients: params.ingredients,
            cuisine: params.cuisine,
            diet: params.diet,
            mealType: params.mealType
          });
        }
      } catch (error) {
        console.error('Error parsing chatbot parameters:', error);
      }
    }

    if (nutritionContext) {
      try {
        const context = JSON.parse(nutritionContext);
        console.log('🍎 Chatbot nutrition context received:', context);
        
        // Clear the context after reading
        localStorage.removeItem('chatbot-nutrition-context');
        
        // Pre-fill nutrition input
        if (context.source === 'chatbot' && context.food) {
          setNutritionInput(context.food);
          console.log('📊 Pre-filling nutrition input with:', context.food);
        }
      } catch (error) {
        console.error('Error parsing nutrition context:', error);
      }
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
  
  // Read prefill data from sessionStorage and hash flags
  const [prefill, setPrefill] = useState(null);
  const [autoGen, setAutoGen] = useState(false);
  const [focusUpload, setFocusUpload] = useState(false);

  // AI auto-detect cuisine based on dish name
  const detectCuisineFromDishName = (dishName) => {
    if (!dishName) return 'International';
    
    const name = dishName.toLowerCase();
    
    // Indian cuisine keywords
    if (name.includes('curry') || name.includes('dal') || name.includes('biryani') || 
        name.includes('tikka') || name.includes('masala') || name.includes('lentil') ||
        name.includes('chana') || name.includes('rajma') || name.includes('samosa')) {
      return 'Indian';
    }
    
    // Italian cuisine keywords
    if (name.includes('pasta') || name.includes('pizza') || name.includes('risotto') ||
        name.includes('carbonara') || name.includes('alfredo') || name.includes('parmesan') ||
        name.includes('mozzarella') || name.includes('bolognese') || name.includes('fettuccine')) {
      return 'Italian';
    }
    
    // Mexican cuisine keywords
    if (name.includes('taco') || name.includes('burrito') || name.includes('salsa') ||
        name.includes('quesadilla') || name.includes('enchilada') || name.includes('guacamole') ||
        name.includes('nachos') || name.includes('fajita')) {
      return 'Mexican';
    }
    
    // Thai cuisine keywords
    if (name.includes('pad thai') || name.includes('tom yum') || name.includes('green curry') ||
        name.includes('thai') || name.includes('coconut milk') || name.includes('lemongrass')) {
      return 'Thai';
    }
    
    // Chinese cuisine keywords
    if (name.includes('chow mein') || name.includes('kung pao') || name.includes('lo mein') ||
        name.includes('wonton') || name.includes('dim sum') || name.includes('szechuan') ||
        name.includes('teriyaki') || name.includes('chinese')) {
      return 'Chinese';
    }
    
    // Japanese cuisine keywords
    if (name.includes('sushi') || name.includes('ramen') || name.includes('tempura') ||
        name.includes('miso') || name.includes('wasabi') || name.includes('japanese') ||
        name.includes('udon') || name.includes('yakitori')) {
      return 'Japanese';
    }
    
    // American cuisine keywords
    if (name.includes('burger') || name.includes('bbq') || name.includes('barbecue') ||
        name.includes('mac and cheese') || name.includes('fried chicken') || name.includes('hot dog') ||
        name.includes('buffalo wings') || name.includes('american')) {
      return 'American';
    }
    
    // French cuisine keywords
    if (name.includes('ratatouille') || name.includes('crepe') || name.includes('bouillabaisse') ||
        name.includes('coq au vin') || name.includes('french') || name.includes('brie') ||
        name.includes('croissant') || name.includes('quiche')) {
      return 'French';
    }
    
    // Mediterranean cuisine keywords
    if (name.includes('hummus') || name.includes('tabbouleh') || name.includes('falafel') ||
        name.includes('mediterranean') || name.includes('olive oil') || name.includes('feta') ||
        name.includes('tzatziki') || name.includes('gyro')) {
      return 'Mediterranean';
    }
    
    // Korean cuisine keywords
    if (name.includes('kimchi') || name.includes('bulgogi') || name.includes('bibimbap') ||
        name.includes('korean') || name.includes('gochujang') || name.includes('korean bbq')) {
      return 'Korean';
    }
    
    return 'International'; // Default fallback
  };

  useEffect(() => {
    try {
      const data = sessionStorage.getItem('chatbot-recipe-params');
      if (data) {
        const recipeData = JSON.parse(data);
        // Only prefill basic info, not all fields
        // Get the latest bot response for dish name
        const latestBotResponse = sessionStorage.getItem('latest-bot-response');
        console.log('🔍 Latest bot response:', latestBotResponse);
        console.log('🔍 Recipe data userPrompt:', recipeData.userPrompt);
        
        let dishName = recipeData.userPrompt || '';
        
        if (latestBotResponse) {
          try {
            const botText = JSON.parse(latestBotResponse);
            console.log('🔍 Parsed bot text:', botText);
            const cleanText = botText.replace(/<[^>]*>/g, '');
            const firstSentence = cleanText.split('.')[0] || cleanText.split('!')[0];
            console.log('🔍 First sentence:', firstSentence);
            if (firstSentence && firstSentence.length > 10) {
              dishName = firstSentence;
              console.log('🔍 Using dish name from bot response:', dishName);
            }
          } catch (e) {
            console.warn('Failed to parse latest bot response for prefill:', e);
          }
        }
        
        // AI auto-detect cuisine based on dish name
        const detectedCuisine = detectCuisineFromDishName(dishName);
        console.log('🔍 Detected cuisine:', detectedCuisine);
        console.log('🔍 Final dish name:', dishName);
        
        setPrefill({
          userPrompt: dishName,
          dishType: '', // Let user choose
          cuisine: detectedCuisine, // AI auto-detected cuisine
          dietaryRestrictions: [],
          spiceLevel: '',
          skillLevel: '',
          cookingMethod: ''
        });
        
        // Clean up after setting prefill
        sessionStorage.removeItem('chatbot-recipe-params');
        
        // Check if this is auto-generate flow or interactive flow
        const hash = window.location.hash;
        
        if (hash === '#autogen') {
          // Auto-generate flow - bot gives smart follow-up
          setTimeout(() => {
            const latestBotResponse = sessionStorage.getItem('latest-bot-response');
            let dishName = 'recipe';
            
            if (latestBotResponse) {
              try {
                const botText = JSON.parse(latestBotResponse);
                const cleanText = botText.replace(/<[^>]*>/g, '');
                const firstSentence = cleanText.split('.')[0] || cleanText.split('!')[0];
                if (firstSentence && firstSentence.length > 10) {
                  dishName = firstSentence;
                }
              } catch (e) {
                console.warn('Failed to parse latest bot response:', e);
              }
            }
            
            const smartFollowUpMessage = {
              id: Date.now(),
              text: `Perfect! I'll generate your ${dishName} recipe. Or would you like to customize any details first?`,
              sender: 'bot',
              timestamp: new Date(),
              suggestedAction: {
                type: 'recipe-generator-final',
                options: ['Generate Now', 'Customize Details']
              }
            };
            
            // Send message to chatbot via custom event
            window.dispatchEvent(new CustomEvent('chatbot-stage2', { 
              detail: smartFollowUpMessage 
            }));
          }, 1500);
        } else {
          // Interactive questioning flow
          setTimeout(() => {
            // Get the latest bot response from sessionStorage or use a generic message
            const latestBotResponse = sessionStorage.getItem('latest-bot-response');
            let dishName = 'recipe';
            
            if (latestBotResponse) {
              try {
                const botText = JSON.parse(latestBotResponse);
                // Extract dish name from bot response
                const cleanText = botText.replace(/<[^>]*>/g, '');
                const firstSentence = cleanText.split('.')[0] || cleanText.split('!')[0];
                if (firstSentence && firstSentence.length > 10) {
                  dishName = firstSentence;
                }
              } catch (e) {
                console.warn('Failed to parse latest bot response:', e);
              }
            }
            
            const interactiveMessage = {
              id: Date.now(),
              text: `Great! I'll help you customize your ${dishName}. Let's start with the dish type. What type of dish would you like?`,
              sender: 'bot',
              timestamp: new Date(),
              suggestedAction: { 
                type: 'interactive-form',
                step: 'dishType',
                options: ['Main Courses', 'Appetizers & Sides', 'Desserts', 'Beverages', 'Snacks']
              },
              optionButtons: ['Main Courses', 'Appetizers & Sides', 'Desserts', 'Beverages', 'Snacks'].map(option => ({
                text: option,
                onClick: () => {
                  // Handle option button click directly
                  const userMessage = {
                    id: Date.now(),
                    text: option,
                    sender: 'user',
                    timestamp: new Date()
                  };
                  
                  // Add user message to chatbot
                  window.dispatchEvent(new CustomEvent('chatbot-user-message', {
                    detail: userMessage
                  }));
                  
                  // Parse and update form
                  const parsedValue = option === 'Main Courses' ? 'Main Courses' : 
                                    option === 'Appetizers & Sides' ? 'Appetizers & Sides' :
                                    option === 'Desserts' ? 'Desserts' :
                                    option === 'Beverages' ? 'Beverages' : 'Snacks';
                  
                  window.dispatchEvent(new CustomEvent('form-field-update', {
                    detail: { field: 'dishType', value: parsedValue }
                  }));
                  
                  // Continue with next question
                  window.dispatchEvent(new CustomEvent('chatbot-option-click', {
                    detail: { option, step: 'dishType' }
                  }));
                }
              }))
            };
            
            // Send message to chatbot via custom event
            window.dispatchEvent(new CustomEvent('chatbot-stage2', { 
              detail: interactiveMessage 
            }));
          }, 1500);
        }
      }
    } catch (e) {
      console.warn('Failed to read chatbot prefill:', e);
    }

    const hash = window.location.hash;
    // Don't auto-generate immediately, wait for user confirmation
    if (hash === '#upload') {
      setFocusUpload(true);
    }
    // Clear hash to avoid re-triggering on back/forward
    if (hash) {
      history.replaceState(null, '', window.location.pathname);
    }
  }, []);
  
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
        {/* Back button removed as requested */}
        
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
              initialData={prefill}
              autoGenerate={Boolean(prefill && autoGen)}
              focusUpload={Boolean(prefill && focusUpload)}
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
