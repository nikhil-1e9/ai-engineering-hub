import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

const config = require('../config')

export const config: EventConfig = {
  type: 'event',
  name: 'ScheduleContent',
  description: 'Schedules generated content using Typefully API',
  subscribes: ['schedule-content'],
  emits: ['content-scheduled'],
  input: z.object({
    requestId: z.string(),
    url: z.string().url(),
    title: z.string(),
    content: z.object({
      twitter: z.any(),
      linkedin: z.any()
    }),
    metadata: z.any()
  }),
  flows: ['simple-content-generation']
}

export const handler: Handlers['ScheduleContent'] = async (input, { emit, logger }) => {
  logger.info(`📅 Scheduling content for: ${input.title}`)

  try {
    const typefullyApiUrl = 'https://api.typefully.com/v1'
    const headers = {
      'Authorization': `Bearer ${config.typefully.apiKey}`,
      'Content-Type': 'application/json'
    }

    // Schedule Twitter thread
    logger.info(`📱 Scheduling Twitter thread...`)
    
    // Convert Twitter thread to Typefully format
    const twitterThread = input.content.twitter.thread.map((tweet: any) => tweet.content).join('\n\n')
    
    const twitterPayload = {
      content: twitterThread,
      schedule_date: null, // Will be posted as draft
      auto_plug: false,
      auto_retweet_enabled: false
    }

    const twitterResponse = await fetch(`${typefullyApiUrl}/drafts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(twitterPayload)
    })

    if (!twitterResponse.ok) {
      const errorData = await twitterResponse.text()
      throw new Error(`Twitter scheduling failed: ${twitterResponse.status} - ${errorData}`)
    }

    const twitterResult = await twitterResponse.json()
    logger.info(`✅ Twitter thread scheduled as draft: ${twitterResult.id}`)

    // Schedule LinkedIn post
    logger.info(`💼 Scheduling LinkedIn post...`)
    
    const linkedinPayload = {
      content: input.content.linkedin.post,
      schedule_date: null, // Will be posted as draft
      auto_plug: false,
      platforms: ['linkedin'] // Specify LinkedIn platform
    }

    const linkedinResponse = await fetch(`${typefullyApiUrl}/drafts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(linkedinPayload)
    })

    if (!linkedinResponse.ok) {
      const errorData = await linkedinResponse.text()
      throw new Error(`LinkedIn scheduling failed: ${linkedinResponse.status} - ${errorData}`)
    }

    const linkedinResult = await linkedinResponse.json()
    logger.info(`✅ LinkedIn post scheduled as draft: ${linkedinResult.id}`)

    // Emit completion event
    await emit({
      topic: 'content-scheduled',
      data: {
        requestId: input.requestId,
        title: input.title,
        url: input.url,
        scheduledContent: {
          twitter: {
            draftId: twitterResult.id,
            url: `https://typefully.com/drafts/${twitterResult.id}`,
            totalTweets: input.content.twitter.totalTweets
          },
          linkedin: {
            draftId: linkedinResult.id,
            url: `https://typefully.com/drafts/${linkedinResult.id}`,
            characterCount: input.content.linkedin.characterCount
          }
        },
        completedAt: new Date().toISOString(),
        totalProcessingTime: Date.now() - input.metadata.generatedAt
      }
    })

    logger.info(`🎉 Content scheduling completed successfully!`)
    logger.info(`📱 Twitter: https://typefully.com/drafts/${twitterResult.id}`)
    logger.info(`💼 LinkedIn: https://typefully.com/drafts/${linkedinResult.id}`)
    logger.info(`👀 Visit Typefully to review and publish your content!`)

  } catch (error) {
    logger.error(`❌ Content scheduling failed: ${error.message}`)
    throw error
  }
}

