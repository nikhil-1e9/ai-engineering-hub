import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'SimpleContentAPI',
  description: 'Triggers simplified content generation from article URL',
  path: '/generate-content',
  method: 'POST',
  bodySchema: z.object({
    url: z.string().url({ message: 'Valid URL is required' })
  }),
  responseSchema: {
    200: z.object({
      message: z.string(),
      requestId: z.string(),
      url: z.string(),
      status: z.string()
    }),
    400: z.object({
      error: z.string()
    })
  },
  emits: ['scrape-article'],
  flows: ['simple-content-generation']
}

export const handler: Handlers['SimpleContentAPI'] = async (req, { emit, traceId, logger }) => {
  const { url } = req.body

  logger.info(`🚀 Starting content generation for: ${url}`)

  await emit({
    topic: 'scrape-article',
    data: {
      requestId: traceId,
      url,
      timestamp: Date.now()
    }
  })

  return {
    status: 200,
    body: {
      message: 'Content generation started',
      requestId: traceId,
      url,
      status: 'processing'
    }
  }
}

