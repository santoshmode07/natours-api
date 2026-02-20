const mongoose = require('mongoose');

let connectPromise;

const getDatabaseUri = () => {
  if (!process.env.DATABASE) {
    throw new Error('DATABASE environment variable is not set!');
  }

  return process.env.DATABASE.replace(
    '<db_password>',
    process.env.DATABASE_PASSWORD || '',
  );
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectPromise) return connectPromise;

  connectPromise = mongoose.connect(getDatabaseUri(), {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await connectPromise;
    return mongoose.connection;
  } finally {
    connectPromise = null;
  }
};

module.exports = connectDB;
