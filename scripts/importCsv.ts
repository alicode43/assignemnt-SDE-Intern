import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface PropertyData {
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-listing');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const importCsvData = async (filePath: string) => {
  const properties: PropertyData[] = [];

  return new Promise<PropertyData[]>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        properties.push({
          title: row.title,
          description: row.description,
          price: parseFloat(row.price),
          location: row.location,
          type: row.type,
          bedrooms: row.bedrooms ? parseInt(row.bedrooms) : undefined,
          bathrooms: row.bathrooms ? parseInt(row.bathrooms) : undefined,
          area: row.area ? parseFloat(row.area) : undefined,
        });
      })
      .on('end', () => {
        console.log(`Successfully parsed ${properties.length} records from CSV`);
        resolve(properties);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const main = async () => {
  try {
    await connectDB();
    
    const csvFilePath = process.argv[2];
    if (!csvFilePath) {
      console.error('Please provide a CSV file path as an argument');
      process.exit(1);
    }

    const properties = await importCsvData(csvFilePath);
    console.log('CSV import completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
};

main();
