require('dotenv').config();

const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.CONTENT_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.MAX_TOKENS) || 2000,
  },

  // Web Scraping Configuration
  scraping: {
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    timeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
    delay: parseInt(process.env.SCRAPING_DELAY_MS) || 1000,
    puppeteerOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  },

  // Content Generation Settings
  content: {
    maxTweetLength: parseInt(process.env.MAX_TWEET_LENGTH) || 280,
    maxLinkedInLength: parseInt(process.env.MAX_LINKEDIN_LENGTH) || 3000,
    aiRequestDelay: parseInt(process.env.AI_REQUEST_DELAY_MS) || 500,
  },

  // Motia Configuration
  motia: {
    port: parseInt(process.env.MOTIA_PORT) || 3000,
    environment: process.env.MOTIA_ENV || 'development',
  },

  // Optional Webhook Configuration
  webhook: {
    url: process.env.WEBHOOK_URL,
    secret: process.env.WEBHOOK_SECRET,
  },

  // Validation
  validate() {
    const required = ['OPENAI_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};

module.exports = config;

