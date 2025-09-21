import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Ensure user exists in Sensay, create if not exists
 * @param {string} userId - The user ID to ensure exists in Sensay
 * @returns {Promise<{success: boolean, userId: string}>}
 */
export async function ensureSensayUser(userId) {
  try {
    // Try to get existing user first
    const response = await fetch(`https://api.sensay.io/v1/users/${userId}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': 'f4369f9a7c4c4a2e84847fcf54f617ff78aace25df7f14388708ca392d788cff',
        'X-API-Version': '2025-03-25',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ Sensay user exists:', userId);
      return { success: true, userId };
    } else if (response.status === 404) {
      // User doesn't exist, create it
      console.log('⚠️ Sensay user not found, creating:', userId);
      
      const createResponse = await fetch('https://api.sensay.io/v1/users', {
        method: 'POST',
        headers: {
          'X-ORGANIZATION-SECRET': 'f4369f9a7c4c4a2e84847fcf54f617ff78aace25df7f14388708ca392d788cff',
          'X-API-Version': '2025-03-25',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          name: `User ${userId}`,
        }),
      });

      if (createResponse.ok) {
        console.log('✅ Successfully created Sensay user:', userId);
        return { success: true, userId };
      } else {
        console.error('❌ Failed to create Sensay user:', await createResponse.text());
        return { success: false, userId: 'sensay-user' }; // Fallback
      }
    } else {
      console.error('❌ Error checking Sensay user:', response.status, await response.text());
      return { success: false, userId: 'sensay-user' }; // Fallback
    }
  } catch (error) {
    console.error('❌ Error in ensureSensayUser:', error);
    return { success: false, userId: 'sensay-user' }; // Fallback
  }
}

/**
 * Get authenticated user ID from request headers
 * @param {Request} request - The incoming request
 * @returns {Promise<string>} - The user ID or fallback
 */
export async function getAuthenticatedUserId(request) {
  const authHeader = request.headers.get('authorization');
  let userId = 'sensay-user'; // Default fallback
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (user && !error) {
        userId = user.id;
        console.log('✅ Authenticated user:', userId);
      } else {
        console.log('⚠️ No authenticated user, using fallback');
      }
    } catch (authError) {
      console.log('⚠️ Auth error, using fallback:', authError.message);
    }
  } else {
    console.log('⚠️ No auth header, using fallback');
  }

  return userId;
}

/**
 * Get Sensay user ID (ensures user exists in Sensay)
 * @param {Request} request - The incoming request
 * @returns {Promise<string>} - The Sensay user ID
 */
export async function getSensayUserId(request) {
  const userId = await getAuthenticatedUserId(request);
  const sensayUser = await ensureSensayUser(userId);
  return sensayUser.userId;
}
