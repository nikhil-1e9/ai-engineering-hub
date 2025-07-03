const crypto = require('crypto');

// Generate UUID v4 without external dependency
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * API Step: Trigger Article Scraping
 * 
 * This step exposes an HTTP endpoint that accepts article URLs
 * and triggers the content generation pipeline.
 * 
 * POST /api/generate-content
 * Body: { url: string, options?: object }
 */
module.exports = {
  // Step configuration
  name: 'trigger-scraping',
  type: 'api',
  method: 'POST',
  path: '/api/generate-content',
  
  // Step execution
  async execute({ body, emit }) {
    try {
      // Validate input
      if (!body || !body.url) {
        return {
          status: 400,
          body: {
            error: 'Missing required field: url',
            message: 'Please provide a valid article URL to process'
          }
        };
      }

      // Validate URL format
      let articleUrl;
      try {
        articleUrl = new URL(body.url);
        
        // Basic validation for supported protocols
        if (!['http:', 'https:'].includes(articleUrl.protocol)) {
          throw new Error('Only HTTP and HTTPS URLs are supported');
        }
      } catch (urlError) {
        return {
          status: 400,
          body: {
            error: 'Invalid URL format',
            message: 'Please provide a valid HTTP or HTTPS URL'
          }
        };
      }

      // Generate unique request ID for tracking
      const requestId = generateUUID();
      const timestamp = Date.now();

      // Prepare scraping event
      const scrapeEvent = {
        url: body.url,
        requestId,
        timestamp,
        options: {
          waitForSelector: body.options?.waitForSelector,
          timeout: body.options?.timeout || 30000,
          userAgent: body.options?.userAgent
        }
      };

      // Emit event to trigger scraping
      await emit('scrape-article', scrapeEvent);

      // Return immediate response with tracking info
      return {
        status: 202, // Accepted - processing started
        body: {
          message: 'Content generation started',
          requestId,
          url: body.url,
          estimatedProcessingTime: '2-3 minutes',
          status: 'processing',
          steps: [
            'Scraping article content',
            'Analyzing content and audience',
            'Generating Twitter content',
            'Generating LinkedIn content',
            'Finalizing results'
          ]
        }
      };

    } catch (error) {
      console.error('Error in trigger-scraping step:', error);
      
      return {
        status: 500,
        body: {
          error: 'Internal server error',
          message: 'Failed to start content generation process',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      };
    }
  }
};
