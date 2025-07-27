import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

 
import { Request, Response, NextFunction } from 'express';
// import morgan from 'morgan';

// Load environment variables
dotenv.config({ debug: false }); // Suppress dotenv logs

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use(express.static('public'));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyper-gro');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Api is running! fine' });
});


// Error handling middleware

 


// Import routes
import userRoutes from './routes/userRoutes';
import propertyRoutes from './routes/propertyRoutes';
// import dataImportRoutes from './routes/dataImportRoutes';

app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
// app.use('/api/data', dataImportRoutes);


// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
