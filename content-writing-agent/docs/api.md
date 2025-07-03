# API Documentation

## Overview

The Content Writing Agent exposes a REST API for generating social media content from web articles. The API follows RESTful principles and returns JSON responses.

## Base URL

```
http://localhost:3000  # Development
```

## Authentication

Currently, no authentication is required for the API endpoints. In production, consider implementing API key authentication.

## Endpoints

### Generate Content

Generate viral social media content from a web article.

**Endpoint**: `POST /api/generate-content`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "url": "string (required)",
  "options": {
    "timeout": "number (optional, default: 30000)",
    "waitForSelector": "string (optional)",
    "userAgent": "string (optional)"
  }
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | The URL of the article to process |
| `options.timeout` | number | No | Scraping timeout in milliseconds (default: 30000) |
| `options.waitForSelector` | string | No | CSS selector to wait for before scraping |
| `options.userAgent` | string | No | Custom user agent for scraping |

**Response**:

**Success (202 Accepted)**:
```json
{
  "message": "Content generation started",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
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

**Error Responses**:

**400 Bad Request** - Invalid input:
```json
{
  "error": "Missing required field: url",
  "message": "Please provide a valid article URL to process"
}
```

**400 Bad Request** - Invalid URL:
```json
{
  "error": "Invalid URL format",
  "message": "Please provide a valid HTTP or HTTPS URL"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "message": "Failed to start content generation process",
  "details": "Error details (development only)"
}
```

## Example Requests

### Basic Request

```bash
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://techcrunch.com/2024/01/15/ai-breakthrough"
  }'
```

### Request with Options

```bash
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://medium.com/@author/article-title",
    "options": {
      "timeout": 45000,
      "waitForSelector": ".post-content",
      "userAgent": "ContentBot/1.0"
    }
  }'
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

async function generateContent(articleUrl) {
  try {
    const response = await axios.post('http://localhost:3000/api/generate-content', {
      url: articleUrl,
      options: {
        timeout: 30000
      }
    });
    
    console.log('Content generation started:', response.data);
    return response.data.requestId;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usage
generateContent('https://example.com/article');
```

### Python Example

```python
import requests
import json

def generate_content(article_url):
    url = "http://localhost:3000/api/generate-content"
    payload = {
        "url": article_url,
        "options": {
            "timeout": 30000
        }
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        print(f"Content generation started: {result['requestId']}")
        return result['requestId']
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

# Usage
generate_content("https://example.com/article")
```

## Webhook Integration

If you configure a webhook URL, you'll receive notifications when content generation completes.

**Webhook Payload**:
```json
{
  "event": "content-generation-complete",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://example.com/article",
  "title": "Article Title",
  "content": {
    "twitter": {
      "tweets": [
        {
          "text": "🚀 Just discovered this amazing insight about AI...",
          "hashtags": ["#AI", "#Technology", "#Innovation"],
          "characterCount": 245,
          "type": "single",
          "engagementHook": "Surprising statistic"
        }
      ],
      "engagementHooks": ["Question hook", "Stat hook", "Opinion hook"],
      "trendingHashtags": ["#AI", "#Tech"],
      "bestPostingTimes": ["9-10 AM EST", "7-8 PM EST"]
    },
    "linkedin": {
      "post": "The future of AI is here, and it's transforming how we work...",
      "headline": "The future of AI is here",
      "hashtags": ["#ArtificialIntelligence", "#Technology", "#Innovation"],
      "characterCount": 1847,
      "callToAction": "What's your experience with AI in your industry?",
      "professionalTone": true,
      "industryFocus": ["Technology", "Business"],
      "keyTakeaways": ["AI adoption is accelerating", "New opportunities emerging"]
    }
  },
  "metadata": {
    "totalProcessingTime": 45000,
    "completedAt": 1704067200000,
    "success": true,
    "errors": []
  },
  "timestamp": 1704067200000
}
```

## Rate Limits

Currently, no rate limits are enforced. However, the system includes built-in delays to respect external API limits:

- **Web Scraping**: 1 second delay between requests
- **AI API Calls**: 500ms delay between requests

## Error Handling

The API includes comprehensive error handling:

1. **Input Validation**: All inputs are validated before processing
2. **URL Validation**: URLs are checked for proper format and supported protocols
3. **Timeout Handling**: Requests that take too long are automatically terminated
4. **Graceful Degradation**: Partial failures don't break the entire pipeline

## Status Codes

| Code | Description |
|------|-------------|
| 202 | Accepted - Content generation started successfully |
| 400 | Bad Request - Invalid input or malformed request |
| 500 | Internal Server Error - Server-side processing error |

## Content Structure

### Twitter Content Structure

```json
{
  "tweets": [
    {
      "text": "Tweet content",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "characterCount": 245,
      "type": "single",
      "engagementHook": "What makes this engaging"
    }
  ],
  "engagementHooks": ["hook1", "hook2"],
  "trendingHashtags": ["#trending1", "#trending2"],
  "bestPostingTimes": ["9-10 AM EST", "7-8 PM EST"]
}
```

### LinkedIn Content Structure

```json
{
  "post": "Full LinkedIn post content",
  "headline": "Compelling first line",
  "hashtags": ["#professional1", "#professional2"],
  "characterCount": 1847,
  "callToAction": "Engagement question",
  "professionalTone": true,
  "industryFocus": ["Technology", "Business"],
  "keyTakeaways": ["takeaway1", "takeaway2"]
}
```

## Troubleshooting

### Common Issues

1. **"Invalid URL format"**: Ensure the URL includes `http://` or `https://`
2. **"Failed to extract content"**: The article might be behind a paywall or require JavaScript
3. **"OpenAI API error"**: Check your API key and rate limits
4. **Timeout errors**: Try increasing the timeout value in options

### Debug Mode

Set `NODE_ENV=development` to get detailed error messages in API responses.

### Logs

Monitor the console output when running `npm run dev` to see detailed processing logs.

