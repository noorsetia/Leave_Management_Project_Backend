// Simple compatibility wrapper — some scripts/commands may call server.js
// This file simply requires and starts the main application from index.js

try {
  require('./index');
} catch (err) {
  console.error('Failed to start server via server.js wrapper:', err.message);
  console.error(err.stack);
  process.exit(1);
}
