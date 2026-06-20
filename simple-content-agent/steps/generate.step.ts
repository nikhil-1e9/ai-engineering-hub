import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import { join } from 'path'

const config = require('../config')

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
})

export const config: EventConfig = {
  type: 'event',
  name: 'GenerateContent',
  description: 'Generates Twitter and LinkedIn content in parallel using OpenAI',
  subscribes: ['generate-content'],
  emits: ['schedule-content'],
  input: z.object({
    requestId: z.string(),
    url: z.string().url(),
    title: z.string(),
    content: z.string(),
    timestamp: z.number()
  }),
  flows: ['simple-content-generation']
}

export const handler: Handlers['GenerateContent'] = async (input, { emit, logger }) => {
  logger.info(`✍️ Generating content for: ${input.title}`)

  try {
    // Read prompt templates
    const twitterPromptTemplate = readFileSync(join(__dirname, '../prompts/twitter-prompt.txt'), 'utf-8')
    const linkedinPromptTemplate = readFileSync(join(__dirname, '../prompts/linkedin-prompt.txt'), 'utf-8')

    // Replace placeholders in prompts
    const twitterPrompt = twitterPromptTemplate
      .replace('{{title}}', input.title)
      .replace('{{content}}', input.content)

    const linkedinPrompt = linkedinPromptTemplate
      .replace('{{title}}', input.title)
      .replace('{{content}}', input.content)

    // Make parallel OpenAI calls
    logger.info(`🔄 Making parallel OpenAI calls for Twitter and LinkedIn content...`)
    
    const [twitterResponse, linkedinResponse] = await Promise.all([
      // Twitter content generation
      openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: twitterPrompt }],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
      
      // LinkedIn content generation
      openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: linkedinPrompt }],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      })
    ])

    const twitterContent = JSON.parse(twitterResponse.choices[0].message.content)
    const linkedinContent = JSON.parse(linkedinResponse.choices[0].message.content)

    logger.info(`🎉 Content generated successfully!`)
    logger.info(`📱 Twitter: ${twitterContent.totalTweets} tweet(s) in thread`)
    logger.info(`💼 LinkedIn: ${linkedinContent.characterCount} characters`)

    await emit({
      topic: 'schedule-content',
      data: {
        requestId: input.requestId,
        url: input.url,
        title: input.title,
        content: {
          twitter: twitterContent,
          linkedin: linkedinContent
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - input.timestamp,
          originalUrl: input.url
        }
      }
    })

  } catch (error) {
    logger.error(`❌ Content generation failed: ${error.message}`)
    throw error
  }
}

