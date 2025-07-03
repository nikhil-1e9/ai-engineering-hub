const FirecrawlApp = require('@mendable/firecrawl-js').default;
const config = require('../config');

module.exports = {
  name: 'scrape',
  type: 'event',
  topic: 'scrape-article',
  
  async execute({ data, emit }) {
    try {
      console.log(`🕷️ Scraping article: ${data.url}`);
      
      const app = new FirecrawlApp({ apiKey: config.firecrawl.apiKey });
      
      // Scrape the article and get markdown content
      const scrapeResult = await app.scrapeUrl(data.url, {
        formats: ['markdown'],
        onlyMainContent: true
      });

      if (!scrapeResult.success) {
        throw new Error(`Firecrawl scraping failed: ${scrapeResult.error}`);
      }

      const content = scrapeResult.data.markdown;
      const title = scrapeResult.data.metadata?.title || 'Untitled Article';
      
      console.log(`✅ Successfully scraped: ${title} (${content.length} characters)`);

      // Emit scraped content for analysis
      await emit('analyze-content', {
        requestId: data.requestId,
        url: data.url,
        title,
        content,
        timestamp: data.timestamp
      });

    } catch (error) {
      console.error('❌ Scraping failed:', error);
      
      await emit('processing-error', {
        requestId: data.requestId,
        step: 'scrape',
        error: error.message,
        url: data.url
      });
    }
  }
};

