#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Content Writing Agent Setup\n');
console.log('This script will help you configure your API keys.\n');

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

    console.log('Please provide your API keys:\n');

    // Get OpenAI API key
    const openaiKey = await askQuestion('OpenAI API Key (required): ');
    if (!openaiKey.trim()) {
      console.log('❌ OpenAI API Key is required. Setup cancelled.');
      rl.close();
      return;
    }

    // Get Firecrawl API key
    const firecrawlKey = await askQuestion('Firecrawl API Key (required): ');
    if (!firecrawlKey.trim()) {
      console.log('❌ Firecrawl API Key is required. Setup cancelled.');
      rl.close();
      return;
    }

    // Get optional port
    const port = await askQuestion('Motia Port (default: 3000): ') || '3000';

    // Create .env content
    const envContent = `# Required API Keys
OPENAI_API_KEY=${openaiKey}
FIRECRAWL_API_KEY=${firecrawlKey}

# Motia Configuration
MOTIA_PORT=${port}
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Configuration saved to .env file!');
    console.log('\nNext steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the development server: npm run dev');
    console.log('3. Open http://localhost:' + port + ' to view the Motia Workbench');
    console.log('\n📚 Check README.md for usage examples and API documentation.');
    console.log('\n🔗 Get your Firecrawl API key at: https://firecrawl.dev');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup();

