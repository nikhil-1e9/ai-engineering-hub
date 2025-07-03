const OpenAI = require('openai');
const config = require('../config');

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

module.exports = {
  name: 'analyze',
  type: 'event',
  topic: 'analyze-content',
  
  async execute({ data, emit }) {
    try {
      console.log(`🧠 Analyzing content: ${data.title}`);
      
      const prompt = `You are a content strategist specializing in developer and AI-focused content. 

Analyze this article and create a comprehensive content strategy for Twitter and LinkedIn:

ARTICLE TITLE: ${data.title}
ARTICLE CONTENT: ${data.content}

Please provide:

1. CONTENT ANALYSIS:
   - Main themes and key insights
   - Target developer audience (frontend, backend, AI/ML, DevOps, etc.)
   - Technical complexity level
   - Most compelling points for social media

2. TWITTER STRATEGY:
   - Hook/angle for maximum engagement
   - Key technical insights to highlight
   - Relevant hashtags for developer community
   - Thread vs single tweet recommendation

3. LINKEDIN STRATEGY:
   - Professional angle and value proposition
   - Industry insights to emphasize
   - Call-to-action approach
   - Relevant hashtags for professional network

Focus on content that will resonate with software engineers, AI practitioners, and tech professionals.

Respond in JSON format:
{
  "analysis": {
    "mainThemes": ["theme1", "theme2"],
    "targetAudience": "description",
    "complexityLevel": "beginner|intermediate|advanced",
    "keyInsights": ["insight1", "insight2"]
  },
  "twitterStrategy": {
    "hook": "engaging hook",
    "angle": "content angle",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "format": "single|thread"
  },
  "linkedinStrategy": {
    "angle": "professional angle",
    "valueProposition": "value prop",
    "callToAction": "CTA text",
    "hashtags": ["#hashtag1", "#hashtag2"]
  }
}`;

      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      });

      const strategy = JSON.parse(response.choices[0].message.content);
      
      console.log(`✅ Strategy created - Target: ${strategy.analysis.targetAudience}`);

      // Emit strategy for content generation
      await emit('generate-content', {
        requestId: data.requestId,
        url: data.url,
        title: data.title,
        content: data.content,
        strategy,
        timestamp: data.timestamp
      });

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      
      await emit('processing-error', {
        requestId: data.requestId,
        step: 'analyze',
        error: error.message,
        url: data.url
      });
    }
  }
};

