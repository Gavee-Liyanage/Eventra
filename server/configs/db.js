import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log('MongoDB connected successfully'));

    // use env var or fallback to local MongoDB
    const base = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const uri = base.endsWith('/fyndme') ? base : `${base}/fyndme`;

    // basic validation
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI. Must start with "mongodb://" or "mongodb+srv://".');
    }

    await mongoose.connect(uri);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    
  }    
};

export default connectDB;
