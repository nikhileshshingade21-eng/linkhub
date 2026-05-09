/**
 * LinkHub API server entry (used by tsx watch in dev)
 */
import app from '../app.js';
import { env } from './shared/config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`\n  🔗 LinkHub API running on port ${env.PORT}`);
  console.log(`  📦 Environment: ${env.NODE_ENV}`);
  console.log(`  🏥 Health: http://localhost:${env.PORT}/api/health\n`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received — shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
