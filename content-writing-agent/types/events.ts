// Event type definitions for the content writing agent

export interface ScrapeArticleEvent {
  requestId: string;
  url: string;
  timestamp: number;
}

export interface AnalyzeContentEvent {
  requestId: string;
  url: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface GenerateContentEvent {
  requestId: string;
  url: string;
  title: string;
  content: string;
  strategy: ContentStrategy;
  timestamp: number;
}

export interface ContentStrategy {
  analysis: {
    mainThemes: string[];
    targetAudience: string;
    complexityLevel: 'beginner' | 'intermediate' | 'advanced';
    keyInsights: string[];
  };
  twitterStrategy: {
    hook: string;
    angle: string;
    hashtags: string[];
    format: 'single' | 'thread';
  };
  linkedinStrategy: {
    angle: string;
    valueProposition: string;
    callToAction: string;
    hashtags: string[];
  };
}

export interface ProcessingErrorEvent {
  requestId: string;
  step: string;
  error: string;
  url: string;
}

