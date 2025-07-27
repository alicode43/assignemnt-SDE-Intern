import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  propertyId: string;
  title: string;
  description?: string;
  type: 'Apartment' | 'Villa' | 'Bungalow' | 'Studio' | 'Penthouse';
  price: number;
  state: string;
  city: string;
  areaSqFt?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  furnished: 'Furnished' | 'Unfurnished' | 'Semi';
  availableFrom?: Date;
  listedBy: 'Owner' | 'Agent' | 'Builder';
  tags?: string[];
  colorTheme?: string;
  rating?: number;
  isVerified: boolean;
  listingType: 'rent' | 'sale' | 'lease';
  location?: string;
  images?: string[];
  isAvailable: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema({
  propertyId: {
    type: String,
    unique: true,
 
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  areaSqFt: {
    type: Number,
    min: 0
  },
  bedrooms: {
    type: Number,
    min: 0
  },
  bathrooms: {
    type: Number,
    min: 0
  },
  amenities: [{
    type: String,
    trim: true
  }],
  furnished: {
    type: String,
    enum: ['Furnished', 'Unfurnished', 'Semi'],
    required: true
  },
  availableFrom: {
    type: Date
  },
  listedBy: {
    type: String,
    enum: ['Owner', 'Agent', 'Builder'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  colorTheme: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  listingType: {
    type: String,
    enum: ['rent', 'sale', 'lease'],
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate property ID
PropertySchema.pre('save', async function(next) {
  if (!this.propertyId) {
    try {
      const Property = this.constructor as mongoose.Model<any>;
      // Find last property, sort by descending propertyId
      const lastProperty = await Property.findOne(
        { propertyId: { $regex: /^PROP\d{4,}$/ } }, // match e.g. PROP0001
        { propertyId: 1 },
        { sort: { propertyId: -1 } }
      ).lean() as { propertyId?: string } | null;
      
      let nextNumber = 1;
      if (lastProperty && lastProperty.propertyId) {
        const match = lastProperty.propertyId.match(/^PROP(\d{4,})$/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      // Pad with zeros to 4 digits
      this.propertyId = `PROP${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      // Fallback: pad the timestamp
      const fallbackNumber = Date.now() % 10000;
      this.propertyId = `PROP${fallbackNumber.toString().padStart(4, '0')}`;
    }
  }
  next();
});


// Add indexes for better query performance
// Note: propertyId already has an index due to unique: true
PropertySchema.index({ state: 1 });
PropertySchema.index({ city: 1 });
PropertySchema.index({ type: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ isAvailable: 1 });
PropertySchema.index({ isVerified: 1 });
PropertySchema.index({ listingType: 1 });
PropertySchema.index({ furnished: 1 });
PropertySchema.index({ listedBy: 1 });
PropertySchema.index({ bedrooms: 1 });
PropertySchema.index({ bathrooms: 1 });
PropertySchema.index({ rating: 1 });
PropertySchema.index({ availableFrom: 1 });
PropertySchema.index({ location: 1 });

export default mongoose.model<IProperty>('Property', PropertySchema);
