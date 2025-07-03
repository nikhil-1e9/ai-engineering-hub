const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const config = require('../config');

/**
 * Event Step: Scrape Article Content
 * 
 * Listens for 'scrape-article' events and extracts content from web pages
 * using both Puppeteer (for dynamic content) and Cheerio (for static content)
 */
module.exports = {
  name: 'scrape-article',
  type: 'event',
  topic: 'scrape-article',
  
  async execute({ data, emit, store }) {
    const startTime = Date.now();
    let browser = null;
    
    try {
      console.log(`Starting to scrape article: ${data.url}`);
      
      // First, try with a simple HTTP request (faster for static content)
      let scrapedContent = await tryStaticScraping(data.url);
      
      // If static scraping fails or returns insufficient content, use Puppeteer
      if (!scrapedContent || scrapedContent.text.length < 500) {
        console.log('Static scraping insufficient, trying dynamic scraping...');
        scrapedContent = await tryDynamicScraping(data.url, data.options);
      }
      
      if (!scrapedContent) {
        throw new Error('Failed to extract content from the article');
      }
      
      // Prepare the scraped event
      const scrapedEvent = {
        requestId: data.requestId,
        url: data.url,
        content: scrapedContent,
        metadata: {
          scrapedAt: Date.now(),
          processingTime: Date.now() - startTime,
          success: true
        }
      };
      
      console.log(`Successfully scraped article: ${scrapedContent.title} (${scrapedContent.wordCount} words)`);
      
      // Store original data for later aggregation
      await store.set(`original-${data.requestId}`, {
        url: data.url,
        title: scrapedContent.title,
        timestamp: startTime
      });
      await store.set(`start-time-${data.requestId}`, startTime);
      
      // Emit the scraped content for analysis
      await emit('article-scraped', scrapedEvent);
      
    } catch (error) {
      console.error('Error scraping article:', error);
      
      // Emit error event
      await emit('processing-error', {
        requestId: data.requestId,
        step: 'scraping',
        error: {
          message: error.message,
          code: error.code,
          details: error.stack
        },
        timestamp: Date.now(),
        retryable: true
      });
      
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
};

/**
 * Try scraping with simple HTTP request and Cheerio
 */
async function tryStaticScraping(url) {
  try {
    const response = await axios.get(url, {
      timeout: config.scraping.timeout,
      headers: {
        'User-Agent': config.scraping.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share').remove();
    
    // Extract content using multiple selectors
    const title = extractTitle($);
    const text = extractMainContent($);
    const author = extractAuthor($);
    const publishDate = extractPublishDate($);
    const description = extractDescription($);
    const keywords = extractKeywords($);
    
    if (!title || !text || text.length < 100) {
      return null; // Insufficient content
    }
    
    return {
      title: title.trim(),
      text: text.trim(),
      author: author?.trim(),
      publishDate: publishDate?.trim(),
      description: description?.trim(),
      keywords: keywords,
      wordCount: text.split(/\s+/).length
    };
    
  } catch (error) {
    console.log('Static scraping failed:', error.message);
    return null;
  }
}

/**
 * Try scraping with Puppeteer for dynamic content
 */
async function tryDynamicScraping(url, options = {}) {
  let browser = null;
  
  try {
    browser = await puppeteer.launch(config.scraping.puppeteerOptions);
    const page = await browser.newPage();
    
    // Set user agent and viewport
    await page.setUserAgent(options.userAgent || config.scraping.userAgent);
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: options.timeout || config.scraping.timeout
    });
    
    // Wait for specific selector if provided
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
    }
    
    // Extract content
    const content = await page.evaluate(() => {
      // Remove unwanted elements
      const unwantedSelectors = [
        'script', 'style', 'nav', 'header', 'footer', 'aside',
        '.advertisement', '.ads', '.social-share', '.popup', '.modal'
      ];
      
      unwantedSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
      
      // Extract title
      const title = document.querySelector('h1')?.textContent ||
                   document.querySelector('title')?.textContent ||
                   document.querySelector('[property="og:title"]')?.content ||
                   '';
      
      // Extract main content
      const contentSelectors = [
        'article', '.article-content', '.post-content', '.entry-content',
        '.content', 'main', '[role="main"]', '.story-body'
      ];
      
      let mainContent = '';
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          mainContent = element.textContent || element.innerText || '';
          if (mainContent.length > 500) break;
        }
      }
      
      // Fallback to body content if no main content found
      if (!mainContent || mainContent.length < 500) {
        mainContent = document.body.textContent || document.body.innerText || '';
      }
      
      // Extract metadata
      const author = document.querySelector('[rel="author"]')?.textContent ||
                    document.querySelector('.author')?.textContent ||
                    document.querySelector('[property="article:author"]')?.content ||
                    '';
      
      const description = document.querySelector('meta[name="description"]')?.content ||
                         document.querySelector('[property="og:description"]')?.content ||
                         '';
      
      return {
        title: title.trim(),
        text: mainContent.trim(),
        author: author.trim(),
        description: description.trim()
      };
    });
    
    if (!content.title || !content.text || content.text.length < 100) {
      throw new Error('Insufficient content extracted');
    }
    
    return {
      ...content,
      publishDate: null, // Could be enhanced to extract publish date
      keywords: [], // Could be enhanced to extract keywords
      wordCount: content.text.split(/\s+/).length
    };
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper functions for static scraping
function extractTitle($) {
  return $('h1').first().text() ||
         $('title').text() ||
         $('[property="og:title"]').attr('content') ||
         '';
}

function extractMainContent($) {
  const contentSelectors = [
    'article', '.article-content', '.post-content', '.entry-content',
    '.content', 'main', '[role="main"]', '.story-body'
  ];
  
  for (const selector of contentSelectors) {
    const content = $(selector).text();
    if (content && content.length > 500) {
      return content;
    }
  }
  
  // Fallback to body content
  return $('body').text();
}

function extractAuthor($) {
  return $('[rel="author"]').text() ||
         $('.author').text() ||
         $('[property="article:author"]').attr('content') ||
         null;
}

function extractPublishDate($) {
  return $('[property="article:published_time"]').attr('content') ||
         $('time').attr('datetime') ||
         $('.publish-date').text() ||
         null;
}

function extractDescription($) {
  return $('meta[name="description"]').attr('content') ||
         $('[property="og:description"]').attr('content') ||
         null;
}

function extractKeywords($) {
  const keywords = $('meta[name="keywords"]').attr('content');
  return keywords ? keywords.split(',').map(k => k.trim()) : [];
}
