"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { CATEGORIES_URL } from "@/lib/urls";
import { PlusIcon } from "@/components/Icons";
import { communityRecipesService } from "@/lib/supabaseService";

export default function Page() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [filter, setFilter] = useState("All");
  const [showDiets, setShowDiets] = useState(false);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [communityRecipes, setCommunityRecipes] = useState<any[]>([]);

  const handleSearchFocus = () => setShowResults(true);
  const handleBlur = () => setTimeout(() => setShowResults(false), 200);

  // Category → Diet Map
  const categoryDietMap: Record<string, string[]> = {
    Dessert: ["Vegan", "100 Calories"],
    Vegetarian: ["Vegan", "Low Carbs"],
    Pasta: ["High Protein"],
    Beef: ["High Protein", "Keto"],
    Chicken: ["High Protein", "Keto"],
    Lamb: ["High Protein", "Keto"],
    Miscellaneous: [],
    Pork: ["High Protein", "Keto"],
    Seafood: ["High Protein", "Keto", "Low Carbs"],
    Side: ["Low Carbs", "Gluten Free"],
    Starter: ["Low Carbs", "Gluten Free"],
    Vegan: ["Vegan", "Low Carbs", "100 Calories"],
    Breakfast: ["High Protein", "100 Calories"],
    Goat: ["High Protein", "Keto"],
  };

  useEffect(() => {
    fetch(CATEGORIES_URL)
      .then((res) => res.json())
      .then((data) => {
        const sortedCategories = data.categories.sort((a: any, b: any) => {
          const priority = ["Dessert", "Vegetarian", "Pasta"];
          const aIndex = priority.findIndex((cat) =>
            a.strCategory.toLowerCase().includes(cat.toLowerCase())
          );
          const bIndex = priority.findIndex((cat) =>
            b.strCategory.toLowerCase().includes(cat.toLowerCase())
          );

          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });
        setCategories(sortedCategories);
      })
      .catch((err) => console.error("Error fetching categories:", err));

    // Load community recipes
    const loadCommunityRecipes = async () => {
      try {
        const { data } = await communityRecipesService.getCommunityRecipes(3);
        setCommunityRecipes(data || []);
      } catch (error) {
        console.error("Error loading community recipes:", error);
        setCommunityRecipes([]);
      }
    };
    loadCommunityRecipes();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme =
        document.documentElement.getAttribute("data-theme") || "light";
      setCurrentTheme(newTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    setCurrentTheme(
      document.documentElement.getAttribute("data-theme") || "light"
    );
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const navbar = document.querySelector(".navbar");
    const content = document.querySelector(".content");
    if (navbar && content) {
      (content as HTMLElement).style.marginTop = `${(navbar as HTMLElement).offsetHeight}px`;
    }
  }, []);

  return (
    <>
      {/* Navbar */}
      <Navbar
        showResults={showResults}
        setShowResults={setShowResults}
        handleSearchFocus={handleSearchFocus}
        handleBlur={handleBlur}
      />

      {/* Content */}
      <div
        className={`content flex flex-col items-center p-5 md:p-1 w-full bg-base-100/80 backdrop-blur-sm relative z-10 ${
          !showResults ? "opacity-100" : "opacity-80 blur-sm"
        }`}
      >
        <section className="w-full h-screen bg-transparent flex items-center justify-center">
          <div className="hero-container flex flex-col items-center space-y-8">
            {/* Headline Section */}
            <div className="flex flex-col items-center space-y-6">
              <h1
                className={`text-5xl md:text-6xl font-bold leading-tight tracking-tight font-dm-serif-display text-center ${
                  currentTheme === "dark" ? "text-white" : "text-primary"
                }`}
              >
                Every Recipe, Crafted <span className={`${
                  currentTheme === "dark" ? "text-orange-400" : "text-orange-600"
                }`}>Just for You</span>
              </h1>
              
              <p
                className={`text-lg md:text-xl max-w-3xl leading-relaxed font-roboto-condensed font-normal text-center ${
                  currentTheme === "dark" ? "text-gray-200" : "text-base-content/80"
                }`}
              >
                From weekly diet plans to spontaneous meal ideas, let our AI become your personal culinary partner
              </p>
              
              {/* Feature Benefits - Interactive Menu Buttons */}
              <div className="features-container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <Link href="/ai" className="flex items-center gap-4 p-6 rounded-lg bg-base-100/50 backdrop-blur-sm border border-base-300 hover:bg-base-200/70 hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🤖</span>
                  <div className="space-y-1">
                    <h3 className="font-roboto-condensed font-semibold text-lg text-base-content">AI Recipe Generator</h3>
                    <p className="text-sm text-base-content/80 font-roboto-condensed font-normal">Turn your ingredients into instant meal ideas.</p>
                  </div>
                </Link>

                <Link href="/diet-planner" className="flex items-center gap-4 p-6 rounded-lg bg-base-100/50 backdrop-blur-sm border border-base-300 hover:bg-base-200/70 hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">📅</span>
                  <div className="space-y-1">
                    <h3 className="font-roboto-condensed font-semibold text-lg text-base-content">AI Diet Planner</h3>
                    <p className="text-sm text-base-content/80 font-roboto-condensed font-normal">Create personalized weekly meal plans instantly.</p>
                  </div>
                </Link>

                <Link href="/ai#nutrition-ai" className="flex items-center gap-4 p-6 rounded-lg bg-base-100/50 backdrop-blur-sm border border-base-300 hover:bg-base-200/70 hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🍎</span>
                  <div className="space-y-1">
                    <h3 className="font-roboto-condensed font-semibold text-lg text-base-content">Nutrition AI</h3>
                    <p className="text-sm text-base-content/80 font-roboto-condensed font-normal">Analyze nutrition facts and health benefits of your recipes.</p>
                  </div>
                </Link>

                <Link href="/random" className="flex items-center gap-4 p-6 rounded-lg bg-base-100/50 backdrop-blur-sm border border-base-300 hover:bg-base-200/70 hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🎲</span>
                  <div className="space-y-1">
                    <h3 className="font-roboto-condensed font-semibold text-lg text-base-content">Random Recipe</h3>
                    <p className="text-sm text-base-content/80 font-roboto-condensed font-normal">Discover new recipes with a surprise element.</p>
                  </div>
                </Link>

                <Link href="/ingredient-explorer" className="flex items-center gap-4 p-6 rounded-lg bg-base-100/50 backdrop-blur-sm border border-base-300 hover:bg-base-200/70 hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🔍</span>
                  <div className="space-y-1">
                    <h3 className="font-roboto-condensed font-semibold text-lg text-base-content">Ingredient Explorer</h3>
                    <p className="text-sm text-base-content/80 font-roboto-condensed font-normal">Explore ingredients and their culinary possibilities.</p>
                  </div>
                </Link>

                <Link href="/categories" className="flex items-center gap-4 p-6 rounded-lg bg-base-100/50 backdrop-blur-sm border border-base-300 hover:bg-base-200/70 hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">📂</span>
                  <div className="space-y-1">
                    <h3 className="font-roboto-condensed font-semibold text-lg text-base-content">Recipe Categories</h3>
                    <p className="text-sm text-base-content/80 font-roboto-condensed font-normal">Browse recipes by cuisine and meal type.</p>
                  </div>
                </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Recipes Section */}
        <section className="w-full py-16 p-5 md:p-1 bg-gradient-to-br from-base-100 to-base-200">
          <div className="features-container">
            {/* Attractive Title */}
            <div className="text-center mb-8">
              <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${
                currentTheme === "dark" ? "text-white" : "text-primary"
              }`}>
                Explore Community Creations
              </h2>
              <p className={`text-base md:text-lg max-w-2xl mx-auto leading-relaxed ${
                currentTheme === "dark" ? "text-gray-200" : "text-base-content/70"
              }`}>
                Discover the best recipes shared by our community. From traditional dishes to modern innovations.
              </p>
            </div>

            {/* Community Recipes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 ml-16 justify-items-center">
              {communityRecipes.map((recipe, index) => (
                <div key={recipe.id || index} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full max-w-sm">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={recipe.image || recipe.imageUrl || "/placeholder.svg"}
                      alt={recipe.title || recipe.name || "Recipe"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className={`p-4 ${
                    currentTheme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}>
                    <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${
                      currentTheme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {recipe.title || recipe.name || "Delicious Recipe"}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        currentTheme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {recipe.difficulty || "Medium"}
                      </span>
                      <span className={`text-sm ${
                        currentTheme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        by {recipe.author_username || "Community"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link
                href="/community"
                className={`btn btn-sm px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-md ${
                  currentTheme === "dark" 
                    ? "bg-primary text-primary-content hover:bg-primary/90" 
                    : "bg-primary text-primary-content hover:bg-primary/90"
                }`}
              >
                View Community Recipes
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="bg-base-100">
        <Footer />
      </div>
    </>
  );
}