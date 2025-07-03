# Content Writing Agent 🤖✍️

An AI-powered content writing agent built with [Motia](https://motia.dev) that automatically scrapes articles and generates viral social media content for Twitter and LinkedIn.

## 🚀 Features

- **Smart Article Scraping**: Extracts content from any web article using both static and dynamic scraping
- **AI-Powered Analysis**: Analyzes content for themes, sentiment, target audience, and viral potential
- **Multi-Platform Content Generation**: Creates optimized posts for both Twitter and LinkedIn
- **Event-Driven Architecture**: Built on Motia's robust event-driven workflow system
- **Real-time Processing**: Track your content generation pipeline in real-time
- **Webhook Integration**: Get notified when content generation is complete

## 🏗️ Architecture

The system uses Motia's event-driven architecture with the following flow:

```
API Request → Scrape Article → Analyze Content → Generate Twitter & LinkedIn Content → Aggregate Results
```

### Steps Overview

1. **Trigger Scraping** (API Step): Accepts article URLs via HTTP POST
2. **Scrape Article** (Event Step): Extracts content using Puppeteer and Cheerio
3. **Analyze Content** (Event Step): Uses OpenAI to analyze content and extract insights
4. **Generate Twitter Content** (Event Step): Creates viral Twitter posts
5. **Generate LinkedIn Content** (Event Step): Creates professional LinkedIn posts
6. **Aggregate Content** (Event Step): Combines all results and sends final output

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- Motia CLI installed (`npm install -g @motia/cli`)

### Installation

1. **Clone and navigate to the project**:
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
   
   Edit `.env` and add your configuration:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   MOTIA_PORT=3000
   # ... other optional settings
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open Motia Workbench**:
   Navigate to `http://localhost:3000` to see your workflow visualization

## 📡 API Usage

### Generate Content

**Endpoint**: `POST /api/generate-content`

**Request Body**:
```json
{
  "url": "https://example.com/article",
  "options": {
    "timeout": 30000,
    "waitForSelector": ".article-content"
  }
}
```

**Response**:
```json
{
  "message": "Content generation started",
  "requestId": "uuid-here",
  "url": "https://example.com/article",
  "estimatedProcessingTime": "2-3 minutes",
  "status": "processing",
  "steps": [
    "Scraping article content",
    "Analyzing content and audience", 
    "Generating Twitter content",
    "Generating LinkedIn content",
    "Finalizing results"
  ]
}
```

### Example cURL Request

```bash
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://techcrunch.com/2024/01/15/ai-breakthrough-article"
  }'
```

## 📊 Generated Content Structure

The system generates structured content for both platforms:

### Twitter Content
- Multiple tweet variations (3-5 tweets)
- Optimized hashtags
- Character count validation
- Engagement hooks
- Best posting times

### LinkedIn Content  
- Professional long-form posts (1500-3000 characters)
- Industry-focused insights
- Engagement questions
- Professional hashtags
- Call-to-action elements

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | - |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4` |
| `CONTENT_TEMPERATURE` | AI creativity level (0-1) | `0.7` |
| `MAX_TWEET_LENGTH` | Maximum tweet characters | `280` |
| `MAX_LINKEDIN_LENGTH` | Maximum LinkedIn post characters | `3000` |
| `REQUEST_TIMEOUT` | Scraping timeout (ms) | `30000` |
| `WEBHOOK_URL` | Optional webhook for results | - |

### Scraping Options

When making API requests, you can customize scraping behavior:

```json
{
  "url": "https://example.com/article",
  "options": {
    "timeout": 45000,
    "waitForSelector": ".main-content",
    "userAgent": "Custom User Agent"
  }
}
```

## 🎯 Use Cases

- **Content Marketers**: Quickly repurpose blog articles into social media content
- **Social Media Managers**: Generate platform-specific content from news articles
- **Bloggers**: Create promotional content for their articles
- **Agencies**: Scale content creation for multiple clients
- **News Organizations**: Automatically create social media posts from articles

## 🔍 Monitoring & Debugging

### Motia Workbench

The Motia Workbench provides real-time visualization of your content generation pipeline:

1. **Flow Visualization**: See the complete workflow as an interactive diagram
2. **Real-time Logs**: Monitor each step's execution and debug issues
3. **Event Tracking**: Follow events as they flow through the system
4. **Performance Metrics**: Track processing times and success rates

### Logging

The system provides detailed logging for each step:

```bash
# View logs in development
npm run dev

# Logs include:
# - Article scraping progress
# - Content analysis insights  
# - Generated content summaries
# - Processing times and metrics
```

## 🚨 Error Handling

The system includes comprehensive error handling:

- **Scraping Failures**: Automatic retry with fallback methods
- **AI API Errors**: Graceful degradation and error reporting
- **Invalid URLs**: Input validation and user-friendly error messages
- **Rate Limiting**: Built-in delays to respect API limits

## 🔗 Webhook Integration

Configure webhooks to receive notifications when content generation completes:

```env
WEBHOOK_URL=https://your-app.com/webhook
WEBHOOK_SECRET=your-secret-key
```

**Webhook Payload**:
```json
{
  "event": "content-generation-complete",
  "requestId": "uuid",
  "url": "original-article-url",
  "title": "Article Title",
  "content": {
    "twitter": { /* Twitter content */ },
    "linkedin": { /* LinkedIn content */ }
  },
  "metadata": {
    "totalProcessingTime": 45000,
    "completedAt": 1704067200000,
    "success": true
  }
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test with sample article
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d @examples/sample-request.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Motia Docs](https://motia.dev/docs)
- **Community**: [Motia Discord](https://discord.gg/nJFfsH5d6v)
- **Issues**: Create an issue in this repository

---

Built with ❤️ using [Motia](https://motia.dev) - The unified backend framework for APIs, Events, and AI Agents.

