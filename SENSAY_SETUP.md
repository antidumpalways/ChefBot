# Sensay API Setup Guide

## 🚀 **Getting Started with Sensay API**

### **Step 1: Get Your API Key**
1. Go to [Sensay AI Dashboard](https://sensay.ai)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### **Step 2: Configure Environment Variables**
Create a `.env.local` file in your project root with:

```bash
# Sensay API Configuration
NEXT_PUBLIC_SENSAY_API_KEY=your_actual_api_key_here
```

### **Step 3: Test the Integration**
1. Start your development server: `npm run dev`
2. Open the chatbot in your browser
3. Send a test message to verify the API is working

### **Step 4: Customize the Bot**
You can modify the system prompt in `src/lib/sensay-config.js` to customize how ChefBot responds.

## 🔧 **Troubleshooting**

### **Common Issues:**
- **"API key not configured"**: Make sure you've set `NEXT_PUBLIC_SENSAY_API_KEY` in your `.env.local` file
- **"Invalid API key"**: Check that your API key is correct and active
- **Rate limiting**: Sensay has rate limits - wait a moment before trying again

### **API Limits:**
- Free tier: Limited requests per month
- Paid tiers: Higher limits and better performance

## 📚 **API Documentation**
- [Sensay API Docs](https://docs.sensay.ai)
- [Chat Completions API](https://docs.sensay.ai/api/chat-completions)

## 🎯 **Next Steps**
Once the basic integration is working, you can:
1. Add more context awareness
2. Implement feature-specific responses
3. Add voice input/output
4. Create custom prompts for different pages








