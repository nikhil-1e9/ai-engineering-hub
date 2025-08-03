import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'ContentComplete',
  description: 'Logs completion of content generation and scheduling',
  subscribes: ['content-complete'],
  emits: [],
  input: z.object({
    requestId: z.string(),
    url: z.string().url(),
    title: z.string(),
    content: z.object({
      twitter: z.any(),
      linkedin: z.any()
    }),
    metadata: z.any(),
    scheduledAt: z.string(),
    twitterDraftId: z.string().optional(),
    linkedinDraftId: z.string().optional(),
    schedulingPreferences: z.any().optional()
  }),
  flows: ['content-generation']
}

export const handler: Handlers['ContentComplete'] = async (input, { logger }) => {
  logger.info(`\n🎉 Content Generation & Scheduling Complete!`)
  logger.info(`📄 Article: ${input.title}`)
  logger.info(`🔗 URL: ${input.url}`)
  logger.info(`👥 Target: ${input.metadata.targetAudience}`)
  logger.info(`⏱️ Processing Time: ${input.metadata.processingTime}ms`)
  logger.info(`📅 Scheduled At: ${input.scheduledAt}`)
  
  const prefs = input.schedulingPreferences
  if (prefs) {
    logger.info(`\n📋 Scheduling Preferences:`)
    logger.info(`  🐦 Twitter: ${prefs.scheduleTwitter ? 'Scheduled' : 'Skipped'}`)
    logger.info(`  💼 LinkedIn: ${prefs.scheduleLinkedIn ? 'Scheduled' : 'Skipped'}`)
  }
  
  if (input.twitterDraftId) {
    logger.info(`🐦 Twitter Draft ID: ${input.twitterDraftId}`)
  }
  
  if (input.linkedinDraftId) {
    logger.info(`💼 LinkedIn Draft ID: ${input.linkedinDraftId}`)
  }
  
  logger.info(`\n📱 Twitter Content:`)
  input.content.twitter.tweets.forEach((tweet: any, i: number) => {
    logger.info(`  ${i + 1}. ${tweet.text}`)
  })
  
  logger.info(`\n💼 LinkedIn Content:`)
  logger.info(`  ${input.content.linkedin.post.substring(0, 100)}...`)
  logger.info(`  (${input.content.linkedin.characterCount} characters)`)
  
  logger.info(`\n✅ Request ${input.requestId} completed successfully!\n`)
}
