// Event type definitions for the content writing agent workflow

export interface ScrapeArticleEvent {
  requestId: string
  url: string
  timestamp: number
}

export interface AnalyzeContentEvent {
  requestId: string
  url: string
  title: string
  content: string
  timestamp: number
}

export interface ContentStrategy {
  analysis: {
    mainThemes: string[]
    targetAudience: string
    complexityLevel: 'beginner' | 'intermediate' | 'advanced'
    keyInsights: string[]
  }
  twitterStrategy: {
    hook: string
    angle: string
    hashtags: string[]
    format: 'single' | 'thread'
  }
  linkedinStrategy: {
    angle: string
    valueProposition: string
    callToAction: string
    hashtags: string[]
  }
}

export interface GenerateContentEvent {
  requestId: string
  url: string
  title: string
  content: string
  strategy: ContentStrategy
  timestamp: number
}

export interface TwitterContent {
  tweets: Array<{
    text: string
    order: number
  }>
  totalTweets: number
}

export interface LinkedInContent {
  post: string
  characterCount: number
}

export interface SchedulePostsEvent {
  requestId: string
  url: string
  title: string
  strategy: ContentStrategy
  content: {
    twitter: TwitterContent
    linkedin: LinkedInContent
  }
  metadata: {
    generatedAt: string
    processingTime: number
    targetAudience: string
  }
}

export interface ContentCompleteEvent {
  requestId: string
  url: string
  title: string
  content: {
    twitter: TwitterContent
    linkedin: LinkedInContent
  }
  metadata: {
    generatedAt: string
    processingTime: number
    targetAudience: string
  }
  scheduledAt: string
  twitterDraftId?: string
}

