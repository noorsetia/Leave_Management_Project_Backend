require('dotenv').config();

console.log('=== OAuth Configuration Debug ===\n');

console.log('GOOGLE OAuth:');
console.log('  CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('  CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('  CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('  CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('  CLIENT_ID not placeholder:', process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id');
console.log('  CLIENT_SECRET not placeholder:', process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret');
console.log('  All checks pass:', 
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET && 
  process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret'
);

console.log('\nGITHUB OAuth:');
console.log('  CLIENT_ID:', process.env.GITHUB_CLIENT_ID);
console.log('  CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET);
console.log('  All checks pass:', 
  process.env.GITHUB_CLIENT_ID && 
  process.env.GITHUB_CLIENT_SECRET && 
  process.env.GITHUB_CLIENT_ID !== 'your-github-client-id' &&
  process.env.GITHUB_CLIENT_SECRET !== 'your-github-client-secret'
);
