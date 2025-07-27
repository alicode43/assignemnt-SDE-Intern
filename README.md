# Property Listing Backend

A Node.js/Express.js backend application for managing property listings with TypeScript, MongoDB, and Redis caching.

## Features

- Property CRUD operations
- User authentication with JWT
- CSV data import functionality
- Redis caching for improved performance
- MongoDB for data persistence
- TypeScript for type safety

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the provided example and configure your environment variables

4. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build the TypeScript code
- `npm start` - Start the production server
- `npm run import-csv` - Import property data from CSV file

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Project Structure

```
src/
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/         # Mongoose models
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # Utility functions
└── index.ts        # Application entry point
scripts/
└── importCsv.ts    # CSV import script
```

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `REDIS_URL` - Redis connection URL
