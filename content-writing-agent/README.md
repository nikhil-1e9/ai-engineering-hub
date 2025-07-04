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

Clean 4-step workflow:

```
API Request → Scrape with Firecrawl → Analyze & Strategy → Generate Content → Schedule Posts
```

### Steps Overview

1. **API Step**: Accepts article URLs via HTTP POST
2. **Scrape Step**: Extracts content using Firecrawl in markdown format
3. **Analyze Step**: Uses GPT-4o to analyze content and create content strategy
4. **Generate Step**: Creates Twitter and LinkedIn content based on strategy
5. **Schedule Step**: Schedules posts using Typefully API

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

### Generate & Schedule Content

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

### Example cURL Request

```bash
curl -X POST http://localhost:3000/generate-content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://techcrunch.com/2024/01/15/ai-breakthrough-article"}'
```

## 📊 Generated & Scheduled Content

The system creates developer-focused content optimized for each platform and automatically schedules them:

### Twitter Content
- Single tweets or threads (3-5 tweets)
- Technical insights and key takeaways
- Developer-relevant hashtags
- Engaging hooks for maximum reach
- **Scheduled 1 hour after generation**

### LinkedIn Content  
- Professional long-form posts (1000-2000 characters)
- Industry insights and analysis
- Call-to-action for engagement
- Professional networking hashtags
- **Scheduled 2 hours after generation**

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
🕷️ Scraping article: https://example.com/article
✅ Successfully scraped: "AI Breakthrough" (5,247 characters)
🧠 Analyzing content: AI Breakthrough
✅ Strategy created - Target: AI/ML practitioners and software engineers
✍️ Generating content for: AI Breakthrough
🎉 Content generated successfully!
📱 Twitter: 3 tweet(s)
💼 LinkedIn: 1,456 characters
📅 Scheduling posts for: AI Breakthrough
🐦 Twitter scheduled: Draft ID abc123
💼 LinkedIn scheduled: Draft ID def456
```

## 📁 Project Structure

```
content-writing-agent/
├── steps/
│   ├── api.step.ts          # HTTP API endpoint
│   ├── scrape.step.ts       # Firecrawl scraping
│   ├── analyze.step.ts      # Content analysis & strategy
│   ├── generate.step.ts     # Content generation
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

