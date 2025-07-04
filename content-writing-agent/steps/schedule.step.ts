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
    metadata: z.any(),
    schedulingPreferences: z.object({
      scheduleTwitter: z.boolean(),
      scheduleLinkedIn: z.boolean(),
      twitterScheduleTime: z.string().optional(),
      linkedinScheduleTime: z.string().optional()
    }).optional()
  }),
  flows: ['content-generation']
}

export const handler: Handlers['SchedulePosts'] = async (input, { emit, logger }) => {
  logger.info(`📅 Scheduling posts for: ${input.title}`)
  
  const preferences = input.schedulingPreferences || {
    scheduleTwitter: true,
    scheduleLinkedIn: true
  }
  
  const typefullyHeaders = {
    'Authorization': `Bearer ${config.typefully.apiKey}`,
    'Content-Type': 'application/json'
  }

  let twitterDraftId: string | undefined
  let linkedinDraftId: string | undefined

  // Schedule Twitter content if requested
  if (preferences.scheduleTwitter) {
    const twitterTweets = input.content.twitter.tweets.map((tweet: any) => tweet.text)
    const twitterScheduleTime = preferences.twitterScheduleTime 
      ? new Date(preferences.twitterScheduleTime).toISOString()
      : new Date(Date.now() + 60 * 60 * 1000).toISOString() // Default: 1 hour from now
    
    const twitterScheduleResponse = await axios.post('https://api.typefully.com/v1/drafts/', {
      content: twitterTweets,
      schedule_date: twitterScheduleTime,
      auto_retweet_enabled: false
    }, { headers: typefullyHeaders })

    twitterDraftId = twitterScheduleResponse.data.id
    logger.info(`🐦 Twitter scheduled: Draft ID ${twitterDraftId}`)
  } else {
    logger.info(`🐦 Twitter scheduling skipped by user`)
  }

  // Schedule LinkedIn content if requested
  if (preferences.scheduleLinkedIn) {
    try {
      const linkedinScheduleTime = preferences.linkedinScheduleTime
        ? new Date(preferences.linkedinScheduleTime).toISOString()
        : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // Default: 2 hours from now

      const linkedinScheduleResponse = await axios.post('https://api.typefully.com/v1/drafts/', {
        content: [input.content.linkedin.post],
        schedule_date: linkedinScheduleTime,
        auto_retweet_enabled: false
      }, { headers: typefullyHeaders })

      linkedinDraftId = linkedinScheduleResponse.data.id
      logger.info(`💼 LinkedIn scheduled: Draft ID ${linkedinDraftId}`)
    } catch (error) {
      logger.info(`💼 LinkedIn content ready (manual posting required): ${input.content.linkedin.post.substring(0, 100)}...`)
    }
  } else {
    logger.info(`💼 LinkedIn scheduling skipped by user`)
  }

  await emit({
    topic: 'content-complete',
    data: {
      ...input,
      scheduledAt: new Date().toISOString(),
      twitterDraftId,
      linkedinDraftId,
      schedulingPreferences: preferences
    }
  })
}
