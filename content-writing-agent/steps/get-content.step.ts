import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetContentAPI',
  description: 'Retrieves generated content for review',
  path: '/content/:requestId',
  method: 'GET',
  responseSchema: {
    200: z.object({
      requestId: z.string(),
      title: z.string(),
      url: z.string(),
      strategy: z.any(),
      content: z.object({
        twitter: z.any(),
        linkedin: z.any()
      }),
      metadata: z.any(),
      schedulingEndpoint: z.string()
    }),
    404: z.object({
      error: z.string()
    })
  },
  emits: [],
  flows: ['content-generation']
}

export const handler: Handlers['GetContentAPI'] = async (req, { state }) => {
  const requestId = req.params.requestId
  
  const contentData = await state.get(`content-${requestId}`)
  
  if (!contentData) {
    return {
      status: 404,
      body: {
        error: 'Content not found. Please generate content first.'
      }
    }
  }

  return {
    status: 200,
    body: {
      ...contentData,
      schedulingEndpoint: `/schedule-content/${requestId}`
    }
  }
}

