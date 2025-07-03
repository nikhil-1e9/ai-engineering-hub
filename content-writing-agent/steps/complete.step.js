module.exports = {
  name: 'complete',
  type: 'event',
  topic: 'content-complete',
  
  async execute({ data }) {
    console.log(`\n🎉 Content Generation Complete!`);
    console.log(`📄 Article: ${data.title}`);
    console.log(`🔗 URL: ${data.url}`);
    console.log(`👥 Target: ${data.metadata.targetAudience}`);
    console.log(`⏱️ Processing Time: ${data.metadata.processingTime}ms`);
    console.log(`\n📱 Twitter Content:`);
    data.content.twitter.tweets.forEach((tweet, i) => {
      console.log(`  ${i + 1}. ${tweet.text}`);
    });
    console.log(`\n💼 LinkedIn Content:`);
    console.log(`  ${data.content.linkedin.post.substring(0, 100)}...`);
    console.log(`  (${data.content.linkedin.characterCount} characters)`);
    console.log(`\n✅ Request ${data.requestId} completed successfully!\n`);
  }
};

