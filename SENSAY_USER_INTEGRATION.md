# Sensay User Integration

## Overview
This document explains how we've integrated Supabase user authentication with Sensay API to provide personalized AI experiences for each user.

## Implementation

### 1. User ID Flow
```
Supabase Auth → Real User ID → Sensay API → Personalized Chat History
```

### 2. Key Components

#### `src/lib/sensayUserHelper.js`
- **`ensureSensayUser(userId)`**: Creates user in Sensay if not exists
- **`getAuthenticatedUserId(request)`**: Extracts user ID from Supabase Auth
- **`getSensayUserId(request)`**: Combines both functions for easy use

#### Updated API Routes
- **`/api/generate-diet-plan`**: Uses real user ID for personalized diet plans
- **`/api/generate-recipe`**: Uses real user ID for recipe generation
- **`/api/sensay-chat`**: Uses real user ID for chat history

### 3. How It Works

#### Step 1: Authentication
```javascript
// Extract user from Supabase Auth token
const authHeader = request.headers.get('authorization');
const token = authHeader.split(' ')[1];
const { data: { user } } = await supabase.auth.getUser(token);
```

#### Step 2: Ensure Sensay User
```javascript
// Check if user exists in Sensay, create if not
const response = await fetch(`https://api.sensay.io/v1/users/${userId}`, {
  method: 'GET',
  headers: { 'X-ORGANIZATION-SECRET': '...' }
});

if (response.status === 404) {
  // Create new user in Sensay
  await fetch('https://api.sensay.io/v1/users', {
    method: 'POST',
    body: JSON.stringify({ id: userId, name: `User ${userId}` })
  });
}
```

#### Step 3: Use in API Calls
```javascript
// Use real user ID in Sensay API calls
const sensayResponse = await fetch('https://api.sensay.io/v1/replicas/.../chat/completions', {
  headers: {
    'X-USER-ID': finalUserId, // Real Supabase user ID
    // ...
  }
});
```

### 4. Benefits

#### ✅ **Personalized Experience**
- Each user has separate chat history
- AI remembers user preferences
- Personalized recommendations

#### ✅ **Better Analytics**
- Track usage per user
- Understand user behavior
- Improve AI responses

#### ✅ **Rate Limiting**
- Fair rate limits per user
- Prevents abuse
- Better resource management

#### ✅ **Scalability**
- Supports unlimited users
- Auto-creates users as needed
- No manual user management

### 5. Fallback Strategy

If authentication fails or user doesn't exist:
```javascript
// Falls back to sensay-user
return { success: false, userId: 'sensay-user' };
```

This ensures the API always works, even for unauthenticated users.

### 6. Testing

To test with multiple users:

1. **Create multiple Supabase accounts**
2. **Login with different accounts**
3. **Generate recipes/diet plans**
4. **Check Sensay API logs** - should see different user IDs
5. **Verify separate chat histories**

### 7. Environment Variables

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SENSAY_API_KEY=your_sensay_api_key
```

### 8. API Endpoints

All these endpoints now use real user IDs:

- `POST /api/generate-diet-plan`
- `POST /api/generate-recipe`
- `POST /api/sensay-chat`

### 9. Error Handling

- **Auth errors**: Falls back to sensay-user
- **Sensay API errors**: Logs error, continues with fallback
- **User creation errors**: Uses fallback user ID

### 10. Future Improvements

- [ ] Add user preferences to Sensay user profile
- [ ] Implement user-specific replica settings
- [ ] Add user analytics dashboard
- [ ] Implement user deletion cleanup

















