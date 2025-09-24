"use client";

import { useState, useRef, useEffect } from 'react';
import { chatbotIntegrations } from '../lib/chatbot-integrations';
import SmartSuggestions from './SmartSuggestions';
import ContextualActions from './ContextualActions';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentContext, setCurrentContext] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const context = chatbotIntegrations.getCurrentPageContext();
      setCurrentContext(context);
      setCurrentLanguage('en');
      
      // Check if mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    await handleSendMessage();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
    
    // Check if suggestion is about generating recipe
    if (suggestion.toLowerCase().includes('generate') || suggestion.toLowerCase().includes('recipe')) {
      // Extract parameters from suggestion
      const params = chatbotIntegrations.extractRecipeParams(suggestion);
      console.log('🍳 Recipe parameters extracted:', params);
      
      // Store parameters for AI page
      if (params.ingredients || params.cuisine || params.diet || params.mealType) {
        localStorage.setItem('chatbot-recipe-params', JSON.stringify({
          ...params,
          source: 'chatbot-suggestion'
        }));
        
        // Show option to go to AI Generate Recipe
        setTimeout(() => {
          const goToAI = confirm('🤖 Would you like to generate a detailed recipe with AI? This will take you to the AI Recipe Generator page.');
          if (goToAI) {
            window.location.href = '/ai';
          }
        }, 1000);
      }
    }
  };

  // Handle language change
  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
  };

  // Format markdown text to HTML
  const formatMessage = (text) => {
    if (!text) return '';
    
    // Split text into lines for better processing
    const lines = text.split('\n');
    let formatted = '';
    let inList = false;
    let listType = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for numbered list (1., 2., 3., etc.)
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) formatted += `</${listType}>`;
          formatted += '<ol>';
          inList = true;
          listType = 'ol';
        }
        formatted += `<li>${numberedMatch[2]}</li>`;
        continue;
      }
      
      // Check for bullet list (-)
      const bulletMatch = line.match(/^-\s+(.+)$/);
      if (bulletMatch) {
        if (!inList || listType !== 'ul') {
          if (inList) formatted += `</${listType}>`;
          formatted += '<ul>';
          inList = true;
          listType = 'ul';
        }
        formatted += `<li>${bulletMatch[1]}</li>`;
        continue;
      }
      
      // Close list if we're in one and this line is not a list item
      if (inList) {
        formatted += `</${listType}>`;
        inList = false;
        listType = '';
      }
      
      // Process regular line
      if (line) {
        // Bold text **text** -> <strong>text</strong>
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic text *text* -> <em>text</em>
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted += processedLine + '<br>';
      } else {
        formatted += '<br>';
      }
    }
    
    // Close any remaining list
    if (inList) {
      formatted += `</${listType}>`;
    }
    
    return formatted;
  };

  // Detect language from user message
  const detectLanguage = (message) => {
    const indonesianWords = ['saya', 'aku', 'kamu', 'anda', 'mau', 'ingin', 'bisa', 'tidak', 'ya', 'tidak', 'bagaimana', 'apa', 'dimana', 'kapan', 'mengapa', 'untuk', 'dengan', 'dari', 'ke', 'di', 'pada', 'adalah', 'yang', 'ini', 'itu', 'dan', 'atau', 'tetapi', 'jika', 'karena', 'sehingga', 'agar', 'supaya', 'meskipun', 'walaupun', 'namun', 'akan', 'sudah', 'belum', 'pernah', 'selalu', 'kadang', 'sering', 'jarang', 'tidak pernah'];
    const messageWords = message.toLowerCase().split(/\s+/);
    const indonesianCount = messageWords.filter(word => indonesianWords.includes(word)).length;
    return indonesianCount > 0 ? 'id' : 'en';
  };

  // AI-powered intent detection with context awareness
  const detectIntentWithAI = async (userMessage, botResponse, conversationHistory = []) => {
    try {
      // Detect language from user message
      const userLanguage = detectLanguage(userMessage);
      
      // Prepare context for AI analysis
      const context = {
        userMessage: userMessage,
        botResponse: botResponse,
        conversationLength: conversationHistory.length,
        isDiscussion: conversationHistory.length > 2,
        hasActionIntent: hasActionKeywords(userMessage),
        userLanguage: userLanguage
      };

      // Call Sensay AI for intent analysis
      const response = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Analyze this user intent and determine if they want to take action or continue discussion:

User Message: "${userMessage}"
Bot Response: "${botResponse}"
Conversation Length: ${conversationHistory.length}
User Language: ${userLanguage}
Context: ${JSON.stringify(context)}

Please respond with ONLY a JSON object containing:
{
  "intent": "action" | "discussion" | "unclear",
  "actionType": "recipe-generator" | "diet-planner" | "community" | "ingredient-explorer" | "nutrition-analyzer" | null,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

If intent is "action", also provide:
{
  "ctaText": "relevant call-to-action text in ${userLanguage === 'id' ? 'Indonesian' : 'English'}"
}`,
          userId: 'chefbot-analyzer',
          source: 'web',
          skipHistory: true
        })
      });

      const data = await response.json();
      if (data.success) {
        try {
          const analysis = JSON.parse(data.content);
          console.log('🤖 AI Intent Analysis:', analysis);
          return analysis;
        } catch (parseError) {
          console.warn('Failed to parse AI analysis:', parseError);
          return fallbackIntentDetection(userMessage, botResponse);
        }
      }
    } catch (error) {
      console.warn('AI intent detection failed:', error);
    }
    
    return fallbackIntentDetection(userMessage, botResponse);
  };

  // Fallback keyword-based detection
  const fallbackIntentDetection = (userMessage, botResponse) => {
    const message = userMessage.toLowerCase();
    const userLanguage = detectLanguage(userMessage);
    
    // Check for explicit action requests
    if (message.includes('recipe generator') || message.includes('generate recipe')) {
      return {
        intent: 'action',
        actionType: 'recipe-generator',
        confidence: 0.9,
        reasoning: 'Explicit recipe generator request',
        ctaText: userLanguage === 'id' 
          ? 'Untuk mendapatkan resep yang lebih detail dan lengkap, klik tombol di bawah ini:'
          : 'For a more detailed and complete recipe, click the button below:'
      };
    }
    
    if (message.includes('diet plan') || message.includes('meal plan')) {
      return {
        intent: 'action',
        actionType: 'diet-planner',
        confidence: 0.9,
        reasoning: 'Explicit diet planning request',
        ctaText: userLanguage === 'id'
          ? 'Untuk membuat rencana diet yang lebih terstruktur, klik tombol di bawah ini:'
          : 'To create a more structured diet plan, click the button below:'
      };
    }
    
    // Check for discussion patterns
    if (message.includes('how') || message.includes('what') || message.includes('why') || 
        message.includes('explain') || message.includes('tell me about')) {
      return {
        intent: 'discussion',
        actionType: null,
        confidence: 0.8,
        reasoning: 'Question/discussion pattern detected'
      };
    }
    
    return {
      intent: 'unclear',
      actionType: null,
      confidence: 0.3,
      reasoning: 'No clear intent detected'
    };
  };

  // Check if message contains action keywords
  const hasActionKeywords = (message) => {
    const actionKeywords = [
      'generate', 'create', 'make', 'build', 'use', 'open', 'go to',
      'recipe generator', 'diet planner', 'meal plan', 'analyze'
    ];
    return actionKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  // Add call-to-action before suggested action (now AI-powered)
  const addCallToAction = async (text, userMessage, botResponse, conversationHistory = []) => {
    const analysis = await detectIntentWithAI(userMessage, botResponse, conversationHistory);
    
    if (analysis.intent === 'action' && analysis.actionType && analysis.ctaText) {
      return `${text}<br><br><em>${analysis.ctaText}</em>`;
    }
    
    return text; // No CTA for discussion or unclear intent
  };

  // Handle message send with context
  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setShowSuggestions(false);

    // Show typing indicator
    const typingMessage = {
      id: Date.now() + 1,
      text: "Typing...",
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Get enhanced context
      const context = currentContext ? 
        `Current page: ${currentContext.pageTitle} (${currentContext.path}). ${currentContext.feature ? `User is on ${currentContext.feature.name} page.` : ''}` : 
        '';

      // Call Sensay API with enhanced context
      const response = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          userId: 'chefbot-user',
          source: 'web',
          skipHistory: false,
          context: context
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Detect user intent for inline button
      const suggestedAction = await chatbotIntegrations.detectUserIntent(message, data.content, messages);

      // Format the message and add call-to-action
      let formattedText = formatMessage(data.content);
      if (suggestedAction) {
        formattedText = await addCallToAction(formattedText, message, data.content, messages);
      }

      // Remove typing indicator and add bot response with suggested action
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [...withoutTyping, {
          id: Date.now() + 2,
          text: formattedText,
          sender: 'bot',
          timestamp: new Date(),
          suggestedAction: suggestedAction
        }];
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove typing indicator and show error
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [...withoutTyping, {
          id: Date.now() + 2,
          text: error.message || "Sorry, I'm having trouble right now. Please try again! 🔧",
          sender: 'bot',
          timestamp: new Date(),
          isError: true
        }];
      });
    }
  };

  return (
    <>
       {/* Chat Toggle Button - Hidden when chat is open */}
       {!isOpen && (
         <button
           onClick={() => {
             setIsOpen(true);
             setIsMinimized(false);
           }}
           className={`fixed ${isMobile ? 'bottom-4 right-4 w-12 h-12' : 'bottom-6 right-6 w-14 h-14'} text-white rounded-full shadow-lg transition-all duration-300 z-50`}
           style={{ backgroundColor: 'var(--accent)' }}
         >
           💬
         </button>
       )}

       {/* Chat Window */}
       {isOpen && (
         <div className={`fixed ${isMobile ? 'bottom-20 right-2 left-2 w-auto' : 'bottom-24 right-6 w-80'} ${isMinimized ? 'h-16' : (isMobile ? 'h-80' : 'h-96')} bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-all duration-300`}>
           {/* Header */}
           <div className="text-white p-4 rounded-t-lg flex justify-between items-center" style={{ backgroundColor: 'var(--accent)' }}>
             <div>
               <h3 className="font-semibold">🤖 ChefBot Assistant</h3>
               <p className="text-sm opacity-90">Ask me anything about cooking!</p>
             </div>
             <div className="flex items-center space-x-2">
               <button
                 onClick={() => setIsMinimized(!isMinimized)}
                 className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                 style={{ backgroundColor: 'var(--accent)', opacity: 0.8 }}
                 onMouseEnter={(e) => e.target.style.opacity = '1'}
                 onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                 title={isMinimized ? "Expand chat" : "Minimize chat"}
               >
                 {isMinimized ? '□' : '−'}
               </button>
               <button
                 onClick={() => {
                   setIsOpen(false);
                   setIsMinimized(false);
                 }}
                 className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                 style={{ backgroundColor: 'var(--accent)', opacity: 0.8 }}
                 onMouseEnter={(e) => e.target.style.opacity = '1'}
                 onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                 title="Close chat"
               >
                 ✕
               </button>
             </div>
           </div>

           {/* Messages */}
           {!isMinimized && (
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {messages.length === 0 && (
                 <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                   <p>👋 Hi! I'm your cooking assistant.</p>
                   <p className="text-sm mt-2">Ask me anything about recipes, ingredients, or cooking tips!</p>
                 </div>
               )}
               {messages.map((message) => (
               <div
                 key={message.id}
                 className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
               >
                 <div
                   className={`max-w-xs p-3 rounded-lg ${
                     message.sender === 'user'
                       ? 'text-white'
                       : message.isError
                       ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                       : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                     }`}
                   style={message.sender === 'user' ? { backgroundColor: 'var(--accent)' } : {}}
                 >
                   {message.isTyping ? (
                     <div className="flex items-center space-x-1">
                       <div className="flex space-x-1">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                       </div>
                     </div>
                   ) : (
                     <div>
                       <div dangerouslySetInnerHTML={{ __html: message.text }}></div>
                       
                       {/* Inline Suggested Action Button */}
                       {message.suggestedAction && (
                         <div className="mt-3 p-2 border-2 rounded-lg transition-colors" style={{ borderColor: 'var(--accent)', backgroundColor: 'rgba(255, 140, 0, 0.1)' }}>
                           <button
                             onClick={async () => {
                               try {
                                 // Extract parameters from conversation
                                 const allText = messages.map(msg => msg.text).join(' ');
                                 let params = {};

                                 if (message.suggestedAction.type === 'recipe-generator') {
                                   params = chatbotIntegrations.extractRecipeParams(allText);
                                 } else if (message.suggestedAction.type === 'nutrition-ai') {
                                   const foodKeywords = ['chicken', 'beef', 'pasta', 'rice', 'vegetables', 'salad', 'soup'];
                                   const foundFood = foodKeywords.filter(food => 
                                     allText.toLowerCase().includes(food)
                                   );
                                   params.food = foundFood.join(', ');
                                 }

                                 // Execute the action
                                 const result = await chatbotIntegrations.executeAction(message.suggestedAction.action, params);
                                 console.log('Action executed:', message.suggestedAction, result);
                               } catch (error) {
                                 console.error('Error executing action:', error);
                               }
                             }}
                             className="w-full text-left text-sm font-medium transition-colors"
                             style={{ color: 'var(--accent)' }}
                           >
                             {message.suggestedAction.text}
                           </button>
                         </div>
                       )}
                     </div>
                   )}
                 </div>
               </div>
               ))}
               <div ref={messagesEndRef} />
             </div>
           )}

           {/* Smart Suggestions */}
           {!isMinimized && showSuggestions && messages.length === 0 && (
             <SmartSuggestions 
               onSuggestionClick={handleSuggestionClick}
               isVisible={showSuggestions}
             />
           )}

           {/* Input */}
           {!isMinimized && (
             <div className="p-4 border-t border-gray-200 dark:border-gray-700">
               <div className="flex space-x-2">
                 <input
                   type="text"
                   value={inputMessage}
                   onChange={(e) => setInputMessage(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder="Ask me anything..."
                   className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white"
                   style={{ '--tw-ring-color': 'var(--accent)' }}
                 />
                 <button
                   onClick={() => handleSendMessage()}
                   className="px-4 py-2 text-white rounded-lg transition-colors"
                   style={{ backgroundColor: 'var(--accent)' }}
                   onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                   onMouseLeave={(e) => e.target.style.opacity = '1'}
                 >
                   Send
                 </button>
               </div>
             </div>
           )}

           {/* Contextual Actions - Hidden, using inline buttons instead */}
           {/* <ContextualActions 
             messages={messages}
             onActionClick={(action, result) => {
               console.log('Action executed:', action, result);
             }}
           /> */}
        </div>
      )}
    </>
  );
}
