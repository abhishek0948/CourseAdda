import app from './app';
import config from './config';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   Internship LMS Server Started Successfully          ║
╠═══════════════════════════════════════════════════════╣
║   Environment: ${config.nodeEnv.padEnd(38)}║
║   Port: ${PORT.toString().padEnd(44)}║
║   URL: http://localhost:${PORT.toString().padEnd(29)}║
╠═══════════════════════════════════════════════════════╣
║   API Documentation:                                  ║
║   - Auth: /api/auth/*                                 ║
║   - Admin: /api/users/*                               ║
║   - Courses: /api/courses/*                           ║
║   - Student: /api/student/*                           ║
║   - Certificates: /api/certificates/*                 ║
║   - Health: /health                                   ║
╚═══════════════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default server;
