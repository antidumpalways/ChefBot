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
  const [chatSessionId, setChatSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [lastRecipePayload, setLastRecipePayload] = useState(null);
  const [collectedPrefs, setCollectedPrefs] = useState({
    ingredients: [],
    dishType: '',
    cuisine: '',
    dietaryRestrictions: [],
    spiceLevel: '',
    skillLevel: '',
    cookingMethod: ''
  });
  const [followupCount, setFollowupCount] = useState(0);
  const [extraNotes, setExtraNotes] = useState([]);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [askedFields, setAskedFields] = useState({});
  const [lockedFields, setLockedFields] = useState({});
  const [dietFlowActive, setDietFlowActive] = useState(false);
  const [dietPrefs, setDietPrefs] = useState({ 
    goal: '', 
    height: '', 
    weight: '', 
    age: '', 
    gender: '', 
    activityLevel: '', 
    dietPreference: '', 
    bloodSugar: '', 
    bloodPressure: '', 
    exclusions: '', 
    allergies: '', 
    cuisinePrefs: '' 
  });
  const [nutritionFlowActive, setNutritionFlowActive] = useState(false);
  const [nutritionInput, setNutritionInput] = useState('');
  const [healthCoachActive, setHealthCoachActive] = useState(false);
  const [healthCoachInput, setHealthCoachInput] = useState('');
  const [healthGoal, setHealthGoal] = useState('');

  // Schema: allowed follow-up fields by dish type (guards irrelevant questions)
  const DISH_TYPE_FIELDS = {
    Beverages: ['beveragePreference', 'temperature', 'sweetness', 'flavorAddOns'],
    Snacks: ['cookingMethod', 'flavorProfile', 'texturePreference'],
    Desserts: ['sweetness', 'flavorProfile', 'toppings', 'servingStyle'],
    Soup: ['spiceLevel', 'cookingMethod', 'texturePreference', 'dietaryRestriction'],
    Salad: ['dressingType', 'proteinAddOns', 'flavorProfile', 'dietaryRestriction'],
    Appetizer: ['cookingMethod', 'flavorProfile', 'servingStyle'],
    StreetFood: ['cookingMethod', 'flavorProfile', 'spiceLevel', 'servingStyle'],
    MainCourse: ['cuisine', 'cookingMethod', 'spiceLevel', 'dietaryRestriction', 'proteinType'],
    Default: ['cuisine', 'cookingMethod', 'spiceLevel', 'dietaryRestriction']
  };

  const getAllowedFieldsForDishType = (dishTypeRaw) => {
    const mapKey = (() => {
      const t = String(dishTypeRaw || '').toLowerCase();
      if (t === 'beverages') return 'Beverages';
      if (t === 'snacks') return 'Snacks';
      if (t === 'desserts') return 'Desserts';
      if (t.includes('soup')) return 'Soup';
      if (t.includes('salad')) return 'Salad';
      if (t.startsWith('appetizers')) return 'Appetizer';
      if (t === 'main courses' || t === 'main course') return 'MainCourse';
      if (t.includes('street')) return 'StreetFood';
      return 'Default';
    })();
    return DISH_TYPE_FIELDS[mapKey] || DISH_TYPE_FIELDS.Default;
  };

  // Normalize user input (lightweight pre-processing for typos/mix-lang)
  const normalizeUserInput = (input) => {
    try {
      return String(input || '')
        .replace(/\s+/g, ' ')
        .replace(/frid\s+rice/gi, 'fried rice')
        .replace(/teh\s+manis\s+kurang\s+gula/gi, 'less sugar tea')
        .trim();
    } catch {
      return input;
    }
  };

  // Ask Sensay AI to normalize ambiguous/typoed input before extraction
  const normalizeWithAI = async (rawText, userLangHint = '') => {
    try {
      const message = `You are a food text normalizer.\nInput: "${rawText}"\nTask: Normalize into a short, clear ${userLangHint || 'English/Indonesian'} sentence of food preferences (dish, spice, sweetness, cooking method, etc.).\nIf nonsense, output exactly: UNKNOWN.`;
      const res = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId: `normalizer-${chatSessionId}`, source: 'web', skipHistory: true })
      });
      const data = await res.json();
      if (data?.content) {
        const s = String(data.content).trim();
        return s || rawText;
      }
    } catch {}
    return rawText;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll only when appropriate (e.g., user sends a message or user is already near bottom)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    // If user is already near the bottom or the last message is from the user/typing indicator, scroll down
    const container = messagesContainerRef.current;
    const nearBottom = (() => {
      if (!container) return true;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      return distanceFromBottom < 80; // threshold px
    })();

    if (isAtBottom || nearBottom || lastMessage.sender === 'user' || lastMessage.isTyping) {
    scrollToBottom();
    }
  }, [messages, isAtBottom]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsAtBottom(distanceFromBottom < 80);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize or restore chat session id
      try {
        const existing = sessionStorage.getItem('chat-session-id');
        const id = existing || String(Date.now());
        sessionStorage.setItem('chat-session-id', id);
        setChatSessionId(id);
      } catch {}

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

  // Persist chat messages across page navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Restore messages from sessionStorage when component mounts
      try {
        const savedMessages = sessionStorage.getItem('chatbot-messages');
        if (savedMessages && JSON.parse(savedMessages).length > 0) {
          setMessages(JSON.parse(savedMessages));
          setShowSuggestions(false); // Hide suggestions if we have saved messages
        }
      } catch (e) {
        console.warn('Failed to restore chat messages:', e);
      }
    }
  }, []);

  const askExtraQuestion = async () => {
    try {
      const isBeverage = (collectedPrefs.dishType || '').toLowerCase() === 'beverages';
      const systemHint = isBeverage
        ? 'Ask ONE super-short follow-up about a beverage preference (e.g., sweetness, temperature, creaminess, tanginess, add-ons). No options.'
        : 'Ask ONE super-short follow-up about flavors/constraints (e.g., garlicky/herby/tangy/creamy, quick-cook time, servings). No options.';
      const prompt = `User cooking context: ${JSON.stringify(collectedPrefs)}\n${systemHint}`;
      const res = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, userId: `chefbot-user-${chatSessionId}`, source: 'web', skipHistory: true })
      });
      const data = await res.json();
      let question = data?.content || (isBeverage ? 'Any sweetness or temperature preference?' : 'Any flavor emphasis or time constraint?');
      if (isBeverage) question = String(question).replace(/main\s*course/ig, 'beverage');
      setMessages(prev => [...prev, { id: Date.now(), text: question, sender: 'bot', timestamp: new Date(), suggestedAction: { type: 'natural-customization', step: 'extra-note' } }]);
    } catch {
      // No hardcoded follow-up: if AI fails, skip extra question and proceed naturally
      const prefs = { ...collectedPrefs };
      if (isSufficientPrefs(prefs)) {
        setLastRecipePayload(prefs);
        proposeDishIdea(prefs);
      }
    }
  };

  // Save messages to sessionStorage whenever messages change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        sessionStorage.setItem('chatbot-messages', JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to save chat messages:', e);
      }
    }
  }, [messages]);

  // Listen for Stage 2 message from AI page
  useEffect(() => {
    const handleStage2Message = (event) => {
      const stage2Message = event.detail;
      setMessages(prev => [...prev, stage2Message]);
    };

    window.addEventListener('chatbot-stage2', handleStage2Message);
    return () => window.removeEventListener('chatbot-stage2', handleStage2Message);
  }, []);

  // Listen for form field updates
  useEffect(() => {
    // Map chatbot NLP values to exact form option labels to avoid breaking manual flows
    const mapToFormValue = (field, value) => {
      try {
        switch (field) {
          case 'dietaryRestrictions': {
            const map = {
              vegetarian: 'Vegetarian',
              vegan: 'Vegan',
              gluten_free: 'Gluten-Free',
              'gluten-free': 'Gluten-Free',
              dairy_free: 'Dairy-Free',
              'dairy-free': 'Dairy-Free',
              nut_free: 'Nut-Free',
              'nut-free': 'Nut-Free',
              halal: 'Halal'
            };
            if (Array.isArray(value)) {
              return value
                .map(v => (typeof v === 'string' ? v : String(v)))
                .map(v => v.trim().toLowerCase())
                .map(v => map[v])
                .filter(Boolean);
            }
            return [];
          }
          case 'spiceLevel': {
            const t = String(value || '').trim().toLowerCase();
            if (t === 'mild') return 'Mild';
            if (t === 'medium') return 'Medium';
            if (t === 'hot' || t === 'spicy') return 'Spicy';
            if (t === 'extra spicy' || t === 'extra_spicy') return 'Extra Spicy';
            return '';
          }
          case 'skillLevel': {
            const t = String(value || '').trim().toLowerCase();
            if (t === 'beginner') return 'Beginner';
            if (t === 'intermediate') return 'Intermediate';
            if (t === 'advanced' || t === 'expert' || t === 'pro') return 'Advanced';
            return '';
          }
          case 'cookingMethod': {
            const t = String(value || '').trim().toLowerCase();
            if (t === 'ai' || t === 'any') return 'Any';
            if (t === 'no-cook' || t === 'no_cook' || t === 'no cook') return 'No-Cook';
            // Map common methods to existing form options
            if (t.includes('bake') || t.includes('oven')) return 'Oven';
            if (t.includes('grill') || t.includes('bbq')) return 'Grill';
            if (t.includes('air')) return 'Air Fryer';
            if (t.includes('slow')) return 'Slow Cooker';
            if (t.includes('pressure') || t.includes('instant')) return 'Pressure Cooker';
            if (t.includes('sheet')) return 'Sheet Pan';
            if (t.includes('one-pot') || t.includes('one pot')) return 'One-Pot';
            // boil/steam/fry/stir-fry → Stovetop
            if (t.includes('boil') || t.includes('steam') || t.includes('fry') || t.includes('stir')) return 'Stovetop';
            return '';
          }
          case 'dishType': {
            const t = String(value || '').trim().toLowerCase();
            if (t.includes('main')) return 'Main Courses';
            if (t.includes('appet') || t.includes('side')) return 'Appetizers & Sides';
            if (t.includes('dessert') || t.includes('sweet')) return 'Desserts';
            if (t.includes('bever') || t.includes('drink')) return 'Beverages';
            if (t.includes('snack')) return 'Snacks';
            return '';
          }
          default:
            return value;
        }
      } catch {
        return value;
      }
    };

    const handleFormUpdate = (event) => {
      const { field, value } = event.detail;
      console.log('📝 Form update received:', field, value);
      
      // Map values to form labels and send form update to AI page
      const mapped = mapToFormValue(field, value);
      window.dispatchEvent(new CustomEvent('form-field-update', {
        detail: { field, value: mapped }
      }));
    };

    window.addEventListener('chatbot-form-update', handleFormUpdate);
    return () => window.removeEventListener('chatbot-form-update', handleFormUpdate);
  }, []);

  // Remove option-click flow (we're switching to natural language only)

  const sendMessage = async () => {
    await handleSendMessage();
  };

  // Handle natural language customization
  const handleNaturalLanguageCustomization = async (userInput, lastBotMessage) => {
    console.log('🗣️ Natural language input:', userInput);
    
    try {
      // Normalize input first (preprocess + AI normalizer)
      const cleaned = normalizeUserInput(userInput);
      const normalized = await normalizeWithAI(cleaned, detectLanguage(userInput) === 'id' ? 'Indonesian' : 'English');
      const effectiveInput = (normalized && normalized !== 'UNKNOWN') ? normalized : cleaned;

      // Fast path: if user wants to proceed, fill minimal defaults and generate now
      const isProceedIntent = /(just\s+give\s+me\s+a?\s*recipe|go\s*ahead|that'?s\s*fine|lanjut(?:kan)?\s*generate|langsung\s*generate|ok\s*generate|generate\s*aja|gas(?:keun)?)/i.test(effectiveInput);
      if (isProceedIntent) {
        const updated = { ...collectedPrefs };
        if (!updated.dishType) updated.dishType = 'Main Courses';
        if (!updated.cuisine) updated.cuisine = 'International';
        if (!updated.spiceLevel) updated.spiceLevel = 'Medium';
        if (!updated.skillLevel) updated.skillLevel = 'Beginner';
        if (updated.dishType !== 'Beverages' && !updated.cookingMethod) updated.cookingMethod = 'AI';
        setCollectedPrefs(updated);
        setLastRecipePayload(updated);
        await generateRecipeInChat(updated);
        return;
      }

      // Capture extra note if we just asked one
      if (lastBotMessage?.suggestedAction?.step === 'extra-note') {
        const note = effectiveInput.trim();
        if (note) setExtraNotes(prev => [...prev, note]);
      }

      // Call AI to interpret natural language and extract preferences
      const response = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Analyze this user's cooking request and extract preferences. User said: "${effectiveInput}"

Please respond with a JSON object containing:
{
  "dishType": "Main Courses/Appetizers & Sides/Desserts/Beverages/Snacks",
  "cuisine": "Italian/Indian/Mexican/Thai/Chinese/Japanese/American/French/Mediterranean/Korean/International",
  "dietaryRestrictions": ["vegetarian", "vegan", "gluten_free", "dairy_free", "nut_free", "halal"],
  "spiceLevel": "mild/medium/hot",
  "skillLevel": "beginner/intermediate/advanced", 
  "cookingMethod": "bake/fry/grill/boil/steam/stir-fry",
  "interpretation": "Brief explanation of what you understood",
  "needsMoreInfo": ["list any missing info needed"]
}`,
          userId: 'chefbot-preference-analyzer',
          source: 'web'
        })
      });

      const data = await response.json();
      
      if (data.success && data.content) {
        try {
          const preferences = JSON.parse(data.content);
          console.log('🎯 Extracted preferences:', preferences);
          
          // Update form with extracted preferences
          Object.keys(preferences).forEach(key => {
            if (key !== 'interpretation' && key !== 'needsMoreInfo' && preferences[key]) {
              window.dispatchEvent(new CustomEvent('form-field-update', {
                detail: { field: key, value: preferences[key] }
              }));
            }
          });
          // Merge into collected preferences
          const updated = { ...collectedPrefs };
          if (preferences.dishType) updated.dishType = preferences.dishType;
          if (preferences.cuisine) updated.cuisine = preferences.cuisine;
          if (Array.isArray(preferences.dietaryRestrictions)) updated.dietaryRestrictions = preferences.dietaryRestrictions;
          if (preferences.spiceLevel) updated.spiceLevel = preferences.spiceLevel;
          if (preferences.skillLevel) updated.skillLevel = preferences.skillLevel;
          if (preferences.cookingMethod) updated.cookingMethod = preferences.cookingMethod;
          // Heuristic: detect ingredients from userInput
          const ingCandidates = effectiveInput.split(/,| dan /i).map(s => s.trim()).filter(s => s && s.length <= 40);
          if (ingCandidates.length >= 1) {
            updated.ingredients = ingCandidates.map(name => ({ name }));
          }
          setCollectedPrefs(updated);
          
          // Decide next step using AI signals (no extra filler messages)
          const missing = nextMissingField(updated);
          if (missing !== 'ready') {
            const askText = preferences.nextQuestion || null;
            if (askText) {
              // De-dupe same question
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.suggestedAction && last.suggestedAction.step === missing && last.text === askText) return prev;
                return [...prev, { id: Date.now()+2, text: askText, sender:'bot', timestamp:new Date(), suggestedAction:{ type:'natural-customization', step: missing } }];
              });
              setFollowupCount(c => c + 1);
            } else {
              askQuestionFor(missing);
              setFollowupCount(c => c + 1);
            }
          } else {
            if (preferences.proposedDish) {
              setLastRecipePayload({
                userPrompt: preferences.proposedDish,
                dishType: updated.dishType || 'Main Courses',
                cuisine: updated.cuisine || 'International',
                dietaryRestrictions: typeof updated.dietaryRestrictions === 'undefined' ? [] : updated.dietaryRestrictions,
                spiceLevel: updated.spiceLevel || 'Medium',
                skillLevel: updated.skillLevel || 'Beginner',
                cookingMethod: updated.cookingMethod || 'AI',
                ingredients: updated.ingredients || []
              });
              setMessages(prev => [...prev, { id: Date.now()+3, text: `Siap! Akan saya buat <strong>${preferences.proposedDish}</strong>. Ketik "yes" untuk generate.`, sender:'bot', timestamp:new Date(), suggestedAction:{ type:'recipe-generator-final' }}]);
            } else if (isSufficientPrefs(updated)) {
              if (followupCount < 2) {
                askExtraQuestion();
                setFollowupCount(c => c + 1);
              } else {
                setLastRecipePayload(updated);
                proposeDishIdea(updated);
              }
            } else {
              proposeDishIdea(updated);
            }
          }
          
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          // No filler response; continue flow
          // Use heuristics to continue the flow
          const updated = { ...collectedPrefs, ...detectDishAndPrefsFromText(effectiveInput) };
          // Parse ingredients from user input
          const ingCandidates = effectiveInput.split(/,| dan /i).map(s => s.trim()).filter(Boolean);
          if (ingCandidates.length) updated.ingredients = ingCandidates.map(name => ({ name }));
          setCollectedPrefs(updated);
          const missing = nextMissingField(updated);
          if (missing !== 'ready') {
            askQuestionFor(missing);
            setFollowupCount(c => c + 1);
          } else {
            if (followupCount < 2) {
              askExtraQuestion();
              setFollowupCount(c => c + 1);
            } else {
              proposeDishIdea(updated);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in natural language customization:', error);
    }
  };

  // Local fallback random suggestion generator
  const getRandomSuggestion = () => {
    const dishes = [
      { name: 'Spaghetti Aglio e Olio', desc: "It's a simple Italian pasta with garlic, olive oil, and chili flakes.", cuisine: 'Italian' },
      { name: 'Thai Green Curry', desc: "Fragrant curry with coconut milk, green curry paste, and vegetables.", cuisine: 'Thai' },
      { name: 'Chicken Teriyaki Bowl', desc: "Savory-sweet glazed chicken served over steamed rice.", cuisine: 'Japanese' },
      { name: 'Vegan Buddha Bowl', desc: "Colorful bowl with grains, roasted veggies, and creamy tahini dressing.", cuisine: 'International' },
      { name: 'Shakshuka', desc: "Eggs poached in a spicy tomato and pepper sauce.", cuisine: 'Middle Eastern' },
      { name: 'Caprese Salad', desc: "Tomato, mozzarella, basil, and balsamic glaze—fresh and light.", cuisine: 'Italian' },
      { name: 'Mexican Street Tacos', desc: "Soft tortillas filled with seasoned meat, onions, and cilantro.", cuisine: 'Mexican' },
      { name: 'Paneer Butter Masala', desc: "Creamy, mildly spiced Indian curry with paneer cubes.", cuisine: 'Indian' }
    ];
    // Avoid repeating the last suggestion in this session
    let last = null;
    try { last = sessionStorage.getItem('last-random-dish'); } catch {}
    let pick = dishes[Math.floor(Math.random() * dishes.length)];
    if (last) {
      let guard = 0;
      while (pick.name === last && guard++ < 5) {
        pick = dishes[Math.floor(Math.random() * dishes.length)];
      }
    }
    try { sessionStorage.setItem('last-random-dish', pick.name); } catch {}
    return `How about trying a delicious <strong>${pick.name}</strong>? ${pick.desc} If you'd like more details or a recipe, just let me know!`;
  };

  // Heuristic: detect dish and simple prefs from free text
  const detectDishAndPrefsFromText = (text) => {
    const t = text.toLowerCase();
    const result = {
      userPrompt: text.trim(),
      dishType: 'Main Courses',
      cuisine: 'International',
      dietaryRestrictions: [],
      spiceLevel: /pedas|spicy|hot/.test(t) ? 'Hot' : (/mild|tidak pedas|no spice/.test(t) ? 'Mild' : 'Medium'),
      skillLevel: 'Beginner',
      cookingMethod: '',
      ingredients: []
    };
    // Dish name detection: take phrase before first comma if it looks like a dish
    const beforeComma = text.split(',')[0].trim();
    if (beforeComma && beforeComma.length > 3 && !/(spice|level|method|beginner|intermediate|advanced|fry|bake|grill|boil|steam|stir|dish|course)/i.test(beforeComma)) {
      result.userPrompt = beforeComma;
    }
    // Common dish heuristics → set cuisine defaults
    if (/fried\s+rice|nasi\s+goreng/i.test(text)) result.cuisine = 'Indonesian';
    if (/tikka|masala|biryani|curry/i.test(text)) result.cuisine = 'Indian';
    if (/sushi|teriyaki/i.test(text)) result.cuisine = 'Japanese';
    // Cuisine detection
    if (/nasi goreng|rendang|sate|bakso|indonesia|indonesian/.test(t)) result.cuisine = 'Indonesian';
    else if (/tikka|masala|biryani|curry|india|indian/.test(t)) result.cuisine = 'Indian';
    else if (/taco|mexic/.test(t)) result.cuisine = 'Mexican';
    else if (/pasta|ital/.test(t)) result.cuisine = 'Italian';
    else if (/sushi|teriyaki|japan/.test(t)) result.cuisine = 'Japanese';
    else if (/thai/.test(t)) result.cuisine = 'Thai';
    // Dish type
    if (/salad|appetizer|snack/.test(t)) result.dishType = /salad/.test(t) ? 'Appetizers & Sides' : 'Snacks';
    if (/dessert|cake|sweet/.test(t)) result.dishType = 'Desserts';
    if (/drink|beverage|minuman|tea|coffee|juice|smoothie|lassi|milkshake/.test(t)) result.dishType = 'Beverages';
    if (result.dishType === 'Beverages') {
      result.cookingMethod = 'No-Cook';
    }
    // Dietary
    const diets = [];
    if (/vegan/.test(t)) diets.push('vegan');
    if (/vegetarian/.test(t)) diets.push('vegetarian');
    if (/gluten[- ]?free/.test(t)) diets.push('gluten_free');
    if (/dairy[- ]?free/.test(t)) diets.push('dairy_free');
    if (/nut[- ]?free/.test(t)) diets.push('nut_free');
    if (/halal/.test(t)) diets.push('halal');
    if (diets.length) result.dietaryRestrictions = diets;
    return result;
  };

  const isSufficientPrefs = (prefs) => {
    const needsMethod = prefs.dishType !== 'Beverages';
    const fields = [prefs.dishType, prefs.cuisine, prefs.spiceLevel, prefs.skillLevel];
    if (needsMethod) fields.push(prefs.cookingMethod);
    const filled = fields.filter(Boolean).length;
    const hasDishOrContext = !!(prefs.userPrompt && prefs.userPrompt.length > 2) || (!!prefs.dishType && !!prefs.cuisine);
    return hasDishOrContext && filled >= (needsMethod ? 3 : 2);
  };

  // Quick local parser for short replies like "vegan" or "medium"
  const applyQuickPreference = (text, currentStepHint = '') => {
    const t = text.toLowerCase().trim();
    const updated = { ...collectedPrefs };
    let matched = false;
    {
      const diets = [];
      if (/^(no|none|tidak|tak|nggak|ga|tidak ada|no restrictions|bebas)$/i.test(t)) {
        updated.dietaryRestrictions = [];
        matched = true;
      }
      if (/(^|\s)vegan(\s|$)/.test(t)) diets.push('vegan');
      if (/(^|\s)vegetarian(\s|$)/.test(t)) diets.push('vegetarian');
      if (/gluten[- ]?free/.test(t)) diets.push('gluten_free');
      if (/dairy[- ]?free/.test(t)) diets.push('dairy_free');
      if (/nut[- ]?free/.test(t)) diets.push('nut_free');
      if (/(^|\s)halal(\s|$)/.test(t)) diets.push('halal');
      if (diets.length) { updated.dietaryRestrictions = diets; matched = true; }
    }
    {
      if (/(^|\s)mild(\s|$)/.test(t)) { updated.spiceLevel = 'Mild'; matched = true; }
      else if (/(^|\s)medium(\s|$)/.test(t)) { updated.spiceLevel = 'Medium'; matched = true; }
      else if (/(^|\s)hot|spicy(\s|$)/.test(t)) { updated.spiceLevel = 'Hot'; matched = true; }
    }
    {
      if (/beginner|pemula|simple|mudah|gampang/.test(t)) { updated.skillLevel = 'Beginner'; matched = true; }
      else if (/intermediate|menengah/.test(t)) { updated.skillLevel = 'Intermediate'; matched = true; }
      else if (/advanced|mahir|expert|pro/.test(t)) { updated.skillLevel = 'Advanced'; matched = true; }
    }
    {
      if (/up to you|anything|bebas|terserah|apa saja/i.test(text)) { updated.cookingMethod = 'AI'; matched = true; }
      else if (/bake|oven/.test(t)) { updated.cookingMethod = 'bake'; matched = true; }
      else if (/fry|goreng|pan/.test(t)) { updated.cookingMethod = 'fry'; matched = true; }
      else if (/grill|panggang/.test(t)) { updated.cookingMethod = 'grill'; matched = true; }
      else if (/boil|rebus|simmer/.test(t)) { updated.cookingMethod = 'boil'; matched = true; }
      else if (/steam|kukus/.test(t)) { updated.cookingMethod = 'steam'; matched = true; }
      else if (/stir[- ]?fry|tumis|wok/.test(t)) { updated.cookingMethod = 'stir-fry'; matched = true; }
    }
    {
      if (/main course|main courses|utama/.test(t)) { updated.dishType = 'Main Courses'; matched = true; }
      else if (/appetizer|starter|sides|side/.test(t)) { updated.dishType = 'Appetizers & Sides'; matched = true; }
      else if (/dessert|manis|pencuci mulut/.test(t)) { updated.dishType = 'Desserts'; matched = true; }
      else if (/beverage|drink|minuman|breakfast\s+drink/.test(t)) { updated.dishType = 'Beverages'; matched = true; }
      else if (/snack|cemilan|camilan/.test(t)) { updated.dishType = 'Snacks'; matched = true; }
    }
    {
      if (/indones/.test(t)) { updated.cuisine = 'Indonesian'; matched = true; }
      else if (/ital/.test(t)) { updated.cuisine = 'Italian'; matched = true; }
      else if (/indian|india/.test(t)) { updated.cuisine = 'Indian'; matched = true; }
      else if (/thai/.test(t)) { updated.cuisine = 'Thai'; matched = true; }
      else if (/japan/.test(t)) { updated.cuisine = 'Japanese'; matched = true; }
      else if (/mexic/.test(t)) { updated.cuisine = 'Mexican'; matched = true; }
    }
    // Try to infer a dish name when present at start
    const firstToken = text.split(',')[0].trim();
    if (firstToken && !/(spice|level|method|beginner|intermediate|advanced)/i.test(firstToken) && firstToken.length > 3) {
      updated.userPrompt = firstToken;
      matched = true;
    }
    if (matched) {
      // Guard: if user wrote "simple", prefer Beginner skill
      if (/\bsimple\b|\bmudah\b|\bgampang\b/i.test(message)) {
        updated.skillLevel = 'Beginner';
      }
      setCollectedPrefs(updated);
      return updated;
    }
    return null;
  };

  const isUnknownAnswer = (txt) => {
    const t = (txt || '').toLowerCase();
    return /(tak tahu|tidak tahu|gak tau|terserah|apa saja|anything|any|up to you|bebas)/i.test(t);
  };

  // Check if question is off-topic (non-cooking related)
  const isOffTopicQuestion = (message) => {
    const offTopicPatterns = [
      // Weather
      /^(how'?s the weather|what'?s the weather|weather today|cuaca hari ini|bagaimana cuaca)/i,
      // Politics
      /^(who is the president|politics|election|voting|presiden siapa|politik|pemilu)/i,
      // Technology
      /^(what'?s the latest tech|new technology|latest gadget|teknologi terbaru|gadget baru)/i,
      // Sports
      /^(football|soccer|basketball|sports|olahraga|sepak bola|basket)/i,
      // Entertainment
      /^(movie|film|music|song|game|video game|film apa|lagu apa|game apa)/i,
      // General knowledge
      /^(what'?s the capital of|where is|when was|who invented|apa ibu kota|dimana|kapan|siapa yang)/i,
      // Personal questions
      /^(how old are you|what'?s your name|where do you live|berapa umur|nama kamu|dimana tinggal)/i,
      // Current events
      /^(what'?s happening|news today|berita hari ini|apa yang terjadi)/i,
      // Mathematics/Science
      /^(solve this math|calculate|what'?s 2\+2|hitung|matematika|fisika|kimia)/i
    ];
    
    return offTopicPatterns.some(pattern => pattern.test(message));
  };

  const nextMissingField = (prefs) => {
    if (!prefs.dishType) return 'dishType';
    if (!prefs.cuisine) return 'cuisine';
    if (!prefs.spiceLevel) return 'spiceLevel';
    // Accept explicit none: empty array means user said no restrictions; only ask if undefined
    if (typeof prefs.dietaryRestrictions === 'undefined') return 'dietaryRestrictions';
    if (!prefs.skillLevel) return 'skillLevel';
    if (prefs.dishType !== 'Beverages' && !prefs.cookingMethod) return 'cookingMethod';
    return 'ready';
  };

  const askQuestionFor = (field) => {
    // Delegate question wording to Sensay AI (no hardcoded text)
    (async () => {
      // Beverages do not need cooking method; if requested, switch to beveragePreference instead of cookingMethod
      const isBeverage = collectedPrefs.dishType === 'Beverages';
      let effectiveField = (isBeverage && field === 'cookingMethod') ? 'beveragePreference' : field;

      // Schema guard: skip irrelevant fields for current dish type
      const allowed = getAllowedFieldsForDishType(collectedPrefs.dishType);
      if (effectiveField && !allowed.includes(effectiveField)) {
        // Skip and move to next meaningful field
        const next = nextMissingField(collectedPrefs);
        if (next !== 'ready') {
          askQuestionFor(next);
        } else {
          proposeDishIdea(collectedPrefs);
        }
        return;
      }
      // Skip if already answered or previously asked for this field
      if ((effectiveField && collectedPrefs[effectiveField]) || askedFields[effectiveField] || lockedFields[effectiveField]) {
        const next = nextMissingField(collectedPrefs);
        if (next !== 'ready') {
          askQuestionFor(next);
        } else {
          proposeDishIdea(collectedPrefs);
        }
        return;
      }
      try {
        const prompt = `You are a recipe assistant.\nCurrent user preferences: ${JSON.stringify(collectedPrefs, null, 2)}\n\nMissing field: ${effectiveField}\n\nRULES:\n- Ask ONE short, natural follow-up question in the user's language.\n- Do NOT include options or explanations.\n- Keep the question under 15 words.\n- If dishType = Beverages, NEVER ask about cooking methods. Ask temperature (hot/iced), sweetness (no/less/sweet), or flavor add-ons (milk, lemon, mint, etc.).`;
        const res = await fetch('/api/sensay-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt, userId: `chefbot-user-${chatSessionId}`, source: 'web', skipHistory: true })
        });
        const data = await res.json();
        let question = (data?.content || '').trim();
        // Guard: sanitize/beverage-safe if AI misbehaves
        if (isBeverage && (/cook|method|main\s*course/i.test(question))) {
          question = 'Would you like your drink hot or iced?';
        }
        if (!question) {
          // If AI returns empty, skip asking a fallback and try next step
          const next = nextMissingField(collectedPrefs);
          if (next !== 'ready') {
            askQuestionFor(next);
          } else {
            proposeDishIdea(collectedPrefs);
          }
          return;
        }
        setAskedFields(prev => ({ ...prev, [effectiveField]: true }));
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: question,
          sender: 'bot',
          timestamp: new Date(),
          suggestedAction: { type: 'natural-customization', step: effectiveField }
        }]);
      } catch {
        // On failure, do not inject hardcoded question; proceed flow
        const next = nextMissingField(collectedPrefs);
        if (next !== 'ready') {
          // try the next missing field
          askQuestionFor(next);
        } else {
          proposeDishIdea(collectedPrefs);
        }
      }
    })();
  };

  const proposeDishIdea = (prefs) => {
    const cuisine = prefs.cuisine || 'International';
    const dishType = prefs.dishType || 'Main Courses';
    const ideaMap = {
      Indonesian: 'Nasi Goreng Spesial',
      Indian: 'Chicken Tikka Masala',
      Italian: 'Spaghetti Aglio e Olio',
      Japanese: 'Chicken Teriyaki Bowl',
      Thai: 'Thai Green Curry',
      Mexican: 'Street Tacos',
      International: 'Savory Stir-fry Bowl'
    };
    const idea = ideaMap[cuisine] || ideaMap.International;
    const text = `Bagaimana kalau membuat <strong>${idea}</strong> (${cuisine} • ${dishType})?`;
    const msg = {
      id: Date.now(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      suggestedAction: {
        type: 'recipe-generator-final',
        options: ['Generate Now', 'Customize Details']
      }
    };
    setLastRecipePayload({
      userPrompt: idea,
      dishType,
      cuisine,
      dietaryRestrictions: prefs.dietaryRestrictions || [],
      spiceLevel: prefs.spiceLevel || 'Medium',
      skillLevel: prefs.skillLevel || 'Beginner',
      cookingMethod: prefs.cookingMethod || '',
      ingredients: prefs.ingredients || []
    });
    setMessages(prev => [...prev, msg]);
    setAwaitingConfirmation(true);
  };

  // Build a rich recipe card from free-text recipe responses (Indonesian/English)
  const buildRecipeCardFromFreeText = async (content, userMsg = '') => {
    const raw = content || '';
    const clean = raw.replace(/<[^>]*>/g, '');
    const isRecipeLike = /(Ingredients:|Bahan-bahan:)/i.test(clean) && /(Instructions:|Cara membuat:)/i.test(clean);
    if (!isRecipeLike) return null;

    // Dish name: first line before a newline or from user message
    let title = (clean.split('\n')[0] || '').trim();
    // If title is generic text, try extracting after phrases
    const m1 = clean.match(/(?:resep|recipe)\s+(.*)/i);
    if (m1 && m1[1]) title = m1[1].trim();
    if (!title || title.length < 3) title = userMsg.trim() || 'Delicious Dish';
    title = title.replace(/^[Hh]ow about\s+(?:making|trying|cooking)?\s*/,'').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,'').replace(/\s*[\.!?]+\s*$/,'').trim();

    // Cuisine & dish type heuristics
    const detected = detectDishAndPrefsFromText(`${userMsg} ${clean}`);
    const cuisine = detected.cuisine || 'International';
    const dishType = detected.dishType || 'Main Courses';
    const servings = '4';

    // Extract ingredients
    let ingredientsHtml = '';
    const ingSection = clean.match(/(?:Ingredients:|Bahan-bahan:)([\s\S]*?)(?:Instructions:|Cara membuat:|$)/i);
    if (ingSection) {
      const lines = ingSection[1].split('\n').map(l => l.trim()).filter(l => l && !/^\s*(Ingredients:|Bahan-bahan:)\s*$/i.test(l));
      // Normalize bullet lines
      const items = lines.filter(l => /^[-*\d]/.test(l) || /^[A-Za-z0-9]/.test(l)).slice(0, 30);
      ingredientsHtml = items.map(l => {
        const cleaned = l.replace(/^[-*\d\.)\s]+/, '').trim();
        // Try split name: qty
        const m = cleaned.match(/^([^:]+):\s*(.+)$/);
        const name = (m ? m[1] : cleaned).trim();
        const qty = (m ? m[2] : '').trim();
        return `<li><span style=\"color: var(--text-primary);\">${name}</span>${qty ? ` <span style=\"color: var(--accent);\">${qty}</span>` : ''}</li>`;
      }).join('');
    }

    // Extract instructions
    let instructionsHtml = '';
    const instSection = clean.match(/(?:Instructions:|Cara membuat:)([\s\S]*)$/i);
    if (instSection) {
      const lines = instSection[1].split('\n').map(l => l.trim()).filter(l => l);
      const steps = lines.filter(l => /^\d+[\.)]?\s+/.test(l) || /^[A-Za-z]/.test(l)).slice(0, 20);
      instructionsHtml = steps.map(l => {
        const m = l.match(/^\d+[\.)]?\s+(.+)/);
        return `<li>${(m ? m[1] : l).trim()}</li>`;
      }).join('');
    }

    if (!ingredientsHtml || !instructionsHtml) {
      return null; // avoid replacing if parsing failed; let plain text show
    }

    // Try to get an image
    let imageUrl = '';
    try {
      const imgRes = await fetch('/api/generate-recipe-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: title }) });
      if (imgRes.ok) {
        const imgJson = await imgRes.json();
        imageUrl = imgJson.url || '';
      }
    } catch {}

    const html = `
      <div>
        <div class=\"text-center mb-2\"><span class=\"badge\">Sensay AI</span></div>
        <h3 style=\"color: var(--accent);\" class=\"text-lg font-bold mb-2\">${title} 🍲</h3>
        <div class=\"flex gap-2 flex-wrap mb-3\">
          <span class=\"badge badge-info\">${cuisine}</span>
          <span class=\"badge badge-success\">${dishType}</span>
          <span class=\"badge badge-warning\">${servings} servings</span>
        </div>
        ${imageUrl ? `<div class=\"mb-3\"><img src=\"${imageUrl}\" alt=\"${title}\" class=\"w-full h-auto rounded\"/></div>` : ''}
        <div class=\"mb-3\">
          <h4 class=\"font-semibold\" style=\"color: var(--accent);\">Ingredients</h4>
          <ul class=\"list-disc ml-5\">${ingredientsHtml}</ul>
        </div>
        <div class=\"mb-3\">
          <h4 class=\"font-semibold\" style=\"color: var(--accent);\">Instructions</h4>
          <ol class=\"list-decimal ml-5\">${instructionsHtml}</ol>
        </div>
      </div>
    `;
    return html;
  };

  const startDietFlow = async () => {
    try {
      setDietFlowActive(true);
      // Start with height question (same as manual form)
      const question = 'What is your height in cm? (e.g., 175)';
      setMessages(prev => [...prev, { id: Date.now(), text: question, sender: 'bot', timestamp: new Date(), suggestedAction: { type: 'diet-customization', step: 'height' } }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), text: 'What is your height in cm? (e.g., 175)', sender: 'bot', timestamp: new Date(), suggestedAction: { type: 'diet-customization', step: 'height' } }]);
    }
  };

  const startNutritionAI = async (directQuestion = null) => {
    try {
      setNutritionFlowActive(true);
      
      if (directQuestion) {
        // Handle direct nutrition questions like "how much nutrition in a garlic?"
        await handleNutritionAnalysis(directQuestion, { suggestedAction: { type: 'nutrition-analysis', step: 'input' } });
        return;
      }
      
      const question = '🍎 <strong>Nutrition AI Ready!</strong><br><br>Please paste your recipe ingredients here, and I\'ll analyze the nutrition facts for you!<br><br><strong>Example:</strong><br>- 1 cup rice<br>- 200g chicken breast<br>- 2 tbsp olive oil<br>- 1 onion, diced<br>- Salt and pepper to taste';
      setMessages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        text: question, 
        sender: 'bot', 
        timestamp: new Date(), 
        suggestedAction: { type: 'nutrition-analysis', step: 'input' } 
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        text: '🍎 <strong>Nutrition AI Ready!</strong><br><br>Please paste your recipe ingredients here, and I\'ll analyze the nutrition facts for you!', 
        sender: 'bot', 
        timestamp: new Date(), 
        suggestedAction: { type: 'nutrition-analysis', step: 'input' } 
      }]);
    }
  };

  const startHealthCoach = async () => {
    try {
      setHealthCoachActive(true);
      const question = '🧠 <strong>AI Health Coach Ready!</strong><br><br>I can help you with:<br>• 🎯 Health goals & planning<br>• 🍎 Nutrition advice<br>• 💪 Exercise recommendations<br>• 😴 Sleep & wellness tips<br>• 🧘 Stress management<br>• 🏥 General health questions<br><br>What would you like advice on?';
      setMessages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        text: question, 
        sender: 'bot', 
        timestamp: new Date(), 
        suggestedAction: { type: 'health-coach', step: 'input' } 
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        text: '🧠 <strong>AI Health Coach Ready!</strong><br><br>What health advice do you need?', 
        sender: 'bot', 
        timestamp: new Date(), 
        suggestedAction: { type: 'health-coach', step: 'input' } 
      }]);
    }
  };

  const handleNutritionAnalysis = async (userMessage, lastBotMessage) => {
    const step = lastBotMessage.suggestedAction.step;
    
    if (step === 'input') {
      if (!userMessage.trim()) {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          text: 'Please provide the recipe ingredients for nutrition analysis.',
          sender: 'bot',
          timestamp: new Date(),
          suggestedAction: { type: 'nutrition-analysis', step: 'input' }
        }]);
        return;
      }

      setNutritionInput(userMessage);
      
      // Show loading message
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: '🍎 Analyzing nutrition facts...',
        sender: 'bot',
        timestamp: new Date()
      }]);

      try {
        // Call nutrition analysis API
        const response = await fetch('/api/analyze-nutrients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe: userMessage })
        });

        const data = await response.json();
        
        if (data.nutrition && !data.nutrition.error) {
          // Display nutrition results
          const nutritionHtml = `
            <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 8px 0;">
              <h3 style="color: #ff8c00; font-weight: bold; text-align: center; margin-bottom: 16px;">
                🍎 Nutrition Facts (per serving)
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${Object.entries(data.nutrition).map(([key, value]) => `
                    <tr style="border-top: 1px solid #e2e8f0;">
                      <td style="padding: 8px; font-weight: 600; text-transform: capitalize; color: #2d3748;">
                        ${key}
                      </td>
                      <td style="padding: 8px; color: #4a5568;">
                        ${value}${key === 'sodium' || key === 'cholesterol' ? ' mg' : ' g'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;

          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: nutritionHtml,
            sender: 'bot',
            timestamp: new Date(),
            suggestedAction: { type: 'nutrition-analysis', step: 'complete' }
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: '⚠️ Sorry, I couldn\'t analyze the nutrition facts for those ingredients. Please try with different ingredients or check the format.',
            sender: 'bot',
            timestamp: new Date(),
            suggestedAction: { type: 'nutrition-analysis', step: 'input' }
          }]);
        }
      } catch (error) {
        console.error('Nutrition analysis error:', error);
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          text: '⚠️ Sorry, there was an error analyzing the nutrition facts. Please try again.',
          sender: 'bot',
          timestamp: new Date(),
          suggestedAction: { type: 'nutrition-analysis', step: 'input' }
        }]);
      }
      
      // Reset flow
      setNutritionFlowActive(false);
      setNutritionInput('');
    }
  };

  const handleHealthCoach = async (userMessage, lastBotMessage) => {
    const step = lastBotMessage.suggestedAction.step;
    
    if (step === 'input') {
      if (!userMessage.trim()) {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          text: 'Please tell me what health advice you need. I can help with nutrition, exercise, sleep, stress management, and general wellness.',
          sender: 'bot',
          timestamp: new Date(),
          suggestedAction: { type: 'health-coach', step: 'input' }
        }]);
        return;
      }

      setHealthCoachInput(userMessage);
      
      // Show loading message
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: '🧠 Analyzing your health needs and preparing personalized advice...',
        sender: 'bot',
        timestamp: new Date()
      }]);

      try {
        // Call Sensay AI for personalized health advice
        const response = await fetch('/api/sensay-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `As an AI Health Coach, provide personalized health advice for: "${userMessage}"
            
            Please respond with a JSON object containing:
            {
              "goal": "brief description of their health goal",
              "advice": "detailed, practical health advice",
              "actionSteps": "3-5 specific action steps they can take",
              "category": "nutrition|exercise|wellness|sleep|stress|general"
            }
            
            Focus on:
            - Practical, actionable advice
            - Evidence-based recommendations
            - Personalized approach based on their input
            - Motivational support
            - Safety considerations
            
            Always remind users to consult healthcare professionals for medical concerns.
            
            Keep advice concise but comprehensive, and make it actionable.`,
            userId: 'chefbot-health-coach',
            source: 'web'
          })
        });

        const data = await response.json();
        
        if (data.success && data.content) {
          try {
            // Try to extract JSON from markdown code block first
            let jsonText = null;
            const codeBlockMatch = data.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
              jsonText = codeBlockMatch[1];
            } else {
              // Fallback to direct JSON parse
              jsonText = data.content;
            }

            const healthAdvice = JSON.parse(jsonText);
            
            // Display health advice results
            const healthAdviceHtml = `
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; padding: 20px; margin: 8px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <h3 style="color: white; font-weight: bold; margin-bottom: 16px; text-align: center; font-size: 18px;">
                  🧠 Personalized Health Advice
                </h3>
                
                <div style="background: rgba(255,255,255,0.15); padding: 14px; border-radius: 8px; margin-bottom: 12px; backdrop-filter: blur(10px);">
                  <strong style="color: #ffd700;">🎯 Your Goal:</strong><br>
                  <span style="font-size: 14px;">${healthAdvice.goal || 'Health improvement'}</span>
                </div>
                
                <div style="background: rgba(255,255,255,0.15); padding: 14px; border-radius: 8px; margin-bottom: 12px; backdrop-filter: blur(10px);">
                  <strong style="color: #ffd700;">💡 Recommendation:</strong><br>
                  <span style="font-size: 14px;">${healthAdvice.advice || 'Focus on balanced nutrition and regular exercise.'}</span>
                </div>
                
                <div style="background: rgba(255,255,255,0.15); padding: 14px; border-radius: 8px; margin-bottom: 12px; backdrop-filter: blur(10px);">
                  <strong style="color: #ffd700;">📋 Action Steps:</strong><br>
                  <span style="font-size: 14px;">${healthAdvice.actionSteps || '1. Start with small changes\n2. Stay consistent\n3. Monitor progress'}</span>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; margin-top: 12px; text-align: center;">
                  <span style="font-size: 11px; opacity: 0.9;">
                    ⚠️ Always consult healthcare professionals for medical concerns
                  </span>
                </div>
              </div>
            `;

            setMessages(prev => [...prev, {
              id: Date.now() + Math.random(),
              text: healthAdviceHtml,
              sender: 'bot',
              timestamp: new Date(),
              suggestedAction: { type: 'health-coach', step: 'complete' }
            }]);
          } catch (parseError) {
            console.error('Failed to parse health advice response:', parseError);
            
            // Fallback: display raw response
            const fallbackHtml = `
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; padding: 20px; margin: 8px 0;">
                <h3 style="color: white; font-weight: bold; margin-bottom: 16px; text-align: center;">
                  🧠 Health Advice
                </h3>
                <div style="background: rgba(255,255,255,0.15); padding: 14px; border-radius: 8px; font-size: 14px;">
                  ${data.content.replace(/\n/g, '<br>')}
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; margin-top: 12px; text-align: center;">
                  <span style="font-size: 11px; opacity: 0.9;">
                    ⚠️ Always consult healthcare professionals for medical concerns
                  </span>
                </div>
              </div>
            `;

            setMessages(prev => [...prev, {
              id: Date.now() + Math.random(),
              text: fallbackHtml,
              sender: 'bot',
              timestamp: new Date(),
              suggestedAction: { type: 'health-coach', step: 'complete' }
            }]);
          }
        } else {
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: '⚠️ Sorry, I couldn\'t generate health advice right now. Please try again or consult a healthcare professional for medical concerns.',
            sender: 'bot',
            timestamp: new Date(),
            suggestedAction: { type: 'health-coach', step: 'input' }
          }]);
        }
      } catch (error) {
        console.error('Health coach error:', error);
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          text: '⚠️ Sorry, there was an error generating health advice. Please try again or consult a healthcare professional.',
          sender: 'bot',
          timestamp: new Date(),
          suggestedAction: { type: 'health-coach', step: 'input' }
        }]);
      }
      
      // Reset flow
      setHealthCoachActive(false);
      setHealthCoachInput('');
    }
  };

  const handleDietCustomization = async (userMessage, lastBotMessage) => {
    const step = lastBotMessage.suggestedAction.step;
    
    // Handle confirmation step
    if (step === 'confirm') {
      // Extract additional info from user input
      const userInput = userMessage.toLowerCase();
      const updatedPrefs = { ...dietPrefs };
      
      // Extract height, weight, age, gender
      const heightMatch = userInput.match(/(\d+)\s*(?:cm|height)/i);
      const weightMatch = userInput.match(/(\d+)\s*(?:kg|weight)/i);
      const ageMatch = userInput.match(/(\d+)\s*(?:year|yr|age)/i);
      const genderMatch = userInput.match(/(male|female|man|woman)/i);
      
      if (heightMatch) updatedPrefs.height = parseInt(heightMatch[1]);
      if (weightMatch) updatedPrefs.weight = parseInt(weightMatch[1]);
      if (ageMatch) updatedPrefs.age = parseInt(ageMatch[1]);
      if (genderMatch) updatedPrefs.gender = genderMatch[1];
      
      setDietPrefs(updatedPrefs);
      
      // Check if user wants to proceed
      if (/(yes|yep|sure|ok|generate|lanjut|gas|oke|up to you|whatever|fine|good)/i.test(userMessage)) {
        await generateDietPlan();
        return;
      } else if (/(no|nope|cancel|batal|stop)/i.test(userMessage)) {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: 'No problem! Feel free to ask for a diet plan anytime.', 
          sender: 'bot', 
          timestamp: new Date() 
        }]);
        setDietFlowActive(false);
        setDietPrefs({ 
          goal: '', 
          height: '', 
          weight: '', 
          age: '', 
          gender: '', 
          activityLevel: '', 
          dietPreference: '', 
          bloodSugar: '', 
          bloodPressure: '', 
          exclusions: '', 
          allergies: '', 
          cuisinePrefs: '' 
        });
        return;
      } else {
        // If user provides additional info, proceed with generation
        await generateDietPlan();
        return;
      }
    }
    
    try {
      // Normalize input first (same as recipe generator)
      const cleaned = normalizeUserInput(userMessage);
      
      // Check if input is simple (number, gender, activity level, etc.) - don't normalize these
      const isNumericInput = /^\d+(\.\d+)?\s*(cm|kg|year|yr)?\s*$/i.test(cleaned.trim());
      const isGenderInput = /^(male|female|other|prefer not to say|man|woman)$/i.test(cleaned.trim());
      const isActivityInput = /^(sedentary|lightly active|moderately active|very active|extremely active)$/i.test(cleaned.trim());
      const isGoalInput = /^(bulk|cut|maintain|general health|lose weight|gain muscle|cut - lose fat|bulk - gain muscle mass|maintain current weight)$/i.test(cleaned.trim());
      const isDietInput = /^(vegetarian|non-vegetarian|eggetarian|vegan)$/i.test(cleaned.trim());
      const isHealthInput = /^(normal|prediabetic|diabetic|elevated|high stage 1|high stage 2)$/i.test(cleaned.trim());
      
      const isSimpleInput = isNumericInput || isGenderInput || isActivityInput || isGoalInput || isDietInput || isHealthInput;
      console.log('🔍 Input analysis:', { userMessage, cleaned, isSimpleInput, type: isNumericInput ? 'numeric' : isGenderInput ? 'gender' : isActivityInput ? 'activity' : isGoalInput ? 'goal' : isDietInput ? 'diet' : isHealthInput ? 'health' : 'complex' });
      
      let effectiveInput;
      if (isSimpleInput) {
        effectiveInput = cleaned;
        console.log('🔢 Simple input detected, skipping normalization:', effectiveInput);
      } else {
        const normalized = await normalizeWithAI(cleaned, detectLanguage(userMessage) === 'id' ? 'Indonesian' : 'English');
        effectiveInput = (normalized && normalized !== 'UNKNOWN') ? normalized : cleaned;
        console.log('🗣️ Normalized input:', effectiveInput);
      }

      // Call SENSAY AI to interpret diet preferences (same pattern as recipe generator)
      const response = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Analyze this user's diet information and extract preferences. User said: "${effectiveInput}"

CURRENT STEP: ${step}
ALREADY COLLECTED DATA: ${JSON.stringify(dietPrefs)}

Please respond with a JSON object containing ALL information (preserve existing data + add new):
{
  "goal": "cut|bulk|maintain|general_health",
  "height": "number or null",
  "weight": "number or null", 
  "age": "number or null",
  "gender": "male|female|other|prefer_not_to_say or null",
  "activityLevel": "sedentary|lightly_active|moderately_active|very_active|extremely_active or null",
  "dietPreference": "vegetarian|non-vegetarian|eggetarian|vegan or null",
  "bloodSugar": "normal|prediabetic|diabetic or null",
  "bloodPressure": "normal|elevated|high_stage1|high_stage2 or null",
  "exclusions": "string or null",
  "allergies": "string or null",
  "cuisinePrefs": "string or null",
  "interpretation": "Brief explanation of what you understood"
}

IMPORTANT: 
- PRESERVE existing data from ALREADY COLLECTED DATA
- Only update fields that are mentioned in the user input
- If user says "160", and current step is "height", set height: 160 but keep other existing values

SMART MAPPING RULES:
- "losing weight", "lose weight", "weight loss", "cut", "deficit", "cut - lose fat" → goal: "cut"
- "gaining muscle", "gain muscle", "bulk", "bulking", "mass", "tambah otot", "bulk - gain muscle mass" → goal: "bulk"
- "maintain", "keep", "jaga berat badan", "maintain current weight" → goal: "maintain"
- "general health", "health", "sehat", "wellness", "healthy" → goal: "general_health"
- "vegetarian", "veggie", "no meat" → dietPreference: "vegetarian"
- "vegan", "plant based" → dietPreference: "vegan"
- Height: "175 cm", "175" → height: 175
- Weight: "70 kg", "70" → weight: 70
- Age: "27 year", "27" → age: 27
- Gender: "male", "female", "man", "woman" → gender
- Activity: "sedentary", "lightly active", "moderately active", "very active", "extremely active" → activityLevel
- Blood sugar: "normal", "prediabetic", "diabetic" → bloodSugar
- Blood pressure: "normal", "elevated", "high" → bloodPressure
- "asian", "indonesian", "western" → cuisinePrefs
- "no dairy", "lactose free" → exclusions
- "nuts", "shellfish" → allergies

UNDERSTAND CONTEXT AND TYPOS! Extract all relevant information.

If user asks unrelated questions or gives unclear input:
- If asking about other topics (not diet related), respond with: "Let's focus on your diet plan. [Ask the current question]"
- If input is too vague, respond with: "Could you be more specific? [Ask the current question]"
- If user gives multiple answers, extract the most relevant one
- If user asks to skip, use reasonable defaults and continue

Examples of smart handling:
- "I don't know" → Ask for clarification
- "What's the weather?" → "Let's focus on your diet plan. What is your height in cm?"
- "I'm 175cm and I want to lose weight" → Extract height: 175, goal: cut
- "Skip this" → Use default values and continue`,
          userId: 'chefbot-diet-analyzer',
          source: 'web'
        })
      });

      const data = await response.json();
      
      if (data.success && data.content) {
        console.log('🔍 SENSAY raw response:', data.content);
        try {
          // Try to extract JSON from markdown code block first
          let jsonText = null;
          const codeBlockMatch = data.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (codeBlockMatch) {
            jsonText = codeBlockMatch[1];
            console.log('📦 Primary - Extracted from code block:', jsonText);
          } else {
            // Fallback to direct JSON parse
            jsonText = data.content;
            console.log('📦 Primary - Using direct content:', jsonText);
          }
          
          const preferences = JSON.parse(jsonText);
          console.log('🎯 Extracted diet preferences:', preferences);
          
          // Update diet preferences (same pattern as recipe generator)
          const updatedPrefs = { ...dietPrefs };
          if (preferences.goal) updatedPrefs.goal = preferences.goal;
          if (preferences.height) updatedPrefs.height = preferences.height;
          if (preferences.weight) updatedPrefs.weight = preferences.weight;
          if (preferences.age) updatedPrefs.age = preferences.age;
          if (preferences.gender) updatedPrefs.gender = preferences.gender;
          if (preferences.activityLevel) updatedPrefs.activityLevel = preferences.activityLevel;
          if (preferences.dietPreference) updatedPrefs.dietPreference = preferences.dietPreference;
          if (preferences.bloodSugar) updatedPrefs.bloodSugar = preferences.bloodSugar;
          if (preferences.bloodPressure) updatedPrefs.bloodPressure = preferences.bloodPressure;
          if (preferences.exclusions) updatedPrefs.exclusions = preferences.exclusions;
          if (preferences.allergies) updatedPrefs.allergies = preferences.allergies;
          if (preferences.cuisinePrefs) updatedPrefs.cuisinePrefs = preferences.cuisinePrefs;
          
          setDietPrefs(updatedPrefs);
          console.log('📝 Updated dietPrefs state:', updatedPrefs);

          // Determine next step
          const nextStep = getNextDietStep(updatedPrefs, step);
          console.log('➡️ Next step:', nextStep);
          
          if (nextStep === 'confirm') {
            // Show confirmation and generate plan
            const confirmationText = `Perfect! Here's what I understand:

📋 YOUR PROFILE:
• Height: ${updatedPrefs.height || 'Not specified'} cm
• Weight: ${updatedPrefs.weight || 'Not specified'} kg  
• Age: ${updatedPrefs.age || 'Not specified'}
• Gender: ${updatedPrefs.gender || 'Not specified'}

💪 FITNESS & HEALTH:
• Goal: ${updatedPrefs.goal || 'Not specified'}
• Activity Level: ${updatedPrefs.activityLevel || 'Not specified'}
• Blood Sugar: ${updatedPrefs.bloodSugar || 'Not specified'}
• Blood Pressure: ${updatedPrefs.bloodPressure || 'Not specified'}

🥗 DIET PREFERENCES:
• Diet Type: ${updatedPrefs.dietPreference || 'Not specified'}
• Exclusions: ${updatedPrefs.exclusions || 'None'}
• Allergies: ${updatedPrefs.allergies || 'None'}
• Cuisine: ${updatedPrefs.cuisinePrefs || 'Mixed'}

Ready to generate your personalized diet plan?`;

            setMessages(prev => [...prev, { 
              id: Date.now() + Math.random(), 
              text: confirmationText, 
              sender: 'bot', 
              timestamp: new Date(), 
              suggestedAction: { type: 'diet-customization', step: 'confirm' } 
            }]);
          } else {
            // Ask next question
            const nextQuestion = await generateDietQuestion(nextStep, updatedPrefs);
            setMessages(prev => [...prev, { 
              id: Date.now() + Math.random(), 
              text: nextQuestion, 
              sender: 'bot', 
              timestamp: new Date(), 
              suggestedAction: { type: 'diet-customization', step: nextStep } 
            }]);
          }
          
        } catch (parseError) {
          console.error('Failed to parse SENSAY response:', parseError);
          console.log('Raw SENSAY response:', data.content);
          
          // Check if SENSAY gave a direct response instead of JSON
          const responseText = data.content.toLowerCase();
          
          // If SENSAY asked a clarifying question or gave instructions
          if (responseText.includes('let\'s focus') || responseText.includes('could you be more specific') || 
              responseText.includes('what is your') || responseText.includes('please tell me')) {
            // Use SENSAY's response directly
            setMessages(prev => [...prev, { 
              id: Date.now() + Math.random(), 
              text: data.content, 
              sender: 'bot', 
              timestamp: new Date(), 
              suggestedAction: { type: 'diet-customization', step } 
            }]);
            return;
          }
          
          // Try to extract JSON from response (same as recipe generator)
          try {
            // First try to extract from markdown code block
            let jsonText = null;
            const codeBlockMatch = data.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
              jsonText = codeBlockMatch[1];
              console.log('📦 Extracted from code block:', jsonText);
            } else {
              // Fallback to simple JSON object match
              const jsonMatch = data.content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                jsonText = jsonMatch[0];
                console.log('📦 Extracted from simple match:', jsonText);
              }
            }
            
            if (jsonText) {
              const preferences = JSON.parse(jsonText);
              console.log('🎯 Extracted diet preferences (fallback):', preferences);
              
              // Update diet preferences
              const updatedPrefs = { ...dietPrefs };
              if (preferences.goal) updatedPrefs.goal = preferences.goal;
              if (preferences.height) updatedPrefs.height = preferences.height;
              if (preferences.weight) updatedPrefs.weight = preferences.weight;
              if (preferences.age) updatedPrefs.age = preferences.age;
              if (preferences.gender) updatedPrefs.gender = preferences.gender;
              if (preferences.activityLevel) updatedPrefs.activityLevel = preferences.activityLevel;
              if (preferences.dietPreference) updatedPrefs.dietPreference = preferences.dietPreference;
              if (preferences.bloodSugar) updatedPrefs.bloodSugar = preferences.bloodSugar;
              if (preferences.bloodPressure) updatedPrefs.bloodPressure = preferences.bloodPressure;
              if (preferences.exclusions) updatedPrefs.exclusions = preferences.exclusions;
              if (preferences.allergies) updatedPrefs.allergies = preferences.allergies;
              if (preferences.cuisinePrefs) updatedPrefs.cuisinePrefs = preferences.cuisinePrefs;
              
              setDietPrefs(updatedPrefs);
              console.log('📝 Updated dietPrefs state (fallback):', updatedPrefs);

              // Determine next step
              const nextStep = getNextDietStep(updatedPrefs, step);
              console.log('➡️ Next step:', nextStep);
              
              if (nextStep === 'confirm') {
                // Show confirmation and generate plan
                const confirmationText = `Perfect! Here's what I understand:

📋 YOUR PROFILE:
• Height: ${updatedPrefs.height || 'Not specified'} cm
• Weight: ${updatedPrefs.weight || 'Not specified'} kg  
• Age: ${updatedPrefs.age || 'Not specified'}
• Gender: ${updatedPrefs.gender || 'Not specified'}

💪 FITNESS & HEALTH:
• Goal: ${updatedPrefs.goal || 'Not specified'}
• Activity Level: ${updatedPrefs.activityLevel || 'Not specified'}
• Blood Sugar: ${updatedPrefs.bloodSugar || 'Not specified'}
• Blood Pressure: ${updatedPrefs.bloodPressure || 'Not specified'}

🥗 DIET PREFERENCES:
• Diet Type: ${updatedPrefs.dietPreference || 'Not specified'}
• Exclusions: ${updatedPrefs.exclusions || 'None'}
• Allergies: ${updatedPrefs.allergies || 'None'}
• Cuisine: ${updatedPrefs.cuisinePrefs || 'Mixed'}

Ready to generate your personalized diet plan?`;

                setMessages(prev => [...prev, { 
                  id: Date.now(), 
                  text: confirmationText, 
                  sender: 'bot', 
                  timestamp: new Date(), 
                  suggestedAction: { type: 'diet-customization', step: 'confirm' } 
                }]);
              } else {
                // Ask next question
                const nextQuestion = await generateDietQuestion(nextStep, updatedPrefs);
                setMessages(prev => [...prev, { 
                  id: Date.now(), 
                  text: nextQuestion, 
                  sender: 'bot', 
                  timestamp: new Date(), 
                  suggestedAction: { type: 'diet-customization', step: nextStep } 
                }]);
              }
              return;
            }
          } catch (fallbackError) {
            console.error('Fallback parsing also failed:', fallbackError);
          }
          
          // If all parsing fails, ask for clarification with context
          const nextQuestion = await generateDietQuestion(step, dietPrefs);
          setMessages(prev => [...prev, { 
            id: Date.now(), 
            text: `I had trouble understanding that. ${nextQuestion}`, 
            sender: 'bot', 
            timestamp: new Date(), 
            suggestedAction: { type: 'diet-customization', step } 
          }]);
        }
      } else {
        console.error('SENSAY API failed:', data);
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: 'I had trouble understanding that. Could you please rephrase your diet goal?', 
          sender: 'bot', 
          timestamp: new Date(), 
          suggestedAction: { type: 'diet-customization', step } 
        }]);
      }
      
    } catch (error) {
      console.error('Diet customization error:', error);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: 'I had trouble understanding that. Could you please rephrase?', 
        sender: 'bot', 
        timestamp: new Date(), 
        suggestedAction: { type: 'diet-customization', step } 
      }]);
    }
  };

  const getNextDietStep = (prefs, currentStep) => {
    console.log('🔍 getNextDietStep called with:', { prefs, currentStep });
    
    // Check required fields in order (same as manual form)
    if (!prefs.height || prefs.height === '') {
      console.log('➡️ Missing height, returning: height');
      return 'height';
    }
    if (!prefs.weight || prefs.weight === '') {
      console.log('➡️ Missing weight, returning: weight');
      return 'weight';
    }
    if (!prefs.age || prefs.age === '') {
      console.log('➡️ Missing age, returning: age');
      return 'age';
    }
    if (!prefs.gender || prefs.gender === '') {
      console.log('➡️ Missing gender, returning: gender');
      return 'gender';
    }
    if (!prefs.activityLevel || prefs.activityLevel === '') {
      console.log('➡️ Missing activityLevel, returning: activityLevel');
      return 'activityLevel';
    }
    if (!prefs.goal || prefs.goal === '') {
      console.log('➡️ Missing goal, returning: goal');
      return 'goal';
    }
    if (!prefs.dietPreference || prefs.dietPreference === '') {
      console.log('➡️ Missing dietPreference, returning: dietPreference');
      return 'dietPreference';
    }
    if (!prefs.bloodSugar || prefs.bloodSugar === '') {
      console.log('➡️ Missing bloodSugar, returning: bloodSugar');
      return 'bloodSugar';
    }
    if (!prefs.bloodPressure || prefs.bloodPressure === '') {
      console.log('➡️ Missing bloodPressure, returning: bloodPressure');
      return 'bloodPressure';
    }
    
    // All required fields filled, go to confirmation
    console.log('➡️ All fields filled, returning: confirm');
    return 'confirm';
  };

  const generateDietQuestion = async (step, prefs) => {
    const questions = {
      height: 'What is your height in cm? (e.g., 175)',
      weight: 'What is your weight in kg? (e.g., 70)',
      age: 'What is your age? (e.g., 25)',
      gender: 'What is your gender? (male, female, other, prefer not to say)',
      activityLevel: 'What is your activity level? (sedentary, lightly active, moderately active, very active, extremely active)',
      goal: 'What is your fitness goal? (bulk - gain muscle mass, cut - lose fat, maintain current weight, general health)',
      dietPreference: 'What is your diet preference? (vegetarian, non-vegetarian, eggetarian, vegan)',
      bloodSugar: 'What is your blood sugar level? (normal, prediabetic, diabetic)',
      bloodPressure: 'What is your blood pressure status? (normal, elevated, high stage 1, high stage 2)',
      exclusions: 'Any dietary restrictions or foods to avoid? (optional)',
      allergies: 'Any food allergies? (optional)',
      cuisinePrefs: 'Any cuisine preferences? (optional)'
    };
    
    return questions[step] || 'Tell me more about your diet preferences.';
  };

  const generateDietPlan = async () => {
    try {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: '🍽️ Generating your personalized diet plan...', 
        sender: 'bot', 
        timestamp: new Date() 
      }]);

      // Prepare diet plan request with user info
      const dietRequest = {
        height: parseFloat(dietPrefs.height) || 170,
        weight: parseFloat(dietPrefs.weight) || 70,
        age: parseInt(dietPrefs.age) || 30,
        gender: dietPrefs.gender || 'male',
        activityLevel: dietPrefs.activityLevel || 'moderate',
        goal: dietPrefs.goal || 'maintain',
        dietPreference: dietPrefs.dietPreference || 'non-vegetarian',
        bloodSugar: dietPrefs.bloodSugar || 'normal',
        bloodPressure: dietPrefs.bloodPressure || 'normal',
        dietaryRestrictions: dietPrefs.exclusions ? [dietPrefs.exclusions] : [],
        allergies: dietPrefs.allergies ? [dietPrefs.allergies] : [],
        targetDate: new Date().toISOString().split('T')[0]
      };

      const response = await fetch('/api/generate-diet-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dietRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to generate diet plan');
      }

      const dietPlan = await response.json();
      
      // Render diet plan in chat
      const dietPlanHtml = renderDietPlan(dietPlan);
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: dietPlanHtml, 
        sender: 'bot', 
        timestamp: new Date(),
        isHtml: true
      }]);

      // Reset diet flow
      setDietFlowActive(false);
      setDietPrefs({ goal: '', calories: '', days: '', mealsPerDay: '', exclusions: '', cuisinePrefs: '' });

    } catch (error) {
      console.error('Diet plan generation error:', error);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: 'Sorry, I had trouble generating your diet plan. Please try again.', 
        sender: 'bot', 
        timestamp: new Date() 
      }]);
    }
  };

  const renderDietPlan = (plan) => {
    const { userProfile, weeklyDietPlan } = plan;
    
    let html = `
      <div class="diet-plan-container" style="background: white; border-radius: 12px; padding: 20px; margin: 10px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="color: #2d3748; margin-bottom: 15px; text-align: center;">🍽️ Your Personalized Diet Plan</h3>
        
        <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #4a5568; margin-bottom: 10px;">📊 Daily Targets</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #e53e3e;">${userProfile.targetCalories}</div>
              <div style="font-size: 12px; color: #718096;">Calories</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #38a169;">${userProfile.bmi}</div>
              <div style="font-size: 12px; color: #718096;">BMI</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #3182ce;">${userProfile.bmr}</div>
              <div style="font-size: 12px; color: #718096;">BMR</div>
            </div>
          </div>
        </div>
    `;

    // Render each day
    weeklyDietPlan.days.forEach((day, index) => {
      html += `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
          <div style="background: #edf2f7; padding: 10px; font-weight: bold; color: #2d3748;">
            📅 ${day.day} - ${day.date}
          </div>
          <div style="padding: 15px;">
      `;

      day.meals.forEach((meal, mealIndex) => {
        const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
        html += `
          <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: bold; color: #2d3748;">${mealIcons[meal.type]} ${meal.name}</span>
              <span style="font-size: 14px; color: #e53e3e; font-weight: bold;">${meal.calories} cal</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px;">
              <div style="text-align: center; font-size: 12px;">
                <div style="color: #38a169; font-weight: bold;">${meal.protein}g</div>
                <div style="color: #718096;">Protein</div>
              </div>
              <div style="text-align: center; font-size: 12px;">
                <div style="color: #3182ce; font-weight: bold;">${meal.carbs}g</div>
                <div style="color: #718096;">Carbs</div>
              </div>
              <div style="text-align: center; font-size: 12px;">
                <div style="color: #d69e2e; font-weight: bold;">${meal.fat}g</div>
                <div style="color: #718096;">Fat</div>
              </div>
            </div>
            <div style="font-size: 12px; color: #4a5568;">
              <strong>Ingredients:</strong> ${meal.ingredients.map(ing => `${ing.name} (${ing.amount})`).join(', ')}
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    // Add health notes
    if (weeklyDietPlan.healthNotes && weeklyDietPlan.healthNotes.length > 0) {
      html += `
        <div style="background: #e6fffa; border-left: 4px solid #38a169; padding: 15px; margin-top: 20px;">
          <h4 style="color: #2d3748; margin-bottom: 10px;">💡 Health Tips</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${weeklyDietPlan.healthNotes.map(note => `<li style="color: #4a5568; margin-bottom: 5px;">${note}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    html += `
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="alert('🖨️ Print Plan - Coming Soon!')" style="background: #9ca3af; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">
            🖨️ Print Plan
          </button>
          <button onclick="alert('📱 Save to App - Coming Soon!')" style="background: #9ca3af; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
            📱 Save to App
          </button>
        </div>
      </div>
    `;

    return html;
  };

  // Handle option button click directly
  const handleOptionButtonClick = (option, step) => {
    console.log('🔘 Option button clicked:', option, step);
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: option,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Parse and update form
    const parsedValue = parseUserResponse(option, step);
    console.log('🔘 Parsed value:', parsedValue);
    
    // Update form field
    window.dispatchEvent(new CustomEvent('chatbot-form-update', {
      detail: { field: step, value: parsedValue }
    }));
    
    // Get next question
    const nextQuestion = getNextQuestion(step);
    
    if (nextQuestion && nextQuestion.step !== 'ready') {
      const botMessage = {
        id: Date.now() + 1,
        text: nextQuestion.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestedAction: {
          type: 'interactive-form',
          step: nextQuestion.step,
          options: nextQuestion.options
        },
        optionButtons: nextQuestion.options.map(opt => ({
          text: opt,
          onClick: () => {
            handleOptionButtonClick(opt, nextQuestion.step);
          }
        }))
      };
      setMessages(prev => [...prev, botMessage]);
    } else if (nextQuestion && nextQuestion.step === 'ready') {
      const botMessage = {
        id: Date.now() + 1,
        text: nextQuestion.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestedAction: {
          type: 'recipe-generator-final',
          options: ['Generate Recipe', 'Review Settings']
        }
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  // Generate full recipe inside chat using Sensay API and image endpoint
  const generateRecipeInChat = async (payload) => {
    if (!payload) return;
    // Show typing indicator
    const typingId = Date.now() + 1000;
    setMessages(prev => [...prev, { id: typingId, text: 'Typing...', sender: 'bot', timestamp: new Date(), isTyping: true }]);

    try {
      // Normalize values and build prompt similar to form
      const dishType = payload.dishType || 'Main Courses';
      const cuisine = payload.cuisine || 'International';
      const spiceLevel = (payload.spiceLevel || 'Medium').toString();
      const skillLevel = (payload.skillLevel || 'Beginner').toString();
      const cookingMethod = (dishType === 'Beverages' ? 'No-Cook' : (payload.cookingMethod || '')).toString();
      const dietaryRestrictions = Array.isArray(payload.dietaryRestrictions) ? payload.dietaryRestrictions : [];
      const ingredients = Array.isArray(payload.ingredients) ? payload.ingredients : [];

      const ingredientsText = ingredients.length > 0
        ? `Available ingredients: ${ingredients.map((ing) => typeof ing === 'string' ? ing : (ing.name || '')).filter(Boolean).join(', ')}.`
        : '';
      const dietaryText = dietaryRestrictions.length > 0
        ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}.`
        : '';
      const skillLevelText = skillLevel ? `Skill Level: ${skillLevel}. ` : '';
      const cookingMethodText = cookingMethod && cookingMethod !== 'Any' ? `Cooking Method: ${cookingMethod}. ` : '';
      const notesText = (extraNotes && extraNotes.length) ? `Additional preferences: ${extraNotes.join('; ')}.` : '';

      const sensayPrompt = `Create a detailed ${cuisine} ${dishType} recipe with ${spiceLevel.toLowerCase()} spice level.

User Request: ${payload.userPrompt || ''}
${ingredientsText}
${dietaryText}
${skillLevelText}${cookingMethodText}
${notesText}

Return ONLY valid JSON (no markdown) with this exact schema:
{
  "name": string,
  "description": string,
  "area": "${cuisine}",
  "category": "${dishType}",
  "difficulty": "Easy" | "Medium" | "Hard",
  "cookingTime": string,
  "prepTime": string,
  "servings": string,
  "ingredients": [{ "name": string, "measure": string }],
  "instructions": [string],
  "nutritionalInfo": { "calories": string, "protein": string, "carbs": string, "fat": string, "fiber": string },
  "cookingTips": [string]
}`;

      const sensayResponse = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sensayPrompt, userId: `sensay-user-${chatSessionId}`, source: 'web', skipHistory: false })
      });
      const sensayResult = await sensayResponse.json();
      if (!sensayResponse.ok || !sensayResult.success || !sensayResult.content) {
        throw new Error(sensayResult.error || 'Failed to generate recipe');
      }

      const content = sensayResult.content;
      // Try JSON first
      let recipeObj = null;
      try {
        const codeFence = content.match(/```json([\s\S]*?)```/i);
        const raw = codeFence ? codeFence[1] : (content.match(/\{[\s\S]*\}/) || [null])[0];
        if (raw) recipeObj = JSON.parse(raw);
      } catch {}

      // Fallback helpers
      const extract = (regex) => (content.match(regex) || [null, ''])[1]?.trim() || '';
      const fallbackNameFromStructured = extract(/Recipe Name:\s*([^\n]+)/i);
      const fallbackNameFromSuggestion = (() => {
        const clean = content.replace(/<[^>]*>/g, '');
        const m = clean.match(/how about (?:making|trying|cooking)\s+(?:a|an|the)?\s*([^\.?\!]+)([\.?\!]|$)/i);
        return m ? m[1].replace(/\s*\(.*?\)\s*/g, '').trim() : '';
      })();

      let recipeName = (recipeObj && recipeObj.name) || fallbackNameFromStructured || fallbackNameFromSuggestion || (payload.userPrompt || 'Your Custom Dish');
      // Clean title: drop leading "How about ...", emojis, and trailing punctuation
      recipeName = recipeName
        .replace(/^[Hh]ow about\s+(?:making|trying|cooking)?\s*/,'')
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,'')
        .replace(/\s*[\.!?]+\s*$/,'')
        .trim();
      const difficulty = (recipeObj && recipeObj.difficulty) || extract(/Difficulty:\s*([^\n]+)/i) || 'Medium';
      const cookingTime = (recipeObj && recipeObj.cookingTime) || extract(/Cooking Time:\s*([^\n]+)/i) || '30 minutes';
      const prepTime = (recipeObj && recipeObj.prepTime) || extract(/Prep Time:\s*([^\n]+)/i) || '15 minutes';
      const servings = (recipeObj && recipeObj.servings) || extract(/Servings:\s*([^\n]+)/i) || '4';
      const description = (recipeObj && recipeObj.description) || extract(/Description:\s*([^\n]+)/i) || '';
      const areaUsed = (recipeObj && (recipeObj.area || recipeObj.cuisine)) || cuisine;

      // Ingredients list
      let ingredientsHtml = '';
      if (recipeObj && Array.isArray(recipeObj.ingredients) && recipeObj.ingredients.length) {
        ingredientsHtml = recipeObj.ingredients.map(ing => {
          const name = ing.name || '';
          const measure = ing.measure || '';
          return `<li><span style="color: var(--text-primary);">${name}</span> <span style="color: var(--accent);">${measure}</span></li>`;
        }).join('');
      } else {
        const ingredientsSection = content.match(/Ingredients:([\s\S]*?)(?=Instructions:|$)/i);
        if (ingredientsSection) {
          const lines = ingredientsSection[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('-') || l.startsWith('*'));
          ingredientsHtml = lines.map(l => {
            const m = l.match(/[-*]\s*([^:]+):\s*(.+)/);
            const name = m ? m[1].trim() : l.replace(/^[-*]\s*/, '').trim();
            const qty = m ? m[2].trim() : '';
            return `<li><span style="color: var(--text-primary);">${name}</span> <span style="color: var(--accent);">${qty}</span></li>`;
          }).join('');
        }
      }

      // Instructions list
      let instructionsHtml = '';
      if (recipeObj && Array.isArray(recipeObj.instructions) && recipeObj.instructions.length) {
        instructionsHtml = recipeObj.instructions.map(step => `<li>${String(step).trim()}</li>`).join('');
      } else {
        const instructionsSection = content.match(/Instructions:([\s\S]*?)(?=Nutritional Info:|Description:|$)/i);
        if (instructionsSection) {
          const lines = instructionsSection[1].split('\n').map(l => l.trim()).filter(l => /^\d+[\.)]?\s+/.test(l));
          instructionsHtml = lines.map(l => {
            const m = l.match(/^\d+[\.)]?\s+(.+)/);
            return `<li>${(m ? m[1] : l).trim()}</li>`;
          }).join('');
        }
      }

      // Fallback ingredients/instructions if still empty
      if (!ingredientsHtml) {
        const base = {
          Italian: [ ['Pasta','200g'], ['Olive oil','2 tbsp'], ['Garlic','3 cloves'], ['Chili flakes','1 tsp'], ['Parsley','2 tbsp'] ],
          Thai: [ ['Coconut milk','400ml'], ['Green curry paste','2 tbsp'], ['Mixed vegetables','300g'], ['Oil','1 tbsp'], ['Salt','to taste'] ],
          Japanese: [ ['Rice','2 cups'], ['Chicken','300g'], ['Teriyaki sauce','4 tbsp'], ['Sesame seeds','1 tsp'] ],
          Mexican: [ ['Tortillas','6'], ['Protein of choice','250g'], ['Onion','1'], ['Cilantro','1/4 bunch'], ['Lime','1'] ],
          Indian: [ ['Paneer','250g'], ['Tomato puree','200ml'], ['Butter','2 tbsp'], ['Cream','2 tbsp'], ['Garam masala','1 tsp'] ],
          'Middle Eastern': [ ['Eggs','4'], ['Tomatoes','400g'], ['Bell pepper','1'], ['Onion','1'], ['Paprika','1 tsp'] ],
          International: [ ['Onion','1'], ['Garlic','3 cloves'], ['Olive oil','2 tbsp'], ['Salt','to taste'], ['Pepper','to taste'] ]
        };
        const arr = base[areaUsed] || base.International;
        ingredientsHtml = arr.map(([n,q]) => `<li><span style=\"color: var(--text-primary);\">${n}</span> <span style=\"color: var(--accent);\">${q}</span></li>`).join('');
      }
      if (!instructionsHtml) {
        const generic = [
          'Prepare all ingredients and chop as needed.',
          'Heat oil in a pan over medium heat.',
          'Saute aromatics until fragrant.',
          'Add main ingredients and cook until done.',
          'Adjust seasoning and simmer briefly to meld flavors.',
          'Serve hot.'
        ];
        instructionsHtml = generic.map(step => `<li>${step}</li>`).join('');
      }

      // Nutritional info
      let nutritionHtml = '';
      if (recipeObj && recipeObj.nutritionalInfo) {
        const n = recipeObj.nutritionalInfo;
        const pairs = ['calories','protein','carbs','fat','fiber'].filter(k => n[k]).map(k => `- ${k[0].toUpperCase()+k.slice(1)}: ${n[k]}`);
        nutritionHtml = pairs.map(l => `<li>${l.replace('-', '').trim()}</li>`).join('');
      } else {
        const nutritionSection = content.match(/Nutritional Info \(per serving\):([\s\S]*?)(?=Cooking Tips:|Description:|$)/i);
        if (nutritionSection) {
          const lines = nutritionSection[1].split('\n').filter(l => l.trim().startsWith('-'));
          nutritionHtml = lines.map(l => `<li>${l.replace('-', '').trim()}</li>`).join('');
        }
      }

      // Try generate image
      let imageUrl = '';
      try {
        const imagePrompt = `${recipeName}`.trim();
        const imgRes = await fetch('/api/generate-recipe-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: imagePrompt }) });
        if (imgRes.ok) {
          const imgJson = await imgRes.json();
          imageUrl = imgJson.url || '';
        }
      } catch {}

      const html = `
        <div>
          <div class="text-center mb-2">
            <span class="badge">Sensay AI</span>
          </div>
          <h3 style="color: var(--accent);" class="text-lg font-bold mb-2">${recipeName} 🍲</h3>
          ${description ? `<p style="color: var(--text-secondary);" class="mb-2">${description}</p>` : ''}
          <div class="flex gap-2 flex-wrap mb-3">
            <span class="badge badge-info">${areaUsed}</span>
            <span class="badge badge-success">${dishType}</span>
            <span class="badge badge-warning">${servings} servings</span>
          </div>
          ${imageUrl ? `<div class="mb-3"><img src="${imageUrl}" alt="${recipeName}" class="w-full h-auto rounded"/></div>` : ''}
          <div class="mb-3">
            <h4 class="font-semibold" style="color: var(--accent);">Ingredients</h4>
            <ul class="list-disc ml-5">${ingredientsHtml}</ul>
          </div>
          <div class="mb-3">
            <h4 class="font-semibold" style="color: var(--accent);">Instructions</h4>
            <ol class="list-decimal ml-5">${instructionsHtml}</ol>
          </div>
          ${nutritionHtml ? `<div class="mb-3"><h4 class="font-semibold" style=\"color: var(--accent);\">Nutritional Info</h4><ul class="list-disc ml-5">${nutritionHtml}</ul></div>` : ''}
        </div>
      `;

      // Replace typing with recipe
      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.id !== typingId);
        return [...withoutTyping, { id: Date.now() + 2, text: html, sender: 'bot', timestamp: new Date() }];
      });
    } catch (err) {
      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.id !== typingId);
        return [...withoutTyping, { id: Date.now() + 3, text: (err.message || 'Failed to generate recipe'), sender: 'bot', timestamp: new Date(), isError: true }];
      });
    }
  };

  // Extract recipe information from bot response
  const extractRecipeInfo = (botResponse) => {
    const response = botResponse.toLowerCase();
    const recipeInfo = {
      dishType: 'Main Course',
      cuisine: 'International',
      dietaryRestrictions: [],
      spiceLevel: 'medium',
      skillLevel: 'beginner',
      cookingMethod: 'stir-fry',
      ingredients: []
    };

    // Clean HTML tags from response for better analysis
    const cleanResponse = response.replace(/<[^>]*>/g, '');

    // Extract dish type with more patterns
    if (cleanResponse.includes('salsa') || cleanResponse.includes('dip') || cleanResponse.includes('topping') || cleanResponse.includes('appetizer')) {
      recipeInfo.dishType = 'Appetizer';
    } else if (cleanResponse.includes('salad')) {
      recipeInfo.dishType = 'Salad';
    } else if (cleanResponse.includes('soup') || cleanResponse.includes('broth')) {
      recipeInfo.dishType = 'Soup';
    } else if (cleanResponse.includes('dessert') || cleanResponse.includes('sweet') || cleanResponse.includes('cake') || cleanResponse.includes('pie') || cleanResponse.includes('cookie')) {
      recipeInfo.dishType = 'Dessert';
    } else if (cleanResponse.includes('drink') || cleanResponse.includes('beverage') || cleanResponse.includes('smoothie') || cleanResponse.includes('juice')) {
      recipeInfo.dishType = 'Beverage';
    } else if (cleanResponse.includes('pasta') || cleanResponse.includes('rice') || cleanResponse.includes('risotto') || cleanResponse.includes('chicken') || cleanResponse.includes('beef') || cleanResponse.includes('pork') || cleanResponse.includes('fish') || cleanResponse.includes('seafood')) {
      recipeInfo.dishType = 'Main Course';
    }

    // Extract cuisine with more patterns
    if (cleanResponse.includes('mexican') || cleanResponse.includes('salsa') || cleanResponse.includes('taco') || cleanResponse.includes('burrito')) {
      recipeInfo.cuisine = 'Mexican';
    } else if (cleanResponse.includes('italian') || cleanResponse.includes('pasta') || cleanResponse.includes('pizza') || cleanResponse.includes('risotto') || cleanResponse.includes('parmesan')) {
      recipeInfo.cuisine = 'Italian';
    } else if (cleanResponse.includes('asian') || cleanResponse.includes('chinese') || cleanResponse.includes('japanese') || cleanResponse.includes('thai') || cleanResponse.includes('korean')) {
      recipeInfo.cuisine = 'Asian';
    } else if (cleanResponse.includes('indian') || cleanResponse.includes('curry') || cleanResponse.includes('masala') || cleanResponse.includes('dal')) {
      recipeInfo.cuisine = 'Indian';
    } else if (cleanResponse.includes('american') || cleanResponse.includes('burger') || cleanResponse.includes('bbq')) {
      recipeInfo.cuisine = 'American';
    } else if (cleanResponse.includes('french') || cleanResponse.includes('crepe') || cleanResponse.includes('brie')) {
      recipeInfo.cuisine = 'French';
    } else if (cleanResponse.includes('mediterranean') || cleanResponse.includes('olive') || cleanResponse.includes('feta')) {
      recipeInfo.cuisine = 'Mediterranean';
    }

    // Extract ingredients with more comprehensive list
    const ingredientKeywords = [
      'mango', 'tomato', 'onion', 'garlic', 'cilantro', 'lime', 'pepper', 'salt', 
      'mushroom', 'rice', 'parmesan', 'butter', 'olive oil', 'cream', 'cheese',
      'chicken', 'beef', 'pork', 'fish', 'shrimp', 'pasta', 'noodles',
      'carrot', 'celery', 'bell pepper', 'spinach', 'basil', 'oregano',
      'lemon', 'ginger', 'soy sauce', 'sesame oil', 'coconut milk'
    ];
    const foundIngredients = ingredientKeywords.filter(ingredient => 
      cleanResponse.includes(ingredient)
    );
    recipeInfo.ingredients = foundIngredients;

    // Extract dietary restrictions
    if (cleanResponse.includes('vegan') || cleanResponse.includes('plant-based')) {
      recipeInfo.dietaryRestrictions.push('vegan');
    }
    if (cleanResponse.includes('vegetarian') || cleanResponse.includes('veggie')) {
      recipeInfo.dietaryRestrictions.push('vegetarian');
    }
    if (cleanResponse.includes('gluten-free') || cleanResponse.includes('gluten free')) {
      recipeInfo.dietaryRestrictions.push('gluten_free');
    }
    if (cleanResponse.includes('dairy-free') || cleanResponse.includes('dairy free')) {
      recipeInfo.dietaryRestrictions.push('dairy_free');
    }

    // Extract spice level
    if (cleanResponse.includes('mild') || cleanResponse.includes('gentle') || cleanResponse.includes('subtle') || cleanResponse.includes('delicate')) {
      recipeInfo.spiceLevel = 'mild';
    } else if (cleanResponse.includes('spicy') || cleanResponse.includes('hot') || cleanResponse.includes('chili') || cleanResponse.includes('pepper') || cleanResponse.includes('fiery') || cleanResponse.includes('pungent')) {
      recipeInfo.spiceLevel = 'hot';
    } else if (cleanResponse.includes('medium') || cleanResponse.includes('moderate') || cleanResponse.includes('balanced')) {
      recipeInfo.spiceLevel = 'medium';
    } else {
      // Default based on dish type
      if (recipeInfo.dishType === 'Salad' || recipeInfo.dishType === 'Dessert') {
        recipeInfo.spiceLevel = 'mild';
      } else if (recipeInfo.cuisine === 'Indian' || recipeInfo.cuisine === 'Thai') {
        recipeInfo.spiceLevel = 'medium';
      }
    }

    // Extract cooking method
    if (cleanResponse.includes('bake') || cleanResponse.includes('baked') || cleanResponse.includes('oven')) {
      recipeInfo.cookingMethod = 'bake';
    } else if (cleanResponse.includes('fry') || cleanResponse.includes('fried') || cleanResponse.includes('sauté') || cleanResponse.includes('pan-fry')) {
      recipeInfo.cookingMethod = 'fry';
    } else if (cleanResponse.includes('grill') || cleanResponse.includes('grilled') || cleanResponse.includes('barbecue')) {
      recipeInfo.cookingMethod = 'grill';
    } else if (cleanResponse.includes('boil') || cleanResponse.includes('boiled') || cleanResponse.includes('simmer')) {
      recipeInfo.cookingMethod = 'boil';
    } else if (cleanResponse.includes('steam') || cleanResponse.includes('steamed')) {
      recipeInfo.cookingMethod = 'steam';
    } else if (cleanResponse.includes('stir-fry') || cleanResponse.includes('stir fry') || cleanResponse.includes('wok')) {
      recipeInfo.cookingMethod = 'stir-fry';
    } else if (cleanResponse.includes('risotto') || cleanResponse.includes('stirring') || cleanResponse.includes('creamy') || cleanResponse.includes('rich')) {
      recipeInfo.cookingMethod = 'stir-fry'; // Risotto is essentially stirring
    } else {
      // Default based on dish type
      if (recipeInfo.dishType === 'Salad') {
        recipeInfo.cookingMethod = 'boil'; // Most salads need some cooking
      } else if (recipeInfo.dishType === 'Soup') {
        recipeInfo.cookingMethod = 'boil';
      } else if (recipeInfo.dishType === 'Dessert') {
        recipeInfo.cookingMethod = 'bake';
      }
    }

    // Set skill level based on dish complexity
    if (cleanResponse.includes('simple') || cleanResponse.includes('easy') || cleanResponse.includes('quick') || cleanResponse.includes('basic')) {
      recipeInfo.skillLevel = 'beginner';
    } else if (cleanResponse.includes('complex') || cleanResponse.includes('advanced') || cleanResponse.includes('challenging') || cleanResponse.includes('sophisticated')) {
      recipeInfo.skillLevel = 'advanced';
    } else if (cleanResponse.includes('intermediate') || cleanResponse.includes('moderate') || cleanResponse.includes('traditional')) {
      recipeInfo.skillLevel = 'intermediate';
    } else {
      // Default based on dish type and cuisine
      if (recipeInfo.dishType === 'Salad' || recipeInfo.dishType === 'Appetizer') {
        recipeInfo.skillLevel = 'beginner';
      } else if (recipeInfo.cuisine === 'French' || recipeInfo.dishType === 'Dessert') {
        recipeInfo.skillLevel = 'intermediate';
      } else if (recipeInfo.dishType === 'Main Course' && recipeInfo.cuisine === 'Italian') {
        recipeInfo.skillLevel = 'intermediate'; // Risotto needs some skill
      }
    }

    console.log('🍳 Extracted recipe info:', recipeInfo);
    return recipeInfo;
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

Action types:
- recipe-generator: requests for recipes, cooking, food generation
- diet-planner: requests for meal plans, diet plans, weekly meals, nutrition planning, "plan my diet", "plan your weekly meals"
- community: requests about sharing, community features
- ingredient-explorer: requests about ingredients, substitutions
- nutrition-analyzer: requests for nutrition analysis

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
    // Remove emojis and normalize text for better matching
    const normalizedMessage = userMessage.replace(/[📊📅🍽️🎯💡]/g, '').toLowerCase();
    const message = normalizedMessage;
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
    
    if (message.includes('diet plan') || message.includes('meal plan') || message.includes('diet planner') ||
        message.includes('plan your weekly meals') || message.includes('plan my diet') ||
        message.includes('weekly meals') || message.includes('meal planning') ||
        message.includes('diet planning') || message.includes('nutrition plan')) {
      return {
        intent: 'action',
        actionType: 'diet-planner',
        confidence: 0.9,
        reasoning: 'Explicit diet planning request',
        ctaText: userLanguage === 'id'
          ? 'Mari kita buat rencana diet yang sesuai dengan kebutuhan Anda!'
          : 'Let\'s create a personalized diet plan for you!'
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
      'recipe generator', 'diet planner', 'meal plan', 'analyze',
      'plan your weekly meals', 'plan my diet', 'weekly meals', 'meal planning',
      'diet planning', 'nutrition plan'
    ];
    return actionKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  // Add call-to-action before suggested action (now AI-powered)
  const addCallToAction = async (text, userMessage, botResponse, conversationHistory = []) => {
    const analysis = await detectIntentWithAI(userMessage, botResponse, conversationHistory);
    
    if (analysis.intent === 'action' && analysis.actionType && analysis.ctaText) {
      // Handle diet planner action directly
      if (analysis.actionType === 'diet-planner') {
        setTimeout(() => startDietFlow(), 1000);
        return `${text}<br><br><em>${analysis.ctaText}</em>`;
      }
      return `${text}<br><br><em>${analysis.ctaText}</em>`;
    }
    
    return text; // No CTA for discussion or unclear intent
  };

  // Parse user response for form fields
  const parseUserResponse = (userInput, step) => {
    const input = userInput.toLowerCase().trim();
    
    switch (step) {
      case 'dishType':
        if (input.includes('main courses') || input.includes('main course')) return 'Main Courses';
        if (input.includes('appetizers') || input.includes('appetizer') || input.includes('sides')) return 'Appetizers & Sides';
        if (input.includes('desserts') || input.includes('dessert')) return 'Desserts';
        if (input.includes('beverages') || input.includes('beverage') || input.includes('drink')) return 'Beverages';
        if (input.includes('snacks') || input.includes('snack')) return 'Snacks';
        // Fallback for old options
        if (input.includes('breakfast') || input.includes('lunch') || input.includes('dinner')) return 'Main Courses';
        if (input.includes('starter') || input.includes('salad') || input.includes('soup')) return 'Appetizers & Sides';
        if (input.includes('sweet') || input.includes('cake')) return 'Desserts';
        if (input.includes('juice') || input.includes('cocktail')) return 'Beverages';
        return 'Main Courses'; // Default
        
      case 'dietaryRestrictions':
        const restrictions = [];
        if (input.includes('vegetarian')) restrictions.push('vegetarian');
        if (input.includes('vegan')) restrictions.push('vegan');
        if (input.includes('gluten-free') || input.includes('gluten free')) restrictions.push('gluten_free');
        if (input.includes('dairy-free') || input.includes('dairy free')) restrictions.push('dairy_free');
        if (input.includes('nut-free') || input.includes('nut free')) restrictions.push('nut_free');
        if (input.includes('halal')) restrictions.push('halal');
        // If no restrictions found, return empty array
        return restrictions;
        
      case 'spiceLevel':
        if (input.includes('mild') || input.includes('gentle') || input.includes('no spice')) return 'mild';
        if (input.includes('medium') || input.includes('moderate')) return 'medium';
        if (input.includes('hot') || input.includes('spicy') || input.includes('fire')) return 'hot';
        return 'medium'; // Default
        
      case 'skillLevel':
        if (input.includes('beginner') || input.includes('easy') || input.includes('simple')) return 'beginner';
        if (input.includes('intermediate') || input.includes('medium')) return 'intermediate';
        if (input.includes('advanced') || input.includes('expert') || input.includes('pro')) return 'advanced';
        return 'beginner'; // Default
        
      case 'cookingMethod':
        if (input.includes('bake') || input.includes('oven')) return 'bake';
        if (input.includes('fry') || input.includes('pan')) return 'fry';
        if (input.includes('grill') || input.includes('bbq')) return 'grill';
        if (input.includes('boil') || input.includes('simmer')) return 'boil';
        if (input.includes('steam')) return 'steam';
        if (input.includes('stir') || input.includes('wok')) return 'stir-fry';
        return 'stir-fry'; // Default
        
      default:
        return null;
    }
  };

  // Get next question in the flow
  const getNextQuestion = (currentStep) => {
    const questions = {
      dishType: {
        text: "Great! Now, any dietary restrictions?",
        step: 'dietaryRestrictions',
        options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal']
      },
      dietaryRestrictions: {
        text: "Perfect! What spice level do you prefer?",
        step: 'spiceLevel',
        options: ['Mild', 'Medium', 'Hot']
      },
      spiceLevel: {
        text: "Excellent! What's your cooking skill level?",
        step: 'skillLevel',
        options: ['Beginner', 'Intermediate', 'Advanced']
      },
      skillLevel: {
        text: "Almost done! What cooking method do you prefer?",
        step: 'cookingMethod',
        options: ['Bake', 'Fry', 'Grill', 'Boil', 'Steam', 'Stir-fry']
      },
      cookingMethod: {
        text: "Perfect! All set. Ready to generate your recipe?",
        step: 'ready',
        options: ['Generate Recipe', 'Review Settings']
      }
    };
    
    return questions[currentStep] || null;
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

    // If we're awaiting confirmation, handle yes/no first
    if (awaitingConfirmation) {
      const lower = message.trim().toLowerCase();
      const yesIntent = /(\byes\b|^y$|\bok\b|\bokay\b|\bsure\b|\bya\b|\blanjut\b|\bgas\b|\bgenerate\b|\bproceed\b|go ahead|\byes please\b|\byes,? generate\b)/i.test(lower);
      const noIntent = /(\bno\b|^n$|\bbatal\b|\bcancel\b|\btweak\b|\bubah\b|\bchange\b|not yet|\bbelum\b)/i.test(lower);
      setAwaitingConfirmation(false);
      if (yesIntent) {
        await generateRecipeInChat(lastRecipePayload);
        return;
      }
      if (noIntent) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: 'Tell me what to adjust (flavor, spice, method, sweetness, etc.).',
          sender: 'bot',
          timestamp: new Date(),
          suggestedAction: { type: 'natural-customization', step: 'gather-preferences' }
        }]);
        return;
      }
      // If unclear, ask briefly again
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Should I generate the recipe now? (yes/no)',
        sender: 'bot',
        timestamp: new Date(),
        suggestedAction: { type: 'recipe-generator-final' }
      }]);
      setAwaitingConfirmation(true);
      return;
    }

    // Quick actions: user asks to generate full/detailed recipe now
    const lowerMsg = message.toLowerCase();
    const wantsFull = /(generate (detailed )?recipe|recipe\s*full|buatkan\s*resep\s*lengkap|generate\s*now|just\s*give\s*me\s*(a\s*)?recipe|go\s*ahead|ok\s*generate|lanjut(?:kan)?\s*generate|langsung\s*generate|generate\s*aja|gas(?:keun)?)/i.test(lowerMsg);
    if (wantsFull) {
      const payloadBase = lastRecipePayload || detectDishAndPrefsFromText(message);
      const payload = { ...payloadBase };
      if (!payload.dishType) payload.dishType = 'Main Courses';
      if (!payload.cuisine) payload.cuisine = 'International';
      if (!payload.spiceLevel) payload.spiceLevel = 'Medium';
      if (!payload.skillLevel) payload.skillLevel = 'Beginner';
      if (payload.dishType !== 'Beverages' && !payload.cookingMethod) payload.cookingMethod = 'AI';
      setLastRecipePayload(payload);
      // generate directly
      await generateRecipeInChat(payload);
      return;
    }

    // If user mentions a clear dish (e.g., nasi goreng pedas), parse and if sufficient generate immediately
    if (/nasi goreng|tikka|masala|curry|rendang|spaghetti|sushi|taco|biryani|fried\s+rice/i.test(lowerMsg)) {
      const payload = detectDishAndPrefsFromText(message);
      setLastRecipePayload(payload);
      if (isSufficientPrefs(payload)) {
        await generateRecipeInChat(payload);
        return;
      }
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Siap! Akan saya buat resep untuk <strong>${payload.userPrompt}</strong>. Ada preferensi lain? (diet/spice/skill/method/cuisine)`,
        sender: 'bot',
        timestamp: new Date(),
        suggestedAction: { type: 'natural-customization', step: 'gather-preferences' }
      }]);
      return;
    }

    // Check for general greetings and respond appropriately
    if (/^(hi|hello|hey|hai|halo|good morning|good afternoon|good evening|what's up|how are you)/i.test(lowerMsg.trim())) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Hello! 👋 I'm your cooking assistant. I can help you with:<br>• 🍳 Recipe generation<br>• 📊 Diet planning<br>• 🍎 Nutrition analysis<br>• 🧠 Health advice<br><br>What would you like to cook today?`,
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }

    // Check for off-topic questions and redirect to cooking
    if (isOffTopicQuestion(lowerMsg)) {
      const responses = [
        `I'm ChefBot, your cooking assistant! 👨‍🍳 I specialize in helping with:<br>• 🍳 Recipe creation & cooking tips<br>• 📊 Meal planning & diet advice<br>• 🍎 Nutrition analysis<br>• 🧠 Health & wellness tips<br><br>What would you like to cook or learn about cooking today?`,
        `That's outside my cooking expertise! 🍳 I'm here to help you with:<br>• 🍳 Recipe generation & cooking techniques<br>• 📊 Meal planning & nutrition<br>• 🍎 Food analysis & health tips<br><br>What culinary adventure shall we embark on today?`,
        `I'm a cooking-focused assistant! 👨‍🍳 Let's talk about food instead:<br>• 🍳 Need a recipe for something special?<br>• 📊 Want to plan your meals?<br>• 🍎 Curious about nutrition facts?<br><br>What's cooking in your kitchen today?`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date(),
        suggestedAction: { type: 'recipe-generator', text: '🍳 Get Recipe Ideas', action: 'recipe-generator' }
      }]);
      return;
    }

    // Check for direct diet planning requests
    const normalizedMessage = message.replace(/[📊📅🍽️🎯💡]/g, '').toLowerCase();
    if (normalizedMessage.includes('plan your weekly meals') || normalizedMessage.includes('plan my diet') ||
        normalizedMessage.includes('diet plan') || normalizedMessage.includes('meal plan') ||
        normalizedMessage.includes('weekly meals') || normalizedMessage.includes('meal planning')) {
      await startDietFlow();
      return;
    }

    // Check for nutrition AI requests
    if (normalizedMessage.includes('nutrition ai') || normalizedMessage.includes('analyze food nutrition') ||
        normalizedMessage.includes('nutrition analysis') || normalizedMessage.includes('food nutrition') ||
        normalizedMessage.includes('nutrition in') || normalizedMessage.includes('nutrition of') ||
        normalizedMessage.includes('how much nutrition') || normalizedMessage.includes('nutrition facts') ||
        normalizedMessage.includes('nutritional value') || normalizedMessage.includes('calories in') ||
        normalizedMessage.includes('nutrition content') || normalizedMessage.includes('nutritional info')) {
      await startNutritionAI(message);
      return;
    }

    // Check for health coach requests
    if (normalizedMessage.includes('health coach') || normalizedMessage.includes('ai health coach') ||
        normalizedMessage.includes('health advice') || normalizedMessage.includes('personalized advice') ||
        normalizedMessage.includes('health tips') || normalizedMessage.includes('wellness advice')) {
      await startHealthCoach();
      return;
    }

    // Check if we're in diet customization mode
    const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
    if (lastBotMessage && lastBotMessage.suggestedAction && lastBotMessage.suggestedAction.type === 'diet-customization') {
      await handleDietCustomization(message, lastBotMessage);
      return;
    }

    // Check if we're in nutrition analysis mode
    if (lastBotMessage && lastBotMessage.suggestedAction && lastBotMessage.suggestedAction.type === 'nutrition-analysis') {
      await handleNutritionAnalysis(message, lastBotMessage);
      return;
    }

    // Check if we're in health coach mode
    if (lastBotMessage && lastBotMessage.suggestedAction && lastBotMessage.suggestedAction.type === 'health-coach') {
      await handleHealthCoach(message, lastBotMessage);
      return;
    }

    // Check if we're in natural customization mode
    if (lastBotMessage && lastBotMessage.suggestedAction && lastBotMessage.suggestedAction.type === 'natural-customization') {
      // Reset tracking when starting gather-preferences
      if (lastBotMessage.suggestedAction.step === 'gather-preferences') {
        setFollowupCount(0);
        setExtraNotes([]);
      }
      // If user asks about cooking method but it's a beverage, clarify and skip
      if (/\bcooking\s*method\?$/i.test(message) && collectedPrefs.dishType === 'Beverages') {
        setMessages(prev => [...prev, { id: Date.now(), text: 'For beverages, no cooking method is needed. Would you like it hot or iced?', sender: 'bot', timestamp: new Date(), suggestedAction: { type: 'natural-customization', step: 'extra-note' } }]);
        return;
      }
      // Delegate to Sensay AI to interpret and decide next action
      await handleNaturalLanguageCustomization(message, lastBotMessage);
      return;
    }

    // Check if we're in interactive form mode
    if (lastBotMessage && lastBotMessage.suggestedAction && lastBotMessage.suggestedAction.type === 'interactive-form') {
      const currentStep = lastBotMessage.suggestedAction.step;
      
      // If user wants to proceed during form flow, set safe defaults and generate
      if (/(just\s*give\s*me\s*(a\s*)?recipe|go\s*ahead|that'?s\s*fine|ok\s*generate|lanjut(?:kan)?\s*generate|langsung\s*generate|generate\s*aja|gas(?:keun)?)/i.test(message)) {
        const updated = { ...collectedPrefs };
        if (!updated.dishType) updated.dishType = 'Main Courses';
        if (!updated.cuisine) updated.cuisine = 'International';
        if (!updated.spiceLevel) updated.spiceLevel = 'Medium';
        if (!updated.skillLevel) updated.skillLevel = 'Beginner';
        if (updated.dishType !== 'Beverages' && !updated.cookingMethod) updated.cookingMethod = 'AI';
        setCollectedPrefs(updated);
        setLastRecipePayload(updated);
        await generateRecipeInChat(updated);
        return;
      }

      // Parse user response
      let parsedValue = parseUserResponse(message, currentStep);
      const unknown = isUnknownAnswer(message);
      const updated = { ...collectedPrefs };

      if (currentStep === 'ingredients') {
        if (!unknown) {
          // split by comma
          const list = message.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name }));
          updated.ingredients = list;
        }
      } else if (currentStep === 'dietaryRestrictions') {
        if (unknown || (Array.isArray(parsedValue) && parsedValue.length === 0)) {
          updated.dietaryRestrictions = [];
        } else {
          updated.dietaryRestrictions = parsedValue;
        }
      } else {
        if (!unknown && parsedValue) {
          updated[currentStep] = parsedValue;
          // Lock field so we don't re-ask it
          setLockedFields(prev => ({ ...prev, [currentStep]: true }));
        }
      }
      // If beverages, force no-cook and skip method question
      if (updated.dishType === 'Beverages') {
        updated.cookingMethod = 'No-Cook';
        window.dispatchEvent(new CustomEvent('chatbot-form-update', { detail: { field: 'cookingMethod', value: 'No-Cook' } }));
      }
      setCollectedPrefs(updated);
      
      // Update form field
      window.dispatchEvent(new CustomEvent('chatbot-form-update', {
        detail: { field: currentStep, value: parsedValue }
      }));
      
      // Decide next step (skip ingredients question to avoid loops)
      const missing = nextMissingField(updated);
      // If beverages, never ask cooking method
      if (missing === 'cookingMethod' && updated.dishType === 'Beverages') {
        const next = 'ready';
        if (isSufficientPrefs(updated)) {
          if (followupCount < 2) {
            await askExtraQuestion();
            setFollowupCount(c => c + 1);
          } else {
            setLastRecipePayload(updated);
            proposeDishIdea(updated);
          }
          return;
        }
      }
      if (missing !== 'ready') {
        askQuestionFor(missing);
        setFollowupCount(c => c + 1);
        return;
      }
      // If sufficient, ensure two follow-ups asked before proposing; then wait for confirm
      if (isSufficientPrefs(updated)) {
        if (followupCount < 2) {
          askExtraQuestion();
          setFollowupCount(c => c + 1);
        } else {
          setLastRecipePayload(updated);
          proposeDishIdea(updated);
        }
      } else {
        proposeDishIdea(updated);
      }
      
      return;
    }

    // Show typing indicator for regular chat
    const typingMessage = {
      id: Date.now() + 1,
      text: "Typing...",
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Preprocess: lightweight normalization
      const cleaned = normalizeUserInput(message);
      // Ask AI to normalize/clarify user intent succinctly
      const normalized = await normalizeWithAI(cleaned, detectLanguage(message) === 'id' ? 'Indonesian' : 'English');
      const effectiveUserPrompt = (normalized && normalized !== 'UNKNOWN') ? normalized : cleaned;

      // Get enhanced context
      const context = currentContext ? 
        `Current page: ${currentContext.pageTitle} (${currentContext.path}). ${currentContext.feature ? `User is on ${currentContext.feature.name} page.` : ''}` : 
        '';

      // Call Sensay API with enhanced context
      const isRandomIntent = /generate\s+(a\s+)?random\s+recipe|roll\s+again|another\s+recipe|random\s+again|try\s+another/i.test(message);
      const prompt = isRandomIntent
        ? `Suggest ONE specific dish as a random recipe. Respond in 1-2 sentences starting with: "How about ...?". Do not refuse. No disclaimers.
Avoid asking questions. Make it enticing and concise.`
        : effectiveUserPrompt;

      const response = await fetch('/api/sensay-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          userId: `chefbot-user-${chatSessionId}`,
          source: 'web',
          skipHistory: false,
          context: context
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Detect user intent for inline button - for random/suggestion, force recipe-generator
      let suggestedAction = chatbotIntegrations.detectUserIntentFallback(message, data.content, messages);
      const looksLikeSuggestion = /how about\b/i.test(data.content);
      if (isRandomIntent || looksLikeSuggestion) {
        suggestedAction = { type: 'recipe-generator', text: '🍳 Generate Recipe', action: 'recipe-generator' };
      }
      
      // Check if response is generic/template and provide better fallback
      if (/It seems like there might have been a little mix-up|Could you let me know what you're looking for|provide more details|clarify what you're looking for/i.test(data.content)) {
        // Replace generic response with helpful cooking assistant response
        data.content = `I'm your cooking assistant! I can help you with:<br>• 🍳 Recipe generation (just ask for any dish)<br>• 📊 Diet planning<br>• 🍎 Nutrition analysis<br>• 🧠 Health advice<br><br>What would you like to cook today?`;
        suggestedAction = { type: 'recipe-generator', text: '🍳 Generate Recipe', action: 'recipe-generator' };
      }
      
      // Check if response is completely off-topic and redirect
      if (isOffTopicQuestion(data.content) || /weather|politics|sports|movie|music|game/i.test(data.content)) {
        data.content = `I'm ChefBot, your cooking assistant! 👨‍🍳 I specialize in helping with:<br>• 🍳 Recipe creation & cooking tips<br>• 📊 Meal planning & diet advice<br>• 🍎 Nutrition analysis<br>• 🧠 Health & wellness tips<br><br>What would you like to cook or learn about cooking today?`;
        suggestedAction = { type: 'recipe-generator', text: '🍳 Get Recipe Ideas', action: 'recipe-generator' };
      }
      
      console.log('🤖 Suggested Action:', suggestedAction);

      // Format the message and add call-to-action
      console.log('📝 Raw bot response:', data.content);
      let formattedText = formatMessage(data.content);
      // Guard against refusal content
      if (/i can't generate/i.test(data.content) || /cannot generate/i.test(data.content)) {
        formattedText = formatMessage(getRandomSuggestion());
        suggestedAction = { type: 'recipe-generator', text: '🍳 Generate Recipe', action: 'recipe-generator' };
      }
      // Remember last suggestion so the Generate button knows what to use
      if (looksLikeSuggestion) {
        try { sessionStorage.setItem('last-suggested-bot', data.content); } catch {}
      }

      // If AI already replied with a full recipe in text, present it as a rich card with image and badges
      const cardHtml = await buildRecipeCardFromFreeText(data.content, message);
      if (cardHtml) {
        formattedText = cardHtml;
        suggestedAction = undefined;
      }
      console.log('📝 Formatted text:', formattedText);
      // Temporarily skip addCallToAction to avoid API issues
      // if (suggestedAction) {
      //   formattedText = await addCallToAction(formattedText, message, data.response, messages);
      // }

      // Save latest bot response to sessionStorage for AI page
      sessionStorage.setItem('latest-bot-response', JSON.stringify(formattedText));

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
        <div className={`fixed ${isMobile ? 'bottom-20 right-2 left-2 w-auto' : 'bottom-24 right-6 w-80'} ${isMinimized ? 'h-16' : (isMobile ? 'h-[30rem]' : 'h-[32rem]')} bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-all duration-300`}>
           {/* Header */}
           <div className="text-white p-4 rounded-t-lg flex justify-between items-center" style={{ backgroundColor: 'var(--accent)' }}>
             <div>
               <h3 className="font-semibold">🤖 ChefBot Assistant</h3>
               <p className="text-sm opacity-90">Ask me anything about cooking!</p>
             </div>
             <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  try {
                    // Confirm reset
                    const ok = confirm('Start a new session? This will clear chat history and reset preferences.');
                    if (!ok) return;
                    // Clear persisted chat and session data
                    sessionStorage.removeItem('chatbot-messages');
                    sessionStorage.removeItem('chatbot-recipe-params');
                    sessionStorage.removeItem('latest-bot-response');
                    // Rotate chat session id
                    const newId = String(Date.now());
                    sessionStorage.setItem('chat-session-id', newId);
                    setChatSessionId(newId);
                    // Reset UI state
                    setMessages([]);
                    setShowSuggestions(true);
                  } catch (e) {
                    console.warn('Failed to reset session:', e);
                  }
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border"
                style={{ color: 'white', borderColor: 'white', backgroundColor: 'transparent' }}
                title="Reset session"
              >
                ↻
              </button>
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
            <div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
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
                       
                       {/* Interactive Form Option Buttons */}
                       {message.optionButtons && message.optionButtons.length > 0 && (
                         <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                           {message.optionButtons.map((button, index) => (
                             <button
                               key={index}
                               onClick={button.onClick}
                               className="px-3 py-2 text-xs sm:text-sm border rounded-lg transition-colors hover:opacity-80"
                               style={{ 
                                 borderColor: 'var(--accent)', 
                                 color: 'var(--accent)',
                                 backgroundColor: 'rgba(255, 140, 0, 0.1)'
                               }}
                             >
                               {button.text}
                             </button>
                           ))}
                         </div>
                       )}

                      {/* Inline Suggested Action Button (only if text exists) */}
                      {message.suggestedAction && message.suggestedAction.text && !message.optionButtons && (
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

              {/* Stage 1: Random suggestion → show Confirm / Roll Again */}
              {message.suggestedAction.type === 'recipe-generator' && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      try {
                        // Extract recipe info from the LATEST bot response
                        const latestBot = [...messages].reverse().find(m => m.sender === 'bot' && m.text);
                        let botResponse = latestBot?.text || '';
                        try { const raw = sessionStorage.getItem('last-suggested-bot'); if (raw) botResponse = raw; } catch {}
                        const recipeInfo = extractRecipeInfo(botResponse);
                        const cleanBotResponse = String(botResponse).replace(/<[^>]*>/g, '');
                        // Prefer patterns like: "How about making ...?" / "How about trying ...?"
                        let dishName = (() => {
                          const m1 = cleanBotResponse.match(/how about (?:making|trying|cooking)\s+(?:a|an|the)?\s*([^\.?\!]+)([\.?\!]|$)/i);
                          if (m1) return m1[1].replace(/\s*\(.*?\)\s*/g, '').trim();
                          const firstSentence = cleanBotResponse.split(/[\.!?]/)[0].trim();
                          if (firstSentence && firstSentence.length > 4) return firstSentence;
                          // fallback to any previously stored latest suggestion
                          try {
                            const latestStored = sessionStorage.getItem('latest-bot-response');
                            if (latestStored) {
                              const txt = JSON.parse(latestStored);
                              const clean = String(txt).replace(/<[^>]*>/g, '');
                              const m2 = clean.match(/how about (?:making|trying|cooking)\s+(?:a|an|the)?\s*([^\.?\!]+)([\.?\!]|$)/i);
                              if (m2) return m2[1].replace(/\s*\(.*?\)\s*/g, '').trim();
                            }
                          } catch {}
                          return 'Chef\'s Choice';
                        })();
                        const payload = {
                          userPrompt: dishName.trim(),
                          dishType: recipeInfo.dishType || 'Main Courses',
                          cuisine: recipeInfo.cuisine || 'International',
                          dietaryRestrictions: recipeInfo.dietaryRestrictions || [],
                          spiceLevel: recipeInfo.spiceLevel || 'Medium',
                          skillLevel: recipeInfo.skillLevel || 'Beginner',
                          cookingMethod: recipeInfo.cookingMethod || 'stir-fry',
                          ingredients: recipeInfo.ingredients || []
                        };
                        setLastRecipePayload(payload);
                        // Show final confirmation inside chat
                        const previewMsg = {
                          id: Date.now(),
                          text: `Got it! Ready to generate <strong>${payload.userPrompt}</strong>?`,
                          sender: 'bot',
                          timestamp: new Date(),
                          suggestedAction: { type: 'recipe-generator-final', options: ['Generate Now', 'Customize Details'] }
                        };
                        setMessages(prev => [...prev, previewMsg]);
                        setAwaitingConfirmation(true);
                      } catch (e) {
                        console.warn('Confirm flow failed:', e);
                      }
                    }}
                    className="btn btn-primary btn-sm text-white"
                    style={{ backgroundColor: 'var(--accent)', border: 'none' }}
                  >
                    🍳 Generate Recipe
                  </button>
                  <button
                    onClick={() => {
                      // Start natural language customization flow (no options)
                      const customizationMessage = {
                        id: Date.now(),
                        text: "Absolutely! Let's find your perfect recipe. Please describe in one sentence, e.g.: 'fried rice, spice medium, beginner level, method fry' or 'Italian main course, mild spice, grilled'.",
                        sender: 'bot',
                        timestamp: new Date(),
                        suggestedAction: {
                          type: 'natural-customization',
                          step: 'gather-preferences'
                        }
                      };
                      setMessages(prev => [...prev, customizationMessage]);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    📝 Customize or Change
                           </button>
                         </div>
                       )}

              {/* Smart Follow-up: Generate Now or Customize */}
              {message.suggestedAction.type === 'recipe-generator-final' && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      // Generate inside chat using last payload
                      setAwaitingConfirmation(false);
                      generateRecipeInChat(lastRecipePayload);
                    }}
                    className="btn btn-primary btn-sm text-white"
                    style={{ backgroundColor: 'var(--accent)', border: 'none' }}
                  >
                    🚀 Generate Now
                  </button>
                  <button
                    onClick={() => {
                      // Start natural language customization flow (no options)
                      setAwaitingConfirmation(false);
                      const customizationMessage = {
                        id: Date.now(),
                        text: "Great! Tell me your preferences in one sentence (dish, spice, skill, method, cuisine). Example: 'fried rice, medium spice, beginner, fry, Indonesian'.",
                        sender: 'bot',
                        timestamp: new Date(),
                        suggestedAction: {
                          type: 'natural-customization',
                          step: 'gather-preferences'
                        }
                      };
                      setMessages(prev => [...prev, customizationMessage]);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    ⚙️ Customize Details
                  </button>
                     </div>
                   )}

              {/* Stage 2: After confirm → show Generate / Upload choices */}
              {message.suggestedAction.type === 'recipe-generator-stage2' && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      try {
                        window.location.href = '/ai#autogen';
                      } catch (e) {
                        window.location.href = '/ai';
                      }
                    }}
                    className="btn btn-primary btn-sm text-white"
                    style={{ backgroundColor: 'var(--accent)', border: 'none' }}
                  >
                    Confirm & Generate
                  </button>
                  <button
                    onClick={() => {
                      try {
                        window.location.href = '/ai#upload';
                      } catch (e) {
                        window.location.href = '/ai';
                      }
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    Upload Ingredients
                  </button>
                  <button
                    onClick={() => {
                      try {
                        window.location.href = '/ai#prefill';
                      } catch (e) {
                        window.location.href = '/ai';
                      }
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    Ubah detail
                  </button>
                </div>
              )}

              {/* Diet Customization: Confirmation step */}
              {message.suggestedAction.type === 'diet-customization' && message.suggestedAction.step === 'confirm' && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => generateDietPlan()}
                    className="btn btn-primary btn-sm text-white"
                    style={{ backgroundColor: 'var(--accent)', border: 'none' }}
                  >
                    🍽️ Generate Diet Plan
                  </button>
                  <button
                    onClick={() => {
                      setDietFlowActive(false);
                      setDietPrefs({ goal: '', calories: '', days: '', mealsPerDay: '', exclusions: '', cuisinePrefs: '' });
                      setMessages(prev => [...prev, { 
                        id: Date.now(), 
                        text: 'No problem! Feel free to ask for a diet plan anytime.', 
                        sender: 'bot', 
                        timestamp: new Date() 
                      }]);
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
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
            <div className="px-4 pb-2 max-h-32 overflow-y-auto">
             <SmartSuggestions 
               onSuggestionClick={handleSuggestionClick}
               isVisible={showSuggestions}
             />
            </div>
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
                   className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none dark:bg-gray-700 dark:text-white"
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

           {/* Footer: Powered by Sensay */}
           {!isMinimized && (
             <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-center text-[9px] leading-none text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
               <span className="relative -translate-y-[1px]">Powered by</span>
               <img
                 src="/images/sensay.png"
                 alt="Sensay"
                 className="h-3 w-auto object-contain inline-block align-middle"
               />
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
