# Property Management API

A comprehensive Node.js/Express.js REST API for property management with user authentication, advanced search, caching, and favorite properties functionality.

## 🚀 Features

- **User Authentication** - JWT-based authentication with access and refresh tokens
- **Property Management** - CRUD operations for property listings
- **Advanced Search & Filtering** - Multi-parameter search with caching
- **Favorite Properties** - Users can add/remove properties to/from favorites
- **File Upload** - CSV bulk import for property data
- **Redis Caching** - Performance optimization with intelligent cache management
- **Data Validation** - Zod schema validation for type safety
- **TypeScript** - Full TypeScript support for enhanced development experience

## 📋 Table of Contents

- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints)
- [User Management](#user-management)
- [Property Management](#property-management)
- [Favorite Properties](#favorite-properties)
- [Advanced Features](#advanced-features)
- [Database Schema](#database-schema)
- [Contributing](#contributing)

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alicode43/assignemnt-SDE-Intern.git
   cd assignemnt-SDE-Intern
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/property-management

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
accessTokenExpiry=1d
refreshTokenExpiry=7d

# Redis Configuration
REDIS_HOST=your_redis_host
REDIS_PORT=18520
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password

# Server
PORT=3000
NODE_ENV=development
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api
```

## 👤 User Management

### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

## 🏠 Property Management

### Get All Properties
```http
GET /api/properties/
```

### Get Property by ID
```http
GET /api/properties/:id
```

### Create Property
```http
POST /api/properties/addProperty
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Beautiful Apartment",
  "description": "A beautiful 2-bedroom apartment",
  "type": "Apartment",
  "price": 150000,
  "state": "California",
  "city": "Los Angeles",
  "areaSqFt": 1200,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["parking", "gym", "pool"],
  "furnished": "Furnished",
  "listedBy": "Owner",
  "listingType": "sale",
  "location": "Downtown LA",
  "isAvailable": true
}
```

### Update Property
```http
PATCH /api/properties/update/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "price": 160000,
  "description": "Updated description"
}
```

### Delete Property
```http
DELETE /api/properties/:id
Authorization: Bearer <access_token>
```

### Get Properties by User
```http
GET /api/properties/user/:userId
```

## ⭐ Favorite Properties

### Add Property to Favorites
```http
POST /api/properties/:propertyId/favorite
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Property added to favorites successfully",
  "propertyId": "64f8b2c3d1e2f3a4b5c6d7e8",
  "propertyTitle": "Beautiful Apartment",
  "isFavorite": true
}
```

### Remove Property from Favorites
```http
DELETE /api/properties/:propertyId/favorite
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Property removed from favorites successfully",
  "propertyId": "64f8b2c3d1e2f3a4b5c6d7e8",
  "isFavorite": false
}
```

### Get User's Favorite Properties
```http
GET /api/properties/favorites/list?page=1&limit=10
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Favorite properties retrieved successfully",
  "data": {
    "favoriteProperties": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalFavorites": 25,
      "favoritesPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "cached": false
}
```

### Check Favorite Status
```http
GET /api/properties/:propertyId/favorite/status
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "propertyId": "64f8b2c3d1e2f3a4b5c6d7e8",
  "isFavorite": true
}
```

## 🔍 Advanced Search & Filtering

### Advanced Property Search
```http
GET /api/properties/search?search=apartment&type=Apartment&minPrice=100000&maxPrice=200000&bedrooms=2&state=California&city=Los%20Angeles&furnished=Furnished&listingType=sale&isAvailable=true&sortBy=price&sortOrder=asc&page=1&limit=20
```

### Available Search Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Text search across title, description, location |
| `type` | string/array | Property type (Apartment, Villa, Bungalow, Studio, Penthouse) |
| `listingType` | string/array | Listing type (rent, sale, lease) |
| `furnished` | string/array | Furnishing status (Furnished, Unfurnished, Semi) |
| `listedBy` | string/array | Listed by (Owner, Agent, Builder) |
| `state` | string/array | State/Province |
| `city` | string/array | City |
| `location` | string | Location search |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `minArea` | number | Minimum area in sq ft |
| `maxArea` | number | Maximum area in sq ft |
| `bedrooms` | number/array | Number of bedrooms |
| `bathrooms` | number/array | Number of bathrooms |
| `minRating` | number | Minimum rating |
| `maxRating` | number | Maximum rating |
| `isVerified` | boolean | Verification status |
| `isAvailable` | boolean | Availability status |
| `amenities` | string/array | Required amenities |
| `tags` | string/array | Property tags |
| `sortBy` | string | Sort field (createdAt, price, rating) |
| `sortOrder` | string | Sort order (asc, desc) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |

### Get Filter Options
```http
GET /api/properties/filter-options
```

Returns available filter values for dropdowns.

## 📁 Bulk Data Import

### Import Properties from CSV
```http
POST /api/properties/import
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- Key: "propertyData"
- Type: File
- Value: [CSV file]
```

### CSV Format Example:
```csv
title,description,type,price,state,city,areaSqFt,bedrooms,bathrooms,amenities,furnished,listedBy,listingType
"Beautiful Apartment","A stunning 2BR apartment","Apartment",150000,"CA","Los Angeles",1200,2,2,"parking|gym|pool","Furnished","Owner","sale"
```

## 🗄️ Database Schema

### User Schema
```typescript
{
  email: string,
  password: string (hashed),
  firstName: string,
  lastName: string,
  role: 'user' | 'admin',
  refreshToken: string,
  favoriteProperties: ObjectId[], // References to Property
  createdAt: Date,
  updatedAt: Date
}
```

### Property Schema
```typescript
{
  propertyId: string (auto-generated),
  title: string,
  description: string,
  type: 'Apartment' | 'Villa' | 'Bungalow' | 'Studio' | 'Penthouse',
  price: number,
  state: string,
  city: string,
  areaSqFt: number,
  bedrooms: number,
  bathrooms: number,
  amenities: string[],
  furnished: 'Furnished' | 'Unfurnished' | 'Semi',
  availableFrom: Date,
  listedBy: 'Owner' | 'Agent' | 'Builder',
  tags: string[],
  colorTheme: string,
  rating: number,
  isVerified: boolean,
  listingType: 'rent' | 'sale' | 'lease',
  location: string,
  images: string[],
  isAvailable: boolean,
  createdBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Performance Features

### Redis Caching
- **Search Results**: 5 minutes TTL
- **All Properties**: 10 minutes TTL
- **Filter Options**: 1 hour TTL
- **User Favorites**: 5 minutes TTL
- **Smart Cache Invalidation**: Automatic cache clearing on data updates

### Pagination
All list endpoints support pagination:
- Default: 20 items per page
- Customizable with `page` and `limit` parameters
- Response includes pagination metadata

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build project
npm run build

# Start production server
npm start

# Run tests
npm test

# Type checking
npm run type-check

# Lint code
npm run lint
```

## 📦 Dependencies

### Core Dependencies
- **Express.js**: Web framework
- **MongoDB & Mongoose**: Database and ODM
- **Redis**: Caching layer
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Multer**: File upload handling
- **Zod**: Data validation
- **TypeScript**: Type safety

### Development Dependencies
- **@types/node**: Node.js type definitions
- **@types/express**: Express type definitions
- **ts-node**: TypeScript execution
- **nodemon**: Development server auto-restart

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Zod schema validation
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error responses

## 📝 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": {...},
  "cached": false
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ali Code**
- GitHub: [@alicode43](https://github.com/alicode43)
- Repository: [assignemnt-SDE-Intern](https://github.com/alicode43/assignemnt-SDE-Intern)

## 🆘 Support

If you have any questions or run into issues, please open an issue on GitHub or contact the maintainer.

---


