import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'ContentReview',
  description: 'Stores generated content and provides review endpoint',
  subscribes: ['content-ready'],
  emits: ['content-stored'],
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

export const handler: Handlers['ContentReview'] = async (input, { emit, state, logger }) => {
  logger.info(`📋 Content ready for review: ${input.title}`)
  
  // Store the content data for later retrieval
  await state.set(`content-${input.requestId}`, input)
  
  logger.info(`\n🎉 Content Generated Successfully!`)
  logger.info(`📄 Article: ${input.title}`)
  logger.info(`🔗 URL: ${input.url}`)
  logger.info(`👥 Target: ${input.metadata.targetAudience}`)
  logger.info(`⏱️ Processing Time: ${input.metadata.processingTime}ms`)
  
  logger.info(`\n📱 Twitter Content:`)
  input.content.twitter.tweets.forEach((tweet: any, i: number) => {
    logger.info(`  ${i + 1}. ${tweet.text}`)
  })
  
  logger.info(`\n💼 LinkedIn Content:`)
  logger.info(`  ${input.content.linkedin.post.substring(0, 200)}...`)
  logger.info(`  (${input.content.linkedin.characterCount} characters)`)
  
  logger.info(`\n📅 To schedule posts, make a POST request to:`)
  logger.info(`   /schedule-content/${input.requestId}`)
  logger.info(`   Body: { "approve": true, "scheduleTwitter": true, "scheduleLinkedIn": true }`)
  
  await emit({
    topic: 'content-stored',
    data: {
      requestId: input.requestId,
      title: input.title,
      url: input.url,
      storedAt: new Date().toISOString()
    }
  })
}

