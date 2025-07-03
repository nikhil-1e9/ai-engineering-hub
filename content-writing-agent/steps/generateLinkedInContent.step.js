const OpenAI = require('openai');
const config = require('../config');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Event Step: Generate LinkedIn Content
 * 
 * Listens for 'content-analyzed' events and generates professional LinkedIn posts
 * based on the analyzed content and insights
 */
module.exports = {
  name: 'generate-linkedin-content',
  type: 'event',
  topic: 'content-analyzed',
  
  async execute({ data, emit }) {
    try {
      console.log(`Generating LinkedIn content for: ${data.originalContent.title}`);
      
      // Create LinkedIn generation prompt
      const linkedinPrompt = createLinkedInPrompt(data);
      
      // Call OpenAI for LinkedIn content generation
      const completion = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional LinkedIn content strategist with expertise in creating engaging, thought-provoking posts that drive professional engagement, comments, and shares. You understand LinkedIn\'s professional audience and what content performs well on the platform.'
          },
          {
            role: 'user',
            content: linkedinPrompt
          }
        ],
        temperature: config.openai.temperature - 0.1, // Slightly more professional tone
        max_tokens: 2000,
      });
      
      // Parse the AI response
      let linkedinContent;
      try {
        const responseContent = completion.choices[0].message.content;
        linkedinContent = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('Failed to parse LinkedIn content response:', parseError);
        throw new Error('Invalid LinkedIn content response format');
      }
      
      // Validate and process LinkedIn content
      const processedContent = processLinkedInContent(linkedinContent);
      
      // Prepare LinkedIn content event
      const linkedinEvent = {
        requestId: data.requestId,
        content: processedContent,
        timestamp: Date.now()
      };
      
      console.log(`Generated LinkedIn post (${processedContent.characterCount} characters)`);
      
      // Emit LinkedIn content for aggregation
      await emit('linkedin-content-generated', linkedinEvent);
      
    } catch (error) {
      console.error('Error generating LinkedIn content:', error);
      
      // Emit error event
      await emit('processing-error', {
        requestId: data.requestId,
        step: 'linkedin-generation',
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
 * Create the LinkedIn generation prompt
 */
function createLinkedInPrompt(data) {
  const { originalContent, analysis } = data;
  
  return `
Create professional LinkedIn content based on this analyzed article:

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
Reading Level: ${analysis.readingLevel}
Emotional Triggers: ${analysis.emotionalTriggers.join(', ')}
Call to Action: ${analysis.callToAction || 'N/A'}

LINKEDIN POST REQUIREMENTS:
1. Create a professional, engaging LinkedIn post (1500-3000 characters)
2. Use a compelling headline/hook in the first line
3. Structure with short paragraphs for readability
4. Include professional insights and takeaways
5. Add a thought-provoking question to encourage comments
6. Include relevant hashtags (5-8 professional hashtags)
7. Maintain a professional but conversational tone
8. Include a clear call-to-action
9. Reference industry trends or implications when relevant

LINKEDIN POST STRUCTURE:
- Hook/Opening line (attention-grabbing)
- Context/Background (brief article summary)
- Key insights (2-3 main takeaways)
- Professional perspective (your analysis/opinion)
- Industry implications (broader impact)
- Engagement question (encourage discussion)
- Call-to-action
- Hashtags

TONE GUIDELINES:
- Professional but approachable
- Thought-provoking
- Value-driven
- Industry-focused
- Encouraging discussion and engagement

Return a JSON object with this structure:
{
  "post": "Full LinkedIn post content here...",
  "headline": "Compelling first line/hook",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "characterCount": 2456,
  "callToAction": "What's your take on this? Share your thoughts below.",
  "professionalTone": true,
  "industryFocus": ["industry1", "industry2"],
  "engagementQuestion": "What strategies have you found most effective in your experience?",
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"]
}

Make sure the post:
- Starts with a hook that stops scrolling
- Provides genuine professional value
- Encourages meaningful discussion
- Uses line breaks for readability
- Includes industry-relevant insights
- Has a clear call-to-action
- Uses professional hashtags strategically

Return only the JSON object, no additional text.
  `;
}

/**
 * Process and validate LinkedIn content
 */
function processLinkedInContent(content) {
  // Validate structure
  if (!content.post || typeof content.post !== 'string') {
    throw new Error('Invalid LinkedIn content structure: missing post text');
  }
  
  // Validate character count
  const actualCharCount = content.post.length;
  if (actualCharCount > config.content.maxLinkedInLength) {
    // Truncate if too long
    content.post = content.post.substring(0, config.content.maxLinkedInLength - 3) + '...';
  }
  
  if (actualCharCount < 100) {
    throw new Error('LinkedIn post too short - minimum 100 characters required');
  }
  
  // Process hashtags - ensure they start with #
  const processedHashtags = Array.isArray(content.hashtags) 
    ? content.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`)
    : [];
  
  // Validate required fields
  const headline = content.headline || content.post.split('\n')[0] || 'Professional insight';
  const callToAction = content.callToAction || 'What are your thoughts on this?';
  
  return {
    post: content.post.trim(),
    headline: headline.trim(),
    hashtags: processedHashtags,
    characterCount: content.post.length,
    callToAction: callToAction.trim(),
    professionalTone: content.professionalTone !== false, // Default to true
    industryFocus: Array.isArray(content.industryFocus) ? content.industryFocus : [],
    engagementQuestion: content.engagementQuestion || callToAction,
    keyTakeaways: Array.isArray(content.keyTakeaways) ? content.keyTakeaways : []
  };
}

