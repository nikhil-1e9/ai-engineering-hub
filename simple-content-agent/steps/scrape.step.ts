import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import FirecrawlApp from '@mendable/firecrawl-js'

const config = require('../config')

export const config: EventConfig = {
  type: 'event',
  name: 'ScrapeArticle',
  description: 'Scrapes article content using Firecrawl in markdown format',
  subscribes: ['scrape-article'],
  emits: ['generate-content'],
  input: z.object({
    requestId: z.string(),
    url: z.string().url(),
    timestamp: z.number()
  }),
  flows: ['simple-content-generation']
}

export const handler: Handlers['ScrapeArticle'] = async (input, { emit, logger }) => {
  logger.info(`🕷️ Scraping article: ${input.url}`)

  const app = new FirecrawlApp({ apiKey: config.firecrawl.apiKey })

  try {
    const scrapeResult = await app.scrapeUrl(input.url, {
      formats: ['markdown'],
      onlyMainContent: true
    })

    if (!scrapeResult.success) {
      throw new Error(`Firecrawl scraping failed: ${scrapeResult.error}`)
    }

    const content = scrapeResult.markdown  
    const title = scrapeResult.metadata?.title || 'Untitled Article'

    logger.info(`✅ Successfully scraped: ${title} (${content?.length ?? 0} characters)`)

    await emit({
      topic: 'generate-content',
      data: {
        requestId: input.requestId,
        url: input.url,
        title,
        content,
        timestamp: input.timestamp
      }
    })

  } catch (error) {
    logger.error(`❌ Scraping failed: ${error.message}`)
    throw error
  }
}

