const OpenAI = require('openai');
const config = require('../config');

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

module.exports = {
  name: 'generate',
  type: 'event',
  topic: 'generate-content',
  
  async execute({ data, emit }) {
    try {
      console.log(`✍️ Generating content for: ${data.title}`);
      
      // Generate Twitter content
      const twitterPrompt = `Based on this content strategy, create engaging Twitter content for developers:

ARTICLE: ${data.title}
STRATEGY: ${JSON.stringify(data.strategy.twitterStrategy)}
KEY INSIGHTS: ${data.strategy.analysis.keyInsights.join(', ')}

Create ${data.strategy.twitterStrategy.format === 'thread' ? 'a Twitter thread (3-5 tweets)' : 'a single engaging tweet'} that:
- Uses the recommended hook and angle
- Highlights technical insights
- Includes relevant hashtags
- Stays under 280 characters per tweet
- Appeals to ${data.strategy.analysis.targetAudience}

Respond in JSON format:
{
  "tweets": [
    {
      "text": "tweet content with hashtags",
      "order": 1
    }
  ],
  "totalTweets": number
}`;

      const twitterResponse = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: twitterPrompt }],
        temperature: 0.8,
        max_tokens: 800
      });

      const twitterContent = JSON.parse(twitterResponse.choices[0].message.content);

      // Generate LinkedIn content
      const linkedinPrompt = `Based on this content strategy, create a professional LinkedIn post for developers:

ARTICLE: ${data.title}
STRATEGY: ${JSON.stringify(data.strategy.linkedinStrategy)}
KEY INSIGHTS: ${data.strategy.analysis.keyInsights.join(', ')}

Create a LinkedIn post that:
- Uses the recommended professional angle and value proposition
- Highlights industry insights
- Includes the suggested call-to-action
- Uses relevant hashtags
- Is 1000-2000 characters
- Appeals to ${data.strategy.analysis.targetAudience}

Respond in JSON format:
{
  "post": "full LinkedIn post content with hashtags and CTA",
  "characterCount": number
}`;

      const linkedinResponse = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: linkedinPrompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      const linkedinContent = JSON.parse(linkedinResponse.choices[0].message.content);

      const finalResult = {
        requestId: data.requestId,
        url: data.url,
        title: data.title,
        strategy: data.strategy,
        content: {
          twitter: twitterContent,
          linkedin: linkedinContent
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - data.timestamp,
          targetAudience: data.strategy.analysis.targetAudience
        }
      };

      console.log(`🎉 Content generated successfully!`);
      console.log(`📱 Twitter: ${twitterContent.totalTweets} tweet(s)`);
      console.log(`💼 LinkedIn: ${linkedinContent.characterCount} characters`);

      // Emit final result
      await emit('content-complete', finalResult);

    } catch (error) {
      console.error('❌ Content generation failed:', error);
      
      await emit('processing-error', {
        requestId: data.requestId,
        step: 'generate',
        error: error.message,
        url: data.url
      });
    }
  }
};

