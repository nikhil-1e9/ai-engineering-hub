# Content Writing Agent 🤖✍️

An AI-powered content writing agent built with [Motia](https://motia.dev) that automatically scrapes developer-focused articles, generates viral social media content, and schedules posts using Typefully.

## 🚀 Features

- **Smart Article Scraping**: Uses Firecrawl to extract clean markdown content from any web article
- **AI-Powered Strategy**: Analyzes content with GPT-4o to create targeted content strategies
- **Developer-Focused**: Optimized for software engineering, AI/ML, and tech content
- **Multi-Platform Generation**: Creates platform-specific content for Twitter and LinkedIn
- **Automated Scheduling**: Schedules posts using Typefully API
- **Event-Driven Architecture**: Built on Motia's robust workflow system with TypeScript
- **Real-time Processing**: Track your content generation pipeline in the Motia Workbench

## 🏗️ Architecture

Clean 2-phase workflow with user control:

```
Phase 1: API Request → Scrape → Analyze → Generate → Store for Review
Phase 2: Review Content → Approve/Schedule → Typefully Integration
```

### Steps Overview

1. **API Step**: Accepts article URLs via HTTP POST
2. **Scrape Step**: Extracts content using Firecrawl in markdown format
3. **Analyze Step**: Uses GPT-4o to analyze content and create content strategy
4. **Generate Step**: Creates Twitter and LinkedIn content based on strategy
5. **Review Step**: Stores content and provides review endpoints
6. **Schedule API**: Allows user to approve and schedule posts
7. **Schedule Step**: Schedules approved posts using Typefully API

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- OpenAI API key
- Firecrawl API key (get one at [firecrawl.dev](https://firecrawl.dev))
- Typefully API key (get one at [typefully.com/api](https://typefully.com/api))

### Installation

1. **Navigate to the project**:
   ```bash
   cd content-writing-agent
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   npm run setup
   ```
   
   Or manually create `.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   FIRECRAWL_API_KEY=your_firecrawl_api_key_here
   TYPEFULLY_API_KEY=your_typefully_api_key_here
   MOTIA_PORT=3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open Motia Workbench**:
   Navigate to `http://localhost:3000` to see your workflow visualization

## 📡 API Usage

### Phase 1: Generate Content

**Endpoint**: `POST /generate-content`

**Request Body**:
```json
{
  "url": "https://example.com/article"
}
```

**Response**:
```json
{
  "message": "Content generation started",
  "requestId": "uuid-here",
  "url": "https://example.com/article",
  "status": "processing"
}
```

### Phase 2: Review Generated Content

**Endpoint**: `GET /content/:requestId`

**Response**:
```json
{
  "requestId": "uuid-here",
  "title": "Article Title",
  "url": "https://example.com/article",
  "content": {
    "twitter": {
      "tweets": [{"text": "Tweet content...", "order": 1}],
      "totalTweets": 3
    },
    "linkedin": {
      "post": "LinkedIn post content...",
      "characterCount": 1456
    }
  },
  "schedulingEndpoint": "/schedule-content/uuid-here"
}
```

### Phase 3: Schedule Posts

**Endpoint**: `POST /schedule-content/:requestId`

**Request Body**:
```json
{
  "approve": true,
  "scheduleTwitter": true,
  "scheduleLinkedIn": true,
  "twitterScheduleTime": "2024-01-15T15:00:00Z",
  "linkedinScheduleTime": "2024-01-15T17:00:00Z"
}
```

**Response**:
```json
{
  "message": "Content scheduling initiated",
  "requestId": "uuid-here",
  "scheduled": {
    "twitter": true,
    "linkedin": true
  }
}
```

### Example Workflow

```bash
# 1. Generate content
curl -X POST http://localhost:3000/generate-content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://techcrunch.com/2024/01/15/ai-breakthrough-article"}'

# 2. Review generated content (use requestId from step 1)
curl -X GET http://localhost:3000/content/your-request-id

# 3. Schedule posts (approve and customize timing)
curl -X POST http://localhost:3000/schedule-content/your-request-id \
  -H "Content-Type: application/json" \
  -d '{"approve": true, "scheduleTwitter": true, "scheduleLinkedIn": true}'
```

## 📊 Generated Content & User Control

The system creates developer-focused content optimized for each platform with full user control over scheduling:

### Twitter Content
- Single tweets or threads (3-5 tweets)
- Technical insights and key takeaways
- Developer-relevant hashtags
- Engaging hooks for maximum reach

### LinkedIn Content  
- Professional long-form posts (1000-2000 characters)
- Industry insights and analysis
- Call-to-action for engagement
- Professional networking hashtags

### Scheduling Control
- **Review before scheduling**: All content is generated and stored for review
- **Selective scheduling**: Choose to schedule Twitter, LinkedIn, or both
- **Custom timing**: Set specific schedule times or use defaults (1hr for Twitter, 2hr for LinkedIn)
- **Draft management**: All posts created as drafts in Typefully for final review

## 🎯 Target Audience

Optimized for content that resonates with:
- Software Engineers (Frontend, Backend, Full-stack)
- AI/ML Practitioners and Researchers
- DevOps and Infrastructure Engineers
- Tech Leaders and Engineering Managers
- Developer Tool Creators

## 🔍 Monitoring

### Motia Workbench

The Motia Workbench provides real-time visualization:

1. **Flow Visualization**: See the complete workflow as an interactive diagram
2. **Real-time Logs**: Monitor each step's execution
3. **Event Tracking**: Follow events as they flow through the system

### Console Logs

The system provides detailed logging:

```bash
# Phase 1: Content Generation
🕷️ Scraping article: https://example.com/article
✅ Successfully scraped: "AI Breakthrough" (5,247 characters)
🧠 Analyzing content: AI Breakthrough
✅ Strategy created - Target: AI/ML practitioners and software engineers
✍️ Generating content for: AI Breakthrough
🎉 Content generated successfully!
📱 Twitter: 3 tweet(s)
💼 LinkedIn: 1,456 characters
📋 Content ready for review: AI Breakthrough

📅 To schedule posts, make a POST request to:
   /schedule-content/your-request-id

# Phase 2: User Approval & Scheduling
✅ User approved scheduling for request abc-123
📅 Scheduling posts for: AI Breakthrough
🐦 Twitter scheduled: Draft ID abc123
💼 LinkedIn scheduled: Draft ID def456
```

## 📁 Project Structure

```
content-writing-agent/
├── steps/
│   ├── api.step.ts          # HTTP endpoint for content generation
│   ├── scrape.step.ts       # Firecrawl scraping
│   ├── analyze.step.ts      # Content analysis & strategy
│   ├── generate.step.ts     # Content generation
│   ├── review.step.ts       # Content storage for review
│   ├── get-content.step.ts  # API endpoint to retrieve content
│   ├── schedule-api.step.ts # API endpoint for scheduling control
│   ├── schedule.step.ts     # Typefully scheduling
│   └── complete.step.ts     # Success logging
├── prompts/
│   ├── analyze-content.txt  # Content analysis prompt
│   ├── generate-twitter.txt # Twitter generation prompt
│   └── generate-linkedin.txt# LinkedIn generation prompt
├── types/events.ts          # TypeScript event definitions
├── config/index.js          # Configuration
├── tsconfig.json           # TypeScript configuration
├── package.json
├── .env.example
└── README.md
```

## 🔧 Configuration

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `FIRECRAWL_API_KEY` | Firecrawl API key | ✅ |
| `TYPEFULLY_API_KEY` | Typefully API key | ✅ |
| `MOTIA_PORT` | Server port | ❌ (default: 3000) |

## 📝 Customizing Prompts

The system uses separate text files for prompts, making them easy to modify:

- `prompts/analyze-content.txt` - Content analysis and strategy creation
- `prompts/generate-twitter.txt` - Twitter content generation
- `prompts/generate-linkedin.txt` - LinkedIn content generation

Simply edit these files to customize the AI behavior without touching the code.

## 📅 Scheduling Behavior

- **Twitter posts**: Scheduled 1 hour after generation
- **LinkedIn posts**: Scheduled 2 hours after generation
- **Draft management**: All posts are created as drafts in Typefully
- **Manual control**: You can modify or publish drafts manually in Typefully

## 🎯 Use Cases

Perfect for:
- **Developer Advocates** creating content from technical articles
- **Engineering Teams** sharing insights from industry articles
- **Tech Content Creators** repurposing blog posts for social media
- **Developer Relations** teams scaling content creation
- **Tech Companies** automating social media from their blog posts

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your API keys: `npm run setup`
4. Start the server: `npm run dev`
5. Open `http://localhost:3000` to see the Motia Workbench
6. Send a POST request to `/generate-content` with an article URL

The system will automatically scrape, analyze, generate, and schedule developer-focused social media content!

## 🧪 Example Flow

```bash
# 1. Generate content
curl -X POST http://localhost:3000/generate-content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://blog.openai.com/gpt-4"}'

# 2. Check Motia Workbench at http://localhost:3000
# 3. View scheduled posts in your Typefully dashboard
# 4. Modify or publish drafts as needed
```

## 📄 License

MIT License

---

Built with ❤️ using [Motia](https://motia.dev) - The unified backend framework for APIs, Events, and AI Agents.
