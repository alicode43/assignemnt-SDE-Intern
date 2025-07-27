import { z } from 'zod';

// Define the property creation schema
export const createPropertySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),
  
  type: z.enum(['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse'], {
    message: 'Property type must be one of: Apartment, Villa, Bungalow, Studio, Penthouse'
  }),
  
  price: z.number()
    .positive('Price must be greater than 0')
    .max(100000000, 'Price cannot exceed 100 million'),
  
  state: z.string()
    .min(1, 'State is required')
    .max(100, 'State name too long')
    .trim(),
  
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City name too long')
    .trim(),
  
  areaSqFt: z.number()
    .positive('Area must be greater than 0')
    .max(100000, 'Area cannot exceed 100,000 sq ft')
    .optional(),
  
  bedrooms: z.number()
    .int('Bedrooms must be a whole number')
    .min(0, 'Bedrooms cannot be negative')
    .max(20, 'Bedrooms cannot exceed 20')
    .optional(),
  
  bathrooms: z.number()
    .int('Bathrooms must be a whole number')
    .min(0, 'Bathrooms cannot be negative')
    .max(20, 'Bathrooms cannot exceed 20')
    .optional(),
  
  amenities: z.array(z.string().trim())
    .max(50, 'Cannot have more than 50 amenities')
    .or(z.string().transform(val => val.split('|').map(item => item.trim())))
    .optional(),
  
  furnished: z.enum(['Furnished', 'Unfurnished', 'Semi'], {
    message: 'Furnished status must be one of: Furnished, Unfurnished, Semi'
  }),
  
  availableFrom: z.string()
    .datetime({ message: 'Invalid date format' })
    .or(z.date())
    .transform(val => new Date(val))
    .optional(),
  
  listedBy: z.enum(['Owner', 'Agent', 'Builder'], {
    message: 'Listed by must be one of: Owner, Agent, Builder'
  }),
  
  tags: z.array(z.string().trim())
    .max(20, 'Cannot have more than 20 tags')
    .or(z.string().transform(val => val.split('|').map(item => item.trim())))
    .optional(),
  
  colorTheme: z.string()
    .max(50, 'Color theme name too long')
    .trim()
    .optional(),
  
  rating: z.number()
    .min(0, 'Rating cannot be negative')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  
  isVerified: z.boolean()
    .default(false),
  
  listingType: z.enum(['rent', 'sale', 'lease'], {
    message: 'Listing type must be one of: rent, sale, lease'
  }),
  
  location: z.string()
    .max(200, 'Location description too long')
    .trim()
    .optional(),
  
  images: z.array(z.string().url('Invalid image URL'))
    .max(20, 'Cannot have more than 20 images')
    .optional(),
  
  isAvailable: z.boolean()
    .default(true)
});

// Define the property update schema (all fields optional except id)
export const updatePropertySchema = createPropertySchema.partial();

// Type inference from schema
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
