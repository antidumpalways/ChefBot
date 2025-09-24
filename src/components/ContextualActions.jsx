"use client";

import { useState, useEffect } from 'react';
import { chatbotIntegrations } from '../lib/chatbot-integrations';
import { languageManager } from '../lib/language-support';

export default function ContextualActions({ messages, onActionClick }) {
  const [relevantActions, setRelevantActions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const analyzeContext = async () => {
      if (messages && messages.length >= 3) { // Minimal 3 pesan untuk AI analysis
        setIsAnalyzing(true);
        try {
          // Try AI-powered analysis first
          const aiActions = await chatbotIntegrations.analyzeConversationContextWithAI(messages);
          
          if (aiActions.length > 0) {
            setRelevantActions(aiActions);
            setIsVisible(true);
            setIsExpanded(false); // Start collapsed
          } else {
            // Fallback to keyword-based analysis
            const fallbackActions = chatbotIntegrations.analyzeConversationContext(messages);
            setRelevantActions(fallbackActions);
            setIsVisible(fallbackActions.length > 0);
            setIsExpanded(false); // Start collapsed
          }
        } catch (error) {
          console.error('Context analysis failed:', error);
          // Fallback to keyword-based analysis
          const fallbackActions = chatbotIntegrations.analyzeConversationContext(messages);
          setRelevantActions(fallbackActions);
          setIsVisible(fallbackActions.length > 0);
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setRelevantActions([]);
        setIsVisible(false);
        setIsAnalyzing(false);
        setIsExpanded(false);
      }
    };

    analyzeContext();
  }, [messages]);

  const handleActionClick = async (action) => {
    try {
      // Extract parameters from conversation
      const allText = messages.map(msg => msg.text).join(' ');
      let params = {};

      if (action.type === 'recipe-generator') {
        params = chatbotIntegrations.extractRecipeParams(allText);
      } else if (action.type === 'nutrition-ai') {
        // Extract food/ingredients for nutrition analysis
        const foodKeywords = ['chicken', 'beef', 'pasta', 'rice', 'vegetables', 'salad', 'soup'];
        const foundFood = foodKeywords.filter(food => 
          allText.toLowerCase().includes(food)
        );
        params.food = foundFood.join(', ');
      }

      // Execute the action
      const result = await chatbotIntegrations.executeAction(action.action, params);
      
      if (onActionClick) {
        onActionClick(action, result);
      }
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              💡 {languageManager.getTranslation('smartSuggestions')}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isAnalyzing ? 'Analyzing conversation...' : 'Based on your conversation'}
            </p>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="space-y-2">
        {isAnalyzing ? (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">AI is analyzing...</span>
          </div>
        ) : (
          relevantActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className="w-full text-left p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30 rounded-lg transition-all duration-200 border border-orange-200 dark:border-orange-700/50 group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {action.icon}
              </span>
              <div className="flex-1">
                <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                  {action.title}
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {action.description}
                </p>
              </div>
              <svg 
                className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
          ))
        )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Click any action to get started! 🚀
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
