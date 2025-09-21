/**
 * Sensay API Client for ChefBot Pro
 * Complete implementation with all features: conversations, training, analytics
 */

import { getSensayConfig } from '../config/sensay';

export interface SensayConfig {
  baseURL: string;
  organizationSecret: string;
  apiVersion: string;
}

// Basic Request/Response Types
export interface CreateUserRequest {
  id?: string;
}

export interface CreateReplicaRequest {
  name: string;
  shortDescription: string;
  greeting: string;
  ownerID: string;
  private: boolean;
  slug: string;
  llm: {
    provider: string;
    model: string;
  };
}

export interface ChatCompletionRequest {
  content: string;
  skip_chat_history?: boolean;
  source?: 'discord' | 'telegram' | 'embed' | 'web' | 'telegram_autopilot';
  discord_data?: {
    channel_id?: string;
    channel_name?: string;
    author_id?: string;
    author_name?: string;
    message_id?: string;
    created_at?: string;
    server_id?: string;
    server_name?: string;
  };
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface CursorPaginationParams {
  limit?: number;
  beforeUUID?: string;
  afterUUID?: string;
}

// Response Types
export interface SensayResponse<T> {
  success: boolean;
  message?: string;
}

export interface ObjectResponse<T> extends SensayResponse<T> {
  [key: string]: any;
}

export interface ArrayResponse<T> extends SensayResponse<T> {
  items: T[];
  total?: number;
  count?: number;
}

// Conversation Types
export interface Conversation {
  uuid: string;
  source: string;
  messageCount: number;
  firstMessageAt: string;
  lastMessageAt: string;
}

export interface Message {
  uuid: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  source: string;
  replicaUUID: string;
}

export interface MentionGroup {
  type: 'mention';
  messages: Message[];
}

export interface PlaceholderGroup {
  type: 'placeholder';
  count: number;
}

export type ConversationItem = MentionGroup | PlaceholderGroup;

// Training Types
export interface KnowledgeBaseEntry {
  id: number;
  replica_uuid: string;
  type: 'text' | 'file';
  filename?: string;
  status: 'BLANK' | 'AWAITING_UPLOAD' | 'SUPABASE_ONLY' | 'PROCESSING' | 'READY' | 'SYNC_ERROR' | 'ERR_FILE_PROCESSING' | 'ERR_TEXT_PROCESSING' | 'ERR_TEXT_TO_VECTOR';
  raw_text?: string;
  processed_text?: string;
  created_at: string;
  updated_at: string;
  title?: string;
  description?: string;
}

export interface FileUploadResponse {
  success: boolean;
  signedURL: string;
  knowledgeBaseID: number;
}

// Analytics Types
export interface HistoricalData {
  date: string;
  cumulativeConversations: number;
}

export interface SourceData {
  source: string;
  conversations: number;
}

export class SensayClient {
  private config: SensayConfig;

  constructor(config: SensayConfig) {
    this.config = config;
  }

  // ===== USER MANAGEMENT =====
  
  /**
   * Create a new user in the organization
   */
  async createUser(request: CreateUserRequest = {}): Promise<ObjectResponse<any>> {
    const response = await fetch(`${this.config.baseURL}/v1/users`, {
      method: 'POST',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user information
   */
  async getUser(userId: string): Promise<ObjectResponse<any>> {
    const response = await fetch(`${this.config.baseURL}/v1/users?id=${userId}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== REPLICA MANAGEMENT =====

  /**
   * Create a new replica (bot) for a user
   */
  async createReplica(request: CreateReplicaRequest): Promise<ObjectResponse<any>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas`, {
      method: 'POST',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create replica: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get replica details
   */
  async getReplica(replicaUuid: string): Promise<ObjectResponse<any>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get replica: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Chat with a replica (updated with full parameters)
   */
  async chatCompletion(replicaUuid: string, userId: string, request: ChatCompletionRequest): Promise<ObjectResponse<any>> {
    console.log('🔍 SensayClient.chatCompletion called with:', {
      replicaUuid,
      userId,
      contentLength: request.content?.length,
      source: request.source
    });

    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/chat/completions`, {
      method: 'POST',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'X-USER-ID': userId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: request.content,
        skip_chat_history: request.skip_chat_history || false,
        source: request.source || 'web',
        ...(request.discord_data && { discord_data: request.discord_data })
      }),
    });

    console.log('📡 Sensay API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Sensay API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        userId,
        replicaUuid
      });
      throw new Error(`Failed to chat with replica: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get chat history between user and replica
   */
  async getChatHistory(replicaUuid: string, userId: string): Promise<ArrayResponse<Message>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/chat/history`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'X-USER-ID': userId,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get chat history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List all replicas accessible by a user
   */
  async listUserReplicas(userId: string, pagination?: PaginationParams): Promise<ArrayResponse<any>> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());

    const response = await fetch(`${this.config.baseURL}/v1/replicas?${params}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'X-USER-ID': userId,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list replicas: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List all replicas in the organization (admin access)
   */
  async listAllReplicas(pagination?: PaginationParams): Promise<ArrayResponse<any>> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());

    const response = await fetch(`${this.config.baseURL}/v1/replicas?${params}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list all replicas: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== CONVERSATION MANAGEMENT =====

  /**
   * List conversations for a replica
   */
  async listConversations(replicaUuid: string, pagination?: PaginationParams): Promise<ArrayResponse<Conversation>> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());

    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/conversations?${params}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list conversations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get conversation mentions (cursor-based pagination)
   */
  async getConversationMentions(
    replicaUuid: string, 
    conversationUuid: string, 
    pagination?: CursorPaginationParams
  ): Promise<ArrayResponse<ConversationItem>> {
    const params = new URLSearchParams();
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.beforeUUID) params.append('beforeUUID', pagination.beforeUUID);
    if (pagination?.afterUUID) params.append('afterUUID', pagination.afterUUID);

    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/conversations/${conversationUuid}/mentions?${params}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get conversation mentions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get conversation messages (for expanding placeholders)
   */
  async getConversationMessages(
    replicaUuid: string, 
    conversationUuid: string, 
    pagination?: CursorPaginationParams
  ): Promise<ArrayResponse<Message>> {
    const params = new URLSearchParams();
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.beforeUUID) params.append('beforeUUID', pagination.beforeUUID);
    if (pagination?.afterUUID) params.append('afterUUID', pagination.afterUUID);

    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/conversations/${conversationUuid}/messages?${params}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get conversation messages: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== TRAINING & KNOWLEDGE BASE =====

  /**
   * Create a knowledge base entry
   */
  async createKnowledgeBaseEntry(replicaUuid: string): Promise<ObjectResponse<any>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/training`, {
      method: 'POST',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Failed to create knowledge base entry: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Add text to knowledge base entry
   */
  async addTextToKnowledgeBase(
    replicaUuid: string, 
    knowledgeBaseId: number, 
    rawText: string
  ): Promise<ObjectResponse<any>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/training/${knowledgeBaseId}`, {
      method: 'PUT',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawText }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add text to knowledge base: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get signed URL for file upload
   */
  async getFileUploadURL(replicaUuid: string, filename: string): Promise<FileUploadResponse> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/training/files/upload?filename=${encodeURIComponent(filename)}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get file upload URL: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List knowledge base entries
   */
  async listKnowledgeBaseEntries(replicaUuid: string): Promise<ArrayResponse<KnowledgeBaseEntry>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/training`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list knowledge base entries: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get specific knowledge base entry
   */
  async getKnowledgeBaseEntry(replicaUuid: string, knowledgeBaseId: number): Promise<ObjectResponse<KnowledgeBaseEntry>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/training/${knowledgeBaseId}`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get knowledge base entry: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete knowledge base entry
   */
  async deleteKnowledgeBaseEntry(replicaUuid: string, knowledgeBaseId: number): Promise<ObjectResponse<any>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/training/${knowledgeBaseId}`, {
      method: 'DELETE',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete knowledge base entry: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== ANALYTICS =====

  /**
   * Get historical conversation analytics
   */
  async getHistoricalAnalytics(replicaUuid: string): Promise<ArrayResponse<HistoricalData>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/analytics/conversations/historical`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get historical analytics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get source analytics
   */
  async getSourceAnalytics(replicaUuid: string): Promise<ArrayResponse<SourceData>> {
    const response = await fetch(`${this.config.baseURL}/v1/replicas/${replicaUuid}/analytics/conversations/sources`, {
      method: 'GET',
      headers: {
        'X-ORGANIZATION-SECRET': this.config.organizationSecret,
        'X-API-Version': this.config.apiVersion,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get source analytics: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== UTILITY METHODS =====

  /**
   * Calculate pagination info for offset-based pagination
   */
  calculatePaginationInfo(response: ArrayResponse<any>, currentPage: number, pageSize: number) {
    const total = response.total || 0;
    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, total);

    return {
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      startItem,
      endItem,
      currentPage,
      pageSize
    };
  }

  /**
   * Handle cursor-based pagination for conversations
   */
  async loadNextPage(replicaUuid: string, conversationUuid: string, lastMessageUUID: string, limit: number = 20) {
    return this.getConversationMentions(replicaUuid, conversationUuid, {
      limit,
      beforeUUID: lastMessageUUID
    });
  }

  async loadPreviousPage(replicaUuid: string, conversationUuid: string, firstMessageUUID: string, limit: number = 20) {
    return this.getConversationMentions(replicaUuid, conversationUuid, {
      limit,
      afterUUID: firstMessageUUID
    });
  }
}

// Default configuration for ChefBot Pro
export const createSensayClient = () => {
  const config = getSensayConfig();
  return new SensayClient({
    baseURL: config.BASE_URL,
    organizationSecret: config.ORGANIZATION_SECRET,
    apiVersion: config.API_VERSION,
  });
};
