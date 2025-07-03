const axios = require('axios');
const config = require('../config');

/**
 * Event Step: Aggregate Content
 * 
 * Listens for both 'twitter-content-generated' and 'linkedin-content-generated' events
 * and aggregates the final results when both are complete
 */
module.exports = [
  {
    name: 'collect-twitter-content',
    type: 'event',
    topic: 'twitter-content-generated',
    
    async execute({ data, emit, store }) {
      try {
        console.log(`Collecting Twitter content for request: ${data.requestId}`);
        
        // Store Twitter content in temporary storage
        await store.set(`twitter-${data.requestId}`, {
          content: data.content,
          timestamp: data.timestamp
        });
        
        // Check if LinkedIn content is also ready
        const linkedinData = await store.get(`linkedin-${data.requestId}`);
        
        if (linkedinData) {
          // Both contents are ready, aggregate them
          await aggregateAndEmit(data.requestId, data.content, linkedinData.content, emit, store);
        }
        
      } catch (error) {
        console.error('Error collecting Twitter content:', error);
        await emit('processing-error', {
          requestId: data.requestId,
          step: 'aggregation',
          error: { message: error.message },
          timestamp: Date.now(),
          retryable: false
        });
      }
    }
  },
  
  {
    name: 'collect-linkedin-content',
    type: 'event',
    topic: 'linkedin-content-generated',
    
    async execute({ data, emit, store }) {
      try {
        console.log(`Collecting LinkedIn content for request: ${data.requestId}`);
        
        // Store LinkedIn content in temporary storage
        await store.set(`linkedin-${data.requestId}`, {
          content: data.content,
          timestamp: data.timestamp
        });
        
        // Check if Twitter content is also ready
        const twitterData = await store.get(`twitter-${data.requestId}`);
        
        if (twitterData) {
          // Both contents are ready, aggregate them
          await aggregateAndEmit(data.requestId, twitterData.content, data.content, emit, store);
        }
        
      } catch (error) {
        console.error('Error collecting LinkedIn content:', error);
        await emit('processing-error', {
          requestId: data.requestId,
          step: 'aggregation',
          error: { message: error.message },
          timestamp: Date.now(),
          retryable: false
        });
      }
    }
  },
  
  {
    name: 'finalize-content',
    type: 'event',
    topic: 'content-aggregated',
    
    async execute({ data, emit }) {
      try {
        console.log(`Finalizing content for request: ${data.requestId}`);
        
        // Send webhook if configured
        if (config.webhook.url) {
          await sendWebhook(data);
        }
        
        // Log completion
        console.log(`✅ Content generation completed for: ${data.originalTitle}`);
        console.log(`📊 Processing time: ${data.metadata.totalProcessingTime}ms`);
        console.log(`🐦 Twitter posts: ${data.generatedContent.twitter.tweets.length}`);
        console.log(`💼 LinkedIn post: ${data.generatedContent.linkedin.characterCount} characters`);
        
        // Emit final completion event (could be used for notifications)
        await emit('content-generation-complete', {
          requestId: data.requestId,
          success: true,
          timestamp: Date.now()
        });
        
      } catch (error) {
        console.error('Error finalizing content:', error);
        await emit('processing-error', {
          requestId: data.requestId,
          step: 'aggregation',
          error: { message: error.message },
          timestamp: Date.now(),
          retryable: false
        });
      }
    }
  }
];

/**
 * Aggregate Twitter and LinkedIn content and emit final result
 */
async function aggregateAndEmit(requestId, twitterContent, linkedinContent, emit, store) {
  try {
    // Get original request data
    const originalData = await store.get(`original-${requestId}`);
    const analysisData = await store.get(`analysis-${requestId}`);
    
    if (!originalData || !analysisData) {
      // Try to reconstruct from available data or use defaults
      console.warn(`Missing original data for request ${requestId}, using defaults`);
    }
    
    const startTime = await store.get(`start-time-${requestId}`) || Date.now();
    const totalProcessingTime = Date.now() - startTime;
    
    // Create aggregated content
    const aggregatedContent = {
      requestId,
      url: originalData?.url || 'Unknown',
      originalTitle: originalData?.title || 'Unknown Article',
      analysis: analysisData?.analysis || {},
      generatedContent: {
        twitter: twitterContent,
        linkedin: linkedinContent
      },
      metadata: {
        totalProcessingTime,
        completedAt: Date.now(),
        success: true,
        errors: []
      }
    };
    
    // Emit aggregated content
    await emit('content-aggregated', aggregatedContent);
    
    // Clean up temporary storage
    await cleanupStorage(requestId, store);
    
    console.log(`🎉 Successfully aggregated content for request: ${requestId}`);
    
  } catch (error) {
    console.error('Error in aggregateAndEmit:', error);
    throw error;
  }
}

/**
 * Send webhook notification if configured
 */
async function sendWebhook(data) {
  if (!config.webhook.url) {
    return;
  }
  
  try {
    const webhookPayload = {
      event: 'content-generation-complete',
      requestId: data.requestId,
      url: data.url,
      title: data.originalTitle,
      content: data.generatedContent,
      metadata: data.metadata,
      timestamp: Date.now()
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'ContentWritingAgent/1.0'
    };
    
    // Add webhook secret if configured
    if (config.webhook.secret) {
      headers['X-Webhook-Secret'] = config.webhook.secret;
    }
    
    await axios.post(config.webhook.url, webhookPayload, {
      headers,
      timeout: 10000
    });
    
    console.log(`📡 Webhook sent successfully for request: ${data.requestId}`);
    
  } catch (error) {
    console.error('Failed to send webhook:', error.message);
    // Don't throw error - webhook failure shouldn't break the pipeline
  }
}

/**
 * Clean up temporary storage
 */
async function cleanupStorage(requestId, store) {
  try {
    const keysToClean = [
      `twitter-${requestId}`,
      `linkedin-${requestId}`,
      `original-${requestId}`,
      `analysis-${requestId}`,
      `start-time-${requestId}`
    ];
    
    for (const key of keysToClean) {
      await store.delete(key);
    }
    
    console.log(`🧹 Cleaned up storage for request: ${requestId}`);
    
  } catch (error) {
    console.error('Error cleaning up storage:', error);
    // Don't throw - cleanup failure shouldn't break the pipeline
  }
}

// Helper function to store original data (called from other steps)
async function storeOriginalData(requestId, data, store) {
  await store.set(`original-${requestId}`, data);
  await store.set(`start-time-${requestId}`, Date.now());
}

// Helper function to store analysis data (called from analysis step)
async function storeAnalysisData(requestId, data, store) {
  await store.set(`analysis-${requestId}`, data);
}

module.exports.storeOriginalData = storeOriginalData;
module.exports.storeAnalysisData = storeAnalysisData;

