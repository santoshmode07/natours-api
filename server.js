const path = require('path');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: path.join(__dirname, 'config.env') });

const mongoose = require('mongoose');

// Disable buffering globally to catch connection errors immediately
mongoose.set('bufferCommands', false);

const app = require('./app');

if (!process.env.DATABASE) {
  console.log('DATABASE environment variable is not set!');
  process.exit(1);
}

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

let server;

mongoose
  .connect(DB, {
    serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of buffering indefinitely
  })
  .then(() => {
    console.log('DB connection successful!');
    // Server port setup after successful DB connection
    const port = process.env.PORT || 3000;
    server = app.listen(port, () => {
      console.log(`App running on port ${port}...`);
    });
  })
  .catch((err) => {
    console.log('DB connection error:', err.message);
    process.exit(1);
  });

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  } else {
    process.exit(0);
  }
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
