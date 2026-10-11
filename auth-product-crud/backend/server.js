require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Authentication & Product CRUD Backend Server`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Data Layer: In-Memory (Users, Products, Refresh Tokens)`);
  console.log(`===============================================`);
});

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection! Shutting down server gracefully...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception! Shutting down server gracefully...', err);
  process.exit(1);
});
