export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatSource {
  filename: string;
  content: string;
  score?: number;
}

export interface StreamEvent {
  type:
    | 'token'
    | 'sources'
    | 'done'
    | 'error';

  value?: string;

  sources?: ChatSource[];

  message?: string;
}export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatSource {
  filename: string;
  content: string;
  score?: number;
}

export interface StreamEvent {
  type:
    | 'token'
    | 'sources'
    | 'done'
    | 'error';

  value?: string;

  sources?: ChatSource[];

  message?: string;
}
