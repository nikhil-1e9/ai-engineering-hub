#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Content Writing Agent Setup\n');
console.log('This script will help you configure your environment variables.\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setup() {
  try {
    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await askQuestion('.env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('Please provide the following configuration:\n');

    // Get OpenAI API key
    const openaiKey = await askQuestion('OpenAI API Key (required): ');
    if (!openaiKey.trim()) {
      console.log('❌ OpenAI API Key is required. Setup cancelled.');
      rl.close();
      return;
    }

    // Get optional configurations
    const model = await askQuestion('OpenAI Model (default: gpt-4): ') || 'gpt-4';
    const temperature = await askQuestion('Content Temperature 0-1 (default: 0.7): ') || '0.7';
    const port = await askQuestion('Motia Port (default: 3000): ') || '3000';
    const webhookUrl = await askQuestion('Webhook URL (optional): ');

    // Create .env content
    const envContent = `# OpenAI API Configuration
OPENAI_API_KEY=${openaiKey}
OPENAI_MODEL=${model}

# Web Scraping Configuration
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
REQUEST_TIMEOUT=30000
MAX_RETRIES=3

# Content Generation Settings
MAX_TWEET_LENGTH=280
MAX_LINKEDIN_LENGTH=3000
CONTENT_TEMPERATURE=${temperature}

# Rate Limiting
SCRAPING_DELAY_MS=1000
AI_REQUEST_DELAY_MS=500

# Motia Configuration
MOTIA_PORT=${port}
MOTIA_ENV=development

# Optional: Webhook for results
${webhookUrl ? `WEBHOOK_URL=${webhookUrl}` : '# WEBHOOK_URL='}
# WEBHOOK_SECRET=
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Configuration saved to .env file!');
    console.log('\nNext steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the development server: npm run dev');
    console.log('3. Open http://localhost:' + port + ' to view the Motia Workbench');
    console.log('\n📚 Check README.md for usage examples and API documentation.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup();

