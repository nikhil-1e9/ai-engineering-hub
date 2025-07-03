const { generateUUID } = require('@motia/core');

module.exports = {
  name: 'api',
  type: 'api',
  path: '/generate-content',
  method: 'POST',
  
  async execute({ data, emit }) {
    try {
      const { url } = data;
      
      if (!url) {
        return {
          status: 400,
          body: { error: 'URL is required' }
        };
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        return {
          status: 400,
          body: { error: 'Invalid URL format' }
        };
      }

      const requestId = generateUUID();
      
      // Emit event to start scraping
      await emit('scrape-article', {
        requestId,
        url,
        timestamp: Date.now()
      });

      return {
        status: 200,
        body: {
          message: 'Content generation started',
          requestId,
          url,
          status: 'processing'
        }
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        status: 500,
        body: { error: 'Internal server error' }
      };
    }
  }
};

