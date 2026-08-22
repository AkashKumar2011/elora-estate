const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env and configure it.');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);
    console.log(`[db] connected → ${mongoose.connection.name}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });
}

module.exports = connectDB;
