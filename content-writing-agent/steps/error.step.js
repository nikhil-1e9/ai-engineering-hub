module.exports = {
  name: 'error',
  type: 'event',
  topic: 'processing-error',
  
  async execute({ data }) {
    console.error(`\n❌ Error in ${data.step} step:`);
    console.error(`🔗 URL: ${data.url}`);
    console.error(`📝 Error: ${data.error}`);
    console.error(`🆔 Request ID: ${data.requestId}\n`);
  }
};

