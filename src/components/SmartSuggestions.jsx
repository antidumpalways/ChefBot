"use client";

import { useState, useEffect } from 'react';
import { chatbotIntegrations } from '../lib/chatbot-integrations';
import { languageManager } from '../lib/language-support';

export default function SmartSuggestions({ onSuggestionClick, isVisible = true }) {
  const [suggestions, setSuggestions] = useState([]);
  const [context, setContext] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentContext = chatbotIntegrations.getCurrentPageContext();
      setContext(currentContext);
      
      const smartSuggestions = chatbotIntegrations.generateSmartSuggestions(currentContext);
      setSuggestions(smartSuggestions);
    }
  }, []);

  const getLocalizedSuggestions = () => {
    if (!context?.featureKey) {
      return [
        languageManager.getTranslation('generateRecipe'),
        languageManager.getTranslation('planMeals'),
        languageManager.getTranslation('browseRecipes'),
        languageManager.getTranslation('exploreIngredients')
      ];
    }

    const featureSuggestions = {
      'recipe-generator': [
        languageManager.getTranslation('recipeGenerator.generatePasta'),
        languageManager.getTranslation('recipeGenerator.createSalad'),
        languageManager.getTranslation('recipeGenerator.makeDessert'),
        languageManager.getTranslation('recipeGenerator.suggestMexican')
      ],
      'diet-planner': [
        languageManager.getTranslation('dietPlanner.planWeek'),
        languageManager.getTranslation('dietPlanner.calculateCalories'),
        languageManager.getTranslation('dietPlanner.suggestLunch'),
        languageManager.getTranslation('dietPlanner.createMealPlan')
      ],
      'community': [
        languageManager.getTranslation('community.showTrending'),
        languageManager.getTranslation('community.findRated'),
        languageManager.getTranslation('community.helpUpload'),
        languageManager.getTranslation('community.searchCuisines')
      ],
      'ingredient-explorer': [
        languageManager.getTranslation('ingredientExplorer.findSubstitutes'),
        languageManager.getTranslation('ingredientExplorer.exploreVegetables'),
        languageManager.getTranslation('ingredientExplorer.checkSpices'),
        languageManager.getTranslation('ingredientExplorer.findDairyAlternatives')
      ]
    };

    return featureSuggestions[context.featureKey] || suggestions;
  };

  if (!isVisible) {
    return null;
  }

  const localizedSuggestions = getLocalizedSuggestions();

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {languageManager.getTranslation('smartSuggestions')}
        </h4>
        {context?.feature && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {languageManager.getTranslation('basedOn')} {context.feature.name}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        {localizedSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {languageManager.getTranslation('clickToStart')}
        </p>
      </div>
    </div>
  );
}

