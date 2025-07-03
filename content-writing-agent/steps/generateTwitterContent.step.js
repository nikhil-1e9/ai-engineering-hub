const OpenAI = require('openai');
const config = require('../config');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Event Step: Generate Twitter Content
 * 
 * Listens for 'content-analyzed' events and generates viral Twitter posts
 * based on the analyzed content and insights
 */
module.exports = {
  name: 'generate-twitter-content',
  type: 'event',
  topic: 'content-analyzed',
  
  async execute({ data, emit }) {
    try {
      console.log(`Generating Twitter content for: ${data.originalContent.title}`);
      
      // Create Twitter generation prompt
      const twitterPrompt = createTwitterPrompt(data);
      
      // Call OpenAI for Twitter content generation
      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a viral Twitter content creator with expertise in crafting engaging, shareable tweets that drive high engagement. You understand Twitter trends, hashtag strategy, and what makes content go viral.'
          },
          {
            role: 'user',
            content: twitterPrompt
          }
        ],
        temperature: config.openai.temperature + 0.1, // Slightly more creative for Twitter
        max_tokens: 1500,
      });
      
      // Parse the AI response
      let twitterContent;
      try {
        const responseContent = completion.choices[0].message.content;
        twitterContent = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('Failed to parse Twitter content response:', parseError);
        throw new Error('Invalid Twitter content response format');
      }
      
      // Validate and process Twitter content
      const processedContent = processTwitterContent(twitterContent);
      
      // Prepare Twitter content event
      const twitterEvent = {
        requestId: data.requestId,
        content: processedContent,
        timestamp: Date.now()
      };
      
      console.log(`Generated ${processedContent.tweets.length} Twitter posts`);
      
      // Emit Twitter content for aggregation
      await emit('twitter-content-generated', twitterEvent);
      
    } catch (error) {
      console.error('Error generating Twitter content:', error);
      
      // Emit error event
      await emit('processing-error', {
        requestId: data.requestId,
        step: 'twitter-generation',
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
 * Create the Twitter generation prompt
 */
function createTwitterPrompt(data) {
  const { originalContent, analysis } = data;
  
  return `
Create viral Twitter content based on this analyzed article:

ARTICLE INFO:
Title: ${originalContent.title}
Author: ${originalContent.author || 'Unknown'}
Word Count: ${originalContent.wordCount}
URL: ${data.url}

CONTENT ANALYSIS:
Main Themes: ${analysis.mainThemes.join(', ')}
Key Points: ${analysis.keyPoints.join(', ')}
Sentiment: ${analysis.sentiment}
Target Audience: ${analysis.targetAudience.join(', ')}
Viral Potential: ${analysis.viralPotential}/10
Content Type: ${analysis.contentType}
Emotional Triggers: ${analysis.emotionalTriggers.join(', ')}
Call to Action: ${analysis.callToAction || 'N/A'}

REQUIREMENTS:
1. Create 3-5 different tweet variations (single tweets, not threads)
2. Each tweet must be under 280 characters
3. Include relevant hashtags (2-4 per tweet)
4. Make them engaging and shareable
5. Use emotional triggers and hooks
6. Include a call-to-action when appropriate
7. Consider current Twitter trends and viral patterns

TWEET STYLES TO INCLUDE:
- Hook/Question tweet (starts with intriguing question)
- Stat/Fact tweet (highlights surprising data or insight)
- Opinion/Hot take tweet (controversial but thoughtful perspective)
- Actionable/Tip tweet (provides value to readers)
- Story/Thread starter (could lead to a thread)

Return a JSON object with this structure:
{
  "tweets": [
    {
      "text": "Tweet content here...",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
      "characterCount": 245,
      "type": "single",
      "engagementHook": "What makes this tweet engaging"
    }
  ],
  "engagementHooks": ["hook1", "hook2", "hook3"],
  "trendingHashtags": ["trending1", "trending2"],
  "bestPostingTimes": ["9-10 AM EST", "7-8 PM EST"]
}

Make sure each tweet:
- Has a strong opening hook
- Uses active voice
- Includes emotional appeal
- Has clear value proposition
- Encourages engagement (likes, retweets, replies)

Return only the JSON object, no additional text.
  `;
}

/**
 * Process and validate Twitter content
 */
function processTwitterContent(content) {
  // Validate structure
  if (!content.tweets || !Array.isArray(content.tweets)) {
    throw new Error('Invalid Twitter content structure: missing tweets array');
  }
  
  // Process each tweet
  const processedTweets = content.tweets.map((tweet, index) => {
    // Validate tweet structure
    if (!tweet.text || typeof tweet.text !== 'string') {
      throw new Error(`Tweet ${index + 1}: missing or invalid text`);
    }
    
    // Ensure character count is accurate
    const actualCharCount = tweet.text.length;
    if (actualCharCount > config.content.maxTweetLength) {
      // Truncate if too long
      tweet.text = tweet.text.substring(0, config.content.maxTweetLength - 3) + '...';
    }
    
    return {
      text: tweet.text.trim(),
      hashtags: Array.isArray(tweet.hashtags) ? tweet.hashtags : [],
      characterCount: tweet.text.length,
      type: tweet.type || 'single',
      threadPosition: tweet.threadPosition || null,
      engagementHook: tweet.engagementHook || 'Engaging content'
    };
  });
  
  // Filter out empty tweets
  const validTweets = processedTweets.filter(tweet => tweet.text.length > 0);
  
  if (validTweets.length === 0) {
    throw new Error('No valid tweets generated');
  }
  
  return {
    tweets: validTweets,
    threadSummary: content.threadSummary || null,
    engagementHooks: Array.isArray(content.engagementHooks) ? content.engagementHooks : [],
    trendingHashtags: Array.isArray(content.trendingHashtags) ? content.trendingHashtags : [],
    bestPostingTimes: Array.isArray(content.bestPostingTimes) ? content.bestPostingTimes : []
  };
}

