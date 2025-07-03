// Event types for the content writing agent workflow

export interface ScrapeArticleEvent {
  url: string;
  requestId: string;
  timestamp: number;
  options?: {
    waitForSelector?: string;
    timeout?: number;
    userAgent?: string;
  };
}

export interface ArticleScrapedEvent {
  requestId: string;
  url: string;
  content: {
    title: string;
    text: string;
    author?: string;
    publishDate?: string;
    description?: string;
    keywords?: string[];
    wordCount: number;
  };
  metadata: {
    scrapedAt: number;
    processingTime: number;
    success: boolean;
    error?: string;
  };
}

export interface ContentAnalyzedEvent {
  requestId: string;
  url: string;
  originalContent: ArticleScrapedEvent['content'];
  analysis: {
    mainThemes: string[];
    keyPoints: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    targetAudience: string[];
    viralPotential: number; // 1-10 scale
    contentType: 'news' | 'opinion' | 'tutorial' | 'analysis' | 'other';
    readingLevel: 'beginner' | 'intermediate' | 'advanced';
    emotionalTriggers: string[];
    callToAction?: string;
  };
  timestamp: number;
}

export interface TwitterContentGeneratedEvent {
  requestId: string;
  content: {
    tweets: Array<{
      text: string;
      hashtags: string[];
      characterCount: number;
      type: 'single' | 'thread-start' | 'thread-continue';
      threadPosition?: number;
    }>;
    threadSummary?: string;
    engagementHooks: string[];
  };
  timestamp: number;
}

export interface LinkedInContentGeneratedEvent {
  requestId: string;
  content: {
    post: string;
    headline: string;
    hashtags: string[];
    characterCount: number;
    callToAction: string;
    professionalTone: boolean;
    industryFocus?: string[];
  };
  timestamp: number;
}

export interface ContentAggregatedEvent {
  requestId: string;
  url: string;
  originalTitle: string;
  analysis: ContentAnalyzedEvent['analysis'];
  generatedContent: {
    twitter: TwitterContentGeneratedEvent['content'];
    linkedin: LinkedInContentGeneratedEvent['content'];
  };
  metadata: {
    totalProcessingTime: number;
    completedAt: number;
    success: boolean;
    errors?: string[];
  };
}

// Error event for handling failures in the pipeline
export interface ProcessingErrorEvent {
  requestId: string;
  step: 'scraping' | 'analysis' | 'twitter-generation' | 'linkedin-generation' | 'aggregation';
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: number;
  retryable: boolean;
}

