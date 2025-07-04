import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import axios from 'axios'

const config = require('../config')

export const config: EventConfig = {
  type: 'event',
  name: 'SchedulePosts',
  description: 'Schedules Twitter and LinkedIn posts using Typefully',
  subscribes: ['schedule-posts'],
  emits: ['content-complete'],
  input: z.object({
    requestId: z.string(),
    url: z.string().url(),
    title: z.string(),
    strategy: z.any(),
    content: z.object({
      twitter: z.any(),
      linkedin: z.any()
    }),
    metadata: z.any()
  }),
  flows: ['content-generation']
}

export const handler: Handlers['SchedulePosts'] = async (input, { emit, logger }) => {
  logger.info(`📅 Scheduling posts for: ${input.title}`)
  
  const typefullyHeaders = {
    'Authorization': `Bearer ${config.typefully.apiKey}`,
    'Content-Type': 'application/json'
  }

  // Schedule Twitter content
  const twitterTweets = input.content.twitter.tweets.map((tweet: any) => tweet.text)
  
  const twitterScheduleResponse = await axios.post('https://api.typefully.com/v1/drafts/', {
    content: twitterTweets,
    schedule_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Schedule 1 hour from now
    auto_retweet_enabled: false
  }, { headers: typefullyHeaders })

  logger.info(`🐦 Twitter scheduled: Draft ID ${twitterScheduleResponse.data.id}`)

  // Schedule LinkedIn content (if Typefully supports LinkedIn, otherwise just log)
  try {
    const linkedinScheduleResponse = await axios.post('https://api.typefully.com/v1/drafts/', {
      content: [input.content.linkedin.post],
      schedule_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Schedule 2 hours from now
      auto_retweet_enabled: false
    }, { headers: typefullyHeaders })

    logger.info(`💼 LinkedIn scheduled: Draft ID ${linkedinScheduleResponse.data.id}`)
  } catch (error) {
    logger.info(`💼 LinkedIn content ready (manual posting required): ${input.content.linkedin.post.substring(0, 100)}...`)
  }

  await emit({
    topic: 'content-complete',
    data: {
      ...input,
      scheduledAt: new Date().toISOString(),
      twitterDraftId: twitterScheduleResponse.data.id
    }
  })
}

