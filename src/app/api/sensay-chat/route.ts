import { NextRequest, NextResponse } from 'next/server';
import { sensayService } from '../../../services/sensay-service';
import { getSensayConfig } from '../../../config/sensay';

// Interface untuk request body
interface ChatRequest {
  message: string;
  userId?: string;
  source?: 'web' | 'embed' | 'discord' | 'telegram';
  skipHistory?: boolean;
}

// Interface untuk response
interface ChatResponse {
  success: boolean;
  content?: string;
  error?: string;
  timestamp: string;
  userId: string;
  conversationId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequest = await request.json();
    const { message, userId, source = 'web', skipHistory = false } = body;

    // Validasi input
    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Message is required and cannot be empty',
        timestamp: new Date().toISOString(),
        userId: userId || 'unknown'
      } as ChatResponse, { status: 400 });
    }

    if (message.length > 10000) {
      return NextResponse.json({
        success: false,
        error: 'Message is too long (max 10,000 characters)',
        timestamp: new Date().toISOString(),
        userId: userId || 'unknown'
      } as ChatResponse, { status: 400 });
    }

    // Use provided userId or fallback to default
    const config = getSensayConfig();
    let finalUserId = userId || config.DEFAULT_USER_ID;

    // Ensure user exists in Sensay if it's a real user ID
    if (userId && userId !== config.DEFAULT_USER_ID) {
      try {
        const { ensureSensayUser } = await import('../../../lib/sensayUserHelper');
        const sensayUser = await ensureSensayUser(userId);
        finalUserId = sensayUser.userId;
        console.log('✅ Ensured Sensay user exists:', finalUserId);
      } catch (error) {
        console.warn('⚠️ Failed to ensure Sensay user, using fallback:', error);
        finalUserId = config.DEFAULT_USER_ID;
      }
    }

    console.log(`🤖 ChefBot Pro Chat Request:`, {
      providedUserId: userId,
      finalUserId: finalUserId,
      defaultUserId: config.DEFAULT_USER_ID,
      messageLength: message.length,
      source,
      skipHistory
    });

    // Inisialisasi ChefBot jika belum ada
    try {
      await sensayService.initializeChefBot();
    } catch (initError) {
      console.warn('ChefBot initialization warning:', initError);
      // Lanjutkan meskipun inisialisasi gagal, mungkin sudah ada
    }

    // Kirim pesan ke ChefBot Pro
    const response = await sensayService.getChatResponse(
      message,
      finalUserId,
      source,
      skipHistory
    );

    if (!response.success) {
      throw new Error('Failed to get response from ChefBot Pro');
    }

    console.log(`✅ ChefBot Pro Response Generated:`, {
      userId: finalUserId,
      responseLength: response.content?.length || 0
    });

    return NextResponse.json({
      success: true,
      content: response.content,
      timestamp: new Date().toISOString(),
      userId: finalUserId,
      conversationId: response.conversationId
    } as ChatResponse);

  } catch (error: any) {
    console.error('❌ ChefBot Pro Chat Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error occurred while processing your request',
      timestamp: new Date().toISOString(),
      userId: 'unknown'
    } as ChatResponse, { status: 500 });
  }
}

// GET endpoint untuk health check
export async function GET(request: NextRequest) {
  try {
    const config = getSensayConfig();
    
    return NextResponse.json({
      success: true,
      message: 'ChefBot Pro Chat API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      config: {
        replicaUUID: config.REPLICA_UUID,
        apiVersion: config.API_VERSION,
        baseURL: config.BASE_URL
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}