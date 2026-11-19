export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus = "streaming" | "completed" | "error";

export interface ToolCallState {
  toolId: string;
  name: string;
  arguments?: unknown;
  result?: unknown;
  status: "running" | "completed" | "error";
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
  status?: MessageStatus;
  toolCalls?: ToolCallState[];
}

export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: ChatMessage[];
}

export type HistoryDateGroup =
  "Today" | "Yesterday" | "Previous 7 days" | "Older";

export interface GroupedConversations {
  group: HistoryDateGroup;
  items: Conversation[];
}

export interface SSEMetadataEvent {
  conversation_id: string;
  title: string;
  user_message_id?: string;
}

export interface SSEContentEvent {
  chunk: string;
}

export interface SSEToolCallEvent {
  tool_id: string;
  name: string;
  arguments?: unknown;
}

export interface SSEToolResultEvent {
  tool_id: string;
  name: string;
  result?: unknown;
}

export interface SSEErrorEvent {
  message: string;
}

export interface SSEDoneEvent {
  full_response: string;
}

export interface StreamCallbacks {
  onMetadata?: (data: SSEMetadataEvent) => void;
  onContentChunk?: (chunk: string) => void;
  onToolCall?: (data: SSEToolCallEvent) => void;
  onToolResult?: (data: SSEToolResultEvent) => void;
  onError?: (error: Error) => void;
  onDone?: (data: SSEDoneEvent) => void;
}
