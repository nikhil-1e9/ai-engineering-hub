# Content Writing Agent 🤖✍️

An AI-powered content writing agent built with [Motia](https://motia.dev) that automatically scrapes developer-focused articles and generates viral social media content for Twitter and LinkedIn.

## 🚀 Features

- **Smart Article Scraping**: Uses Firecrawl to extract clean markdown content from any web article
- **AI-Powered Strategy**: Analyzes content with GPT-4o to create targeted content strategies
- **Developer-Focused**: Optimized for software engineering, AI/ML, and tech content
- **Multi-Platform Generation**: Creates platform-specific content for Twitter and LinkedIn
- **Event-Driven Architecture**: Built on Motia's robust workflow system
- **Real-time Processing**: Track your content generation pipeline in the Motia Workbench

## 🏗️ Architecture

Simple 3-step workflow:

```
API Request → Scrape with Firecrawl → Analyze & Strategy → Generate Content
```

### Steps Overview

1. **API Step**: Accepts article URLs via HTTP POST
2. **Scrape Step**: Extracts content using Firecrawl in markdown format
3. **Analyze Step**: Uses GPT-4o to analyze content and create content strategy
4. **Generate Step**: Creates Twitter and LinkedIn content based on strategy

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- OpenAI API key
- Firecrawl API key (get one at [firecrawl.dev](https://firecrawl.dev))

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
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   FIRECRAWL_API_KEY=your_firecrawl_api_key_here
   MOTIA_PORT=3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open Motia Workbench**:
   Navigate to `http://localhost:3000` to see your workflow visualization

## 📡 API Usage

### Generate Content

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

## 📊 Generated Content

The system creates developer-focused content optimized for each platform:

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
```

## 🚨 Error Handling

The system includes comprehensive error handling:
- Invalid URL validation
- Firecrawl scraping failures
- OpenAI API errors
- Graceful error reporting and logging

## 🧪 Testing

```bash
# Test with a developer-focused article
curl -X POST http://localhost:3000/generate-content \
  -H "Content-Type: application/json" \
  -d '{"url": "https://blog.openai.com/gpt-4"}'
```

## 📁 Project Structure

```
content-writing-agent/
├── steps/
│   ├── api.step.js          # HTTP API endpoint
│   ├── scrape.step.js       # Firecrawl scraping
│   ├── analyze.step.js      # Content analysis & strategy
│   ├── generate.step.js     # Content generation
│   ├── complete.step.js     # Success logging
│   └── error.step.js        # Error handling
├── types/events.ts          # TypeScript event definitions
├── config/index.js          # Simple configuration
├── package.json
├── .env.example
└── README.md
```

## 🔧 Configuration

Minimal configuration required:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `FIRECRAWL_API_KEY` | Firecrawl API key | ✅ |
| `MOTIA_PORT` | Server port | ❌ (default: 3000) |

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
3. Set up your API keys in `.env`
4. Start the server: `npm run dev`
5. Open `http://localhost:3000` to see the Motia Workbench
6. Send a POST request to `/generate-content` with an article URL

That's it! The system will automatically scrape, analyze, and generate developer-focused social media content.

## 📄 License

MIT License

---

Built with ❤️ using [Motia](https://motia.dev) - The unified backend framework for APIs, Events, and AI Agents.

