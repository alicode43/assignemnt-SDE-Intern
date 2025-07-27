import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  refreshToken: string;
  favoriteProperties: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  addToFavorites(propertyId: string): Promise<IUser>;
  removeFromFavorites(propertyId: string): Promise<IUser>;
  isFavorite(propertyId: string): boolean;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  refreshToken: {
    type: String,
  },
  favoriteProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Generate access token method
UserSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      _id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET || 'hamar_secret_key',
    {
      expiresIn: process.env.accessTokenExpiry || '1d'
    } as jwt.SignOptions
  );
};

// Generate refresh token method
UserSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { 
      _id: this._id,
   
    },
    process.env.REFRESH_TOKEN_SECRET || 'hamar_secret_key',
    {
      expiresIn: process.env.refreshTokenExpiry || '7d'
    } as jwt.SignOptions
  );
};

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add property to favorites
UserSchema.methods.addToFavorites = async function(propertyId: string): Promise<IUser> {
  const propertyObjectId = new mongoose.Types.ObjectId(propertyId);
  
  if (!this.favoriteProperties.includes(propertyObjectId)) {
    this.favoriteProperties.push(propertyObjectId);
    await this.save();
  }
  
  return this as IUser;
};

// Remove property from favorites
UserSchema.methods.removeFromFavorites = async function(propertyId: string): Promise<IUser> {
  const propertyObjectId = new mongoose.Types.ObjectId(propertyId);
  
  this.favoriteProperties = this.favoriteProperties.filter(
    (id: mongoose.Types.ObjectId) => !id.equals(propertyObjectId)
  );
  
  await this.save();
  return this as IUser;
};

// Check if property is in favorites
UserSchema.methods.isFavorite = function(propertyId: string): boolean {
  const propertyObjectId = new mongoose.Types.ObjectId(propertyId);
  
  return this.favoriteProperties.some(
    (id: mongoose.Types.ObjectId) => id.equals(propertyObjectId)
  );
};
 
export default mongoose.model<IUser>('User', UserSchema);
