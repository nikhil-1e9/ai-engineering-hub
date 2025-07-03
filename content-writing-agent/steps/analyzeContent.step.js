const OpenAI = require('openai');
const config = require('../config');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Event Step: Analyze Article Content
 * 
 * Listens for 'article-scraped' events and analyzes the content
 * to extract insights for social media content generation
 */
module.exports = {
  name: 'analyze-content',
  type: 'event',
  topic: 'article-scraped',
  
  async execute({ data, emit, store }) {
    try {
      console.log(`Analyzing content for: ${data.content.title}`);
      
      // Prepare content for analysis
      const contentToAnalyze = `
Title: ${data.content.title}
Author: ${data.content.author || 'Unknown'}
Description: ${data.content.description || 'N/A'}
Content: ${data.content.text.substring(0, 4000)}...
Word Count: ${data.content.wordCount}
      `.trim();
      
      // Create analysis prompt
      const analysisPrompt = createAnalysisPrompt(contentToAnalyze);
      
      // Call OpenAI for content analysis
      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert content analyst specializing in social media strategy and viral content creation. Analyze the provided article and return insights in the exact JSON format requested.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: config.openai.temperature,
        max_tokens: config.openai.maxTokens,
      });
      
      // Parse the AI response
      let analysis;
      try {
        const responseContent = completion.choices[0].message.content;
        analysis = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('Failed to parse AI analysis response:', parseError);
        throw new Error('Invalid analysis response format');
      }
      
      // Validate analysis structure
      validateAnalysis(analysis);
      
      // Prepare analyzed event
      const analyzedEvent = {
        requestId: data.requestId,
        url: data.url,
        originalContent: data.content,
        analysis: analysis,
        timestamp: Date.now()
      };
      
      console.log(`Content analysis completed. Main themes: ${analysis.mainThemes.join(', ')}`);
      
      // Store analysis data for later aggregation
      await store.set(`analysis-${data.requestId}`, { analysis });
      
      // Emit analysis results for content generation
      await emit('content-analyzed', analyzedEvent);
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      
      // Emit error event
      await emit('processing-error', {
        requestId: data.requestId,
        step: 'analysis',
        error: {
          message: error.message,
          code: error.code,
          details: error.stack
        },
        timestamp: Date.now(),
        retryable: true
      });
    }
  }
};

/**
 * Create the analysis prompt for OpenAI
 */
function createAnalysisPrompt(content) {
  return `
Analyze the following article content and provide insights for creating viral social media content. 

Article Content:
${content}

Please analyze this content and return a JSON object with the following structure:

{
  "mainThemes": ["theme1", "theme2", "theme3"],
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"],
  "sentiment": "positive|negative|neutral",
  "targetAudience": ["audience1", "audience2", "audience3"],
  "viralPotential": 7,
  "contentType": "news|opinion|tutorial|analysis|other",
  "readingLevel": "beginner|intermediate|advanced",
  "emotionalTriggers": ["trigger1", "trigger2", "trigger3"],
  "callToAction": "suggested call to action"
}

Guidelines:
- mainThemes: 3-5 core themes/topics covered in the article
- keyPoints: 5-7 most important takeaways that would interest social media users
- sentiment: Overall emotional tone of the article
- targetAudience: Who would be most interested in this content (be specific)
- viralPotential: Rate 1-10 how likely this content is to go viral
- contentType: Categorize the type of content
- readingLevel: Complexity level of the content
- emotionalTriggers: What emotions this content might evoke in readers
- callToAction: A compelling action readers should take after engaging with this content

Return only the JSON object, no additional text.
  `;
}

/**
 * Validate the analysis structure
 */
function validateAnalysis(analysis) {
  const requiredFields = [
    'mainThemes', 'keyPoints', 'sentiment', 'targetAudience',
    'viralPotential', 'contentType', 'readingLevel', 'emotionalTriggers'
  ];
  
  for (const field of requiredFields) {
    if (!(field in analysis)) {
      throw new Error(`Missing required analysis field: ${field}`);
    }
  }
  
  // Validate specific field types
  if (!Array.isArray(analysis.mainThemes) || analysis.mainThemes.length === 0) {
    throw new Error('mainThemes must be a non-empty array');
  }
  
  if (!Array.isArray(analysis.keyPoints) || analysis.keyPoints.length === 0) {
    throw new Error('keyPoints must be a non-empty array');
  }
  
  if (!['positive', 'negative', 'neutral'].includes(analysis.sentiment)) {
    throw new Error('sentiment must be positive, negative, or neutral');
  }
  
  if (typeof analysis.viralPotential !== 'number' || analysis.viralPotential < 1 || analysis.viralPotential > 10) {
    throw new Error('viralPotential must be a number between 1 and 10');
  }
  
  if (!['news', 'opinion', 'tutorial', 'analysis', 'other'].includes(analysis.contentType)) {
    throw new Error('contentType must be one of: news, opinion, tutorial, analysis, other');
  }
  
  if (!['beginner', 'intermediate', 'advanced'].includes(analysis.readingLevel)) {
    throw new Error('readingLevel must be beginner, intermediate, or advanced');
  }
}
