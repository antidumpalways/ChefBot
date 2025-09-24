"use client";

import { useState, useEffect } from 'react';
import { chatbotIntegrations } from '../lib/chatbot-integrations';

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
    // Force English suggestions regardless of browser language
    if (!context?.featureKey) {
      return [
        "🍳 Generate a random recipe with Sensay AI",
        "📊 Plan your weekly meals",
        "👥 Browse community recipes",
        "🔍 Explore ingredients and substitutions"
      ];
    }

    const featureSuggestions = {
      'recipe-generator': [
        "🍝 Generate a pasta recipe",
        "🥗 Create a healthy salad",
        "🍰 Make a dessert recipe",
        "🌮 Suggest Mexican dishes"
      ],
      'diet-planner': [
        "📅 Plan this week's meals",
        "⚖️ Calculate my daily calories",
        "🥗 Suggest healthy lunch options",
        "🍎 Create a balanced meal plan"
      ],
      'community': [
        "👀 Show me trending recipes",
        "⭐ Find highly rated dishes",
        "📤 Help me upload my recipe",
        "🔍 Search for specific cuisines"
      ],
      'ingredient-explorer': [
        "🔄 Find ingredient substitutes",
        "🥕 Explore vegetable options",
        "🧄 Check spice compatibility",
        "🥛 Find dairy alternatives"
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
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          💡 Smart Suggestions
        </h4>
        {context?.feature && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Based on {context.feature.name}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        {localizedSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
          Click any suggestion to get started! 🚀
        </p>
      </div>
    </div>
  );
}

