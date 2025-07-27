import { Request, Response } from 'express';
import Property from '../models/Property';

import { createPropertySchema, updatePropertySchema } from '../schemas/propertySchema';

import mongoose from 'mongoose';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

// Define interface for authenticated request

interface AuthRequest extends Request {
 
  user?: {
    _id: string;
    role: string;
    email: string;
  };


  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

// Interface for advanced search query parameters
interface SearchQuery {
  // Text search
  search?: string;
  
  // Basic filters
  type?: string | string[];
  listingType?: string | string[];
  furnished?: string | string[];
  listedBy?: string | string[];
  


  // Location filters
  state?: string | string[];
  city?: string | string[];
  location?: string;
  
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  
  // Size filters
  minArea?: number;
  maxArea?: number;
  bedrooms?: number | number[];
  bathrooms?: number | number[];
  
  // Rating and verification
  minRating?: number;
  maxRating?: number;
  isVerified?: boolean;
  isAvailable?: boolean;
  
  // Date filters
  availableFrom?: string;
  createdAfter?: string;
  createdBefore?: string;
  
  // Amenities and tags
  amenities?: string | string[];
  tags?: string | string[];
  
  // Sorting and pagination
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;


}

// Assuming you have a Property model defined
const addProperty = async (req: AuthRequest, res: Response) => {
  try {
 
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const createdBy = req.user._id.toString();  
 
    const validationResult = createPropertySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));



      
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }

 
    const propertyData = validationResult.data;

    
    const finalPropertyData = {
      ...propertyData,
      createdBy
    };

    console.log('Creating property with data:', finalPropertyData);
    
    const newProperty = new Property(finalPropertyData);
    console.log('Property before save, propertyId:', newProperty.propertyId);
    
    await newProperty.save();
    console.log('Property after save, propertyId:', newProperty.propertyId);
    return res.status(201).json({
      message: 'Property created successfully',
      property: newProperty
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const getAllProperties = async (req: AuthRequest, res: Response) => {
  try {
    const properties = await Property.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      message: 'Properties retrieved successfully',
      count: properties.length,
      properties
    });



  } 
  
  catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ 
      error: 'Server error in getting properties',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Advanced search and filtering function


const advancedSearch = async (req: Request, res: Response) => {



  try {
    const 
    {
      search,
      type,
      listingType,
      furnished,
      listedBy,
      state,
      city,
      location,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      minRating,
      maxRating,
      isVerified,
      isAvailable,
      availableFrom,
      createdAfter,
      createdBefore,
      amenities,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    }: SearchQuery = req.query;



    // Build the filter object
    const filter: any = {};

    // Text search across multiple fields
    if (search) {


      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];



      
    }

    // Type filter (supports multiple values)
    if (type) {
      filter.type = Array.isArray(type) ? { $in: type } : type;
    }


    // Listing type filter
    if (listingType)
      {
      filter.listingType = Array.isArray(listingType) ? { $in: listingType } : listingType;
    
    }

    // Furnished filter
    if (furnished) 
      {
      filter.furnished = Array.isArray(furnished) ? { $in: furnished } : furnished;
    }

    // Listed by filter
    if (listedBy) {
      filter.listedBy = Array.isArray(listedBy) ? { $in: listedBy } : listedBy;
    }

    // Location filters
    if (state) {
      filter.state = Array.isArray(state) ? { $in: state } : { $regex: state, $options: 'i' };
    }

    if (city) {
      filter.city = Array.isArray(city) ? { $in: city } : { $regex: city, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) 
      {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Area range filter
   
    if (minArea || maxArea)
       {


      filter.areaSqFt = {};
      if (minArea) filter.areaSqFt.$gte = Number(minArea);
      if (maxArea) filter.areaSqFt.$lte = Number(maxArea);

    }

    // Bedrooms filter
    if (bedrooms) 
      {
      filter.bedrooms = Array.isArray(bedrooms) 
        ? { $in: bedrooms.map(Number) } 
        : Number(bedrooms);
    }

    // Bathrooms filter
    if (bathrooms) 
      {
      filter.bathrooms = Array.isArray(bathrooms) 
        ? { $in: bathrooms.map(Number) } 
        : Number(bathrooms);
    }

    // Rating filter
    if (minRating || maxRating) 
      {
      filter.rating = {};
      if (minRating) filter.rating.$gte = Number(minRating);
      if (maxRating) filter.rating.$lte = Number(maxRating);
    }

    // Boolean filters
    if (isVerified !== undefined) 
      {
      const verified = typeof isVerified === 'string' ? isVerified === 'true' : isVerified;
      filter.isVerified = verified;
    }

    if (isAvailable !== undefined) 
      {
      const available = typeof isAvailable === 'string' ? isAvailable === 'true' : isAvailable;
      filter.isAvailable = available;
    }

    // Date filters
    if (availableFrom) 
      {
      filter.availableFrom = { $lte: new Date(availableFrom as string) };
    }

    if (createdAfter || createdBefore) 
      {
      filter.createdAt = {};
      if (createdAfter) filter.createdAt.$gte = new Date(createdAfter as string);
      if (createdBefore) filter.createdAt.$lte = new Date(createdBefore as string);
    }

    // Amenities filter (contains any of the specified amenities)
    if (amenities) 
      {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      filter.amenities = { $in: amenityArray };
    }

    // Tags filter
    if (tags) 
      {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute the search query with pagination
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'firstName lastName email')
        .lean(),
      Property.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: {
        properties,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalResults: total,
          resultsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          applied: Object.keys(req.query).length,
          resultsFound: total
        }
      }
    });

  } catch (error) {
    console.error('Error in advanced search:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get unique filter values for frontend dropdowns
const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const [
      types,
      listingTypes,
      furnishedOptions,
      listedByOptions,
      states,
      cities,
      allAmenities,
      allTags
    ] = await Promise.all([
      Property.distinct('type'),
      Property.distinct('listingType'),
      Property.distinct('furnished'),
      Property.distinct('listedBy'),
      Property.distinct('state'),
      Property.distinct('city'),
      Property.distinct('amenities'),
      Property.distinct('tags')
    ]);

    // Get price and area ranges
    const [priceRange, areaRange, bedroomRange, bathroomRange] = await Promise.all([
      Property.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]),
      Property.aggregate([
        {
          $group: {
            _id: null,
            minArea: { $min: '$areaSqFt' },
            maxArea: { $max: '$areaSqFt' }
          }
        }
      ]),
      Property.distinct('bedrooms'),
      Property.distinct('bathrooms')
    ]);

    return res.status(200).json({
      success: true,
      data: {
        types,
        listingTypes,
        furnishedOptions,
        listedByOptions,
        states,
        cities,
        amenities: allAmenities.filter(Boolean), // Remove null/undefined
        tags: allTags.filter(Boolean),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
        areaRange: areaRange[0] || { minArea: 0, maxArea: 0 },
        bedroomOptions: bedroomRange.filter(val => val !== null).sort((a, b) => a - b),
        bathroomOptions: bathroomRange.filter(val => val !== null).sort((a, b) => a - b)
      }
    });

  } catch (error) {
    console.error('Error getting filter options:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
const getPropertyByUserId = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
 

  try {
 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const userId = new mongoose.Types.ObjectId(id);

    // Fix: Use find() instead of findById() and pass the filter object correctly
    const properties = await Property.find({ createdBy: userId });
    
    if (!properties || properties.length === 0) {
      return res.status(404).json({ error: 'No properties found for this user' });
    }
    
    return res.status(200).json({
      message: 'Properties found successfully',
      count: properties.length,
      properties: properties
    });
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
const getPropertyById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const property = await Property.findOne({ propertyId: id });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    return res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
  // const {id}

const updateProperty = async (req: AuthRequest, res: Response) => {
  const { id } = req.params ;

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user._id;

    const isCreator = await Property.findOne({ propertyId: id,  createdBy: userId });

                               
    if (!isCreator) {
      return res.status(403).json({ error: 'You are not authorized to update this property' });
    }

    const validationResult = updatePropertySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }

    const updatedData = validationResult.data;

    const updatedProperty = await Property.findOneAndUpdate({propertyId:id}, updatedData, { new: true });
    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    return res.status(200).json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return res.status(500).json({
      error: 'Error in updating property',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const deleteProperty = async (req: AuthRequest, res: Response) => {
   const { id } = req.params ;

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user._id;

    const isCreator = await Property.findOne({ propertyId: id,  createdBy: userId });

    // console.log('Owner ID:', isCreator);
    // console.log('User ID:', userId);
    if (!isCreator) {
      return res.status(403).json({ error: 'You are not authorized to update this property' });
    }

    const deletedProperty =  await Property.findOneAndDelete({propertyId:id});
    if (!deletedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    return res.status(200).json({
      message: 'Property deleted successfully',
      property: deletedProperty
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

const addPropertyByDataImport = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }
    
    const createdBy = req.user._id.toString();
    
    // Check if file is uploaded (using upload.single())
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No CSV file uploaded. Please upload a property data file with field name "propertyData".' 
      });
    }

    // Convert single file to array for existing logic
    const files = [req.file];
    
    const results = {
      totalFiles: files.length,
      processedFiles: 0,
      totalRecords: 0,
      successfulInserts: 0,
      failedInserts: 0,
      errors: [] as any[],


      insertedProperties: [] as any[]
    };

    // Process each uploaded CSV file
    for (const file of files) {
      const filePath = file.path;
      const fileName = file.originalname;
      
      console.log(`Processing file: ${fileName}`);
      
      try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          results.errors.push({
            file: fileName,
            error: 'File not found after upload'
          });
          continue;
        }

        // Check if file is CSV
        const fileExtension = path.extname(fileName).toLowerCase();
        if (fileExtension !== '.csv') {
          results.errors.push({
            file: fileName,


            error: 'Only CSV files are supported'
          });
          // Delete non-CSV file
          fs.unlinkSync(filePath);
          continue;
        }

        // Parse CSV and process data
        const csvData: any[] = [];
        
        await new Promise<void>((resolve, reject) => {


          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
              csvData.push(row);
            })
            .on('end', () => {
              console.log(`CSV parsing completed for ${fileName}. Records found: ${csvData.length}`);
              resolve();
            })


            .on('error', (error) => {
              console.error(`Error parsing CSV ${fileName}:`, error);
              reject(error);
            });
        });

        results.totalRecords += csvData.length;

        // Process each row from CSV
        for (let i = 0; i < csvData.length; i++) {
          const row = csvData[i];
          
          try {
            // Transform CSV row to match property schema
            const propertyData = {
              title: row.title || row.Title,
              description: row.description || row.Description,
              type: row.type || row.Type,
              price: parseFloat(row.price || row.Price) || 0,
              state: row.state || row.State,
              city: row.city || row.City,
              areaSqFt: row.areaSqFt || row.area || row.Area ? parseFloat(row.areaSqFt || row.area || row.Area) : undefined,
              bedrooms: row.bedrooms || row.Bedrooms ? parseInt(row.bedrooms || row.Bedrooms) : undefined,
              bathrooms: row.bathrooms || row.Bathrooms ? parseInt(row.bathrooms || row.Bathrooms) : undefined,
              amenities: row.amenities || row.Amenities ? 
                (typeof (row.amenities || row.Amenities) === 'string' ? 
                  (row.amenities || row.Amenities).split('|').map((item: string) => item.trim()).filter(Boolean) : 
                  row.amenities || row.Amenities) : [],
              furnished: row.furnished || row.Furnished || 'Unfurnished',
              availableFrom: row.availableFrom || row.AvailableFrom ? new Date(row.availableFrom || row.AvailableFrom) : undefined,
              listedBy: row.listedBy || row.ListedBy || 'Owner',
              tags: row.tags || row.Tags ? 
                (typeof (row.tags || row.Tags) === 'string' ? 
                  (row.tags || row.Tags).split('|').map((item: string) => item.trim()).filter(Boolean) : 
                  row.tags || row.Tags) : [],
              colorTheme: row.colorTheme || row.ColorTheme,
              rating: row.rating || row.Rating ? parseFloat(row.rating || row.Rating) : undefined,
              isVerified: row.isVerified || row.IsVerified ? 
                (row.isVerified || row.IsVerified).toString().toLowerCase() === 'true' : false,
              listingType: row.listingType || row.ListingType || 'rent',
              location: row.location || row.Location,
              images: row.images || row.Images ? 
                (typeof (row.images || row.Images) === 'string' ? 
                  (row.images || row.Images).split('|').map((item: string) => item.trim()).filter(Boolean) : 
                  row.images || row.Images) : [],
              isAvailable: row.isAvailable || row.IsAvailable ? 
                (row.isAvailable || row.IsAvailable).toString().toLowerCase() !== 'false' : true,
              createdBy: createdBy
            };

            // Validate the property data using Zod schema
            const validationResult = createPropertySchema.safeParse(propertyData);
            
            if (!validationResult.success) {
              results.failedInserts++;
              results.errors.push({
                file: fileName,
                row: i + 1,
                data: row,
                error: 'Validation failed',
                details: validationResult.error.issues.map(err => ({
                  field: err.path.join('.'),
                  message: err.message
                }))
              });
              continue;
            }

            // Add createdBy to the validated data (since it's not in the Zod schema)
            const finalPropertyData = {
              ...validationResult.data,
              createdBy: createdBy
            };

            // Create and save the property
            const newProperty = new Property(finalPropertyData);
            const savedProperty = await newProperty.save();
            
            results.successfulInserts++;
            results.insertedProperties.push({
              propertyId: savedProperty.propertyId,
              title: savedProperty.title,
              type: savedProperty.type,
              price: savedProperty.price,
              location: `${savedProperty.city}, ${savedProperty.state}`
            });

            console.log(`Property ${savedProperty.propertyId} created successfully from ${fileName}`);

          } 
          
          catch (error) {
            results.failedInserts++;
            results.errors.push({
              file: fileName,
              row: i + 1,
              data: row,
              error: 'Database insertion failed',
              details: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error(`Error inserting property from ${fileName}, row ${i + 1}:`, error);
          }
        }

        results.processedFiles++;
        console.log(`Completed processing file: ${fileName}`);

      } 
      
      catch (error) {
        results.errors.push({
          file: fileName,
          error: 'File processing failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`Error processing file ${fileName}:`, error);
      } finally {
       
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up file: ${filePath}`);
          }
        } catch (cleanupError) {
          console.error(`Error cleaning up file ${filePath}:`, cleanupError);
          // Don't fail the entire operation due to cleanup issues
        }
      }
    }

    // Prepare response
    const responseMessage = `Import completed. Processed ${results.processedFiles}/${results.totalFiles} files, ${results.successfulInserts}/${results.totalRecords} records inserted successfully.`;
    
    if (results.successfulInserts === 0) {
      return res.status(400).json({
        message: 'No properties were imported successfully',
        results: results
      });
    }

    if (results.failedInserts > 0) {
      return res.status(207).json({ // 207 Multi-Status
        message: responseMessage,
        results: results,
        warning: `${results.failedInserts} records failed to import. Check errors array for details.`
      });
    }

    return res.status(201).json({
      message: responseMessage,
      results: results
    });

  } catch (error) {
    console.error('Error in property data import:', error);
    
    // Clean up any uploaded files in case of unexpected errors
    if (req.file) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log(`Cleaned up file: ${req.file.path}`);
        }
      } catch (cleanupError) {
        console.error(`Error cleaning up file ${req.file.path}:`, cleanupError);
      }
    }

    return res.status(500).json({
      error: 'Internal server error during import',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export { 
  addProperty, 
  getAllProperties, 
  updateProperty, 
  deleteProperty, 
  getPropertyByUserId, 
  getPropertyById,
  advancedSearch,
  getFilterOptions,
  addPropertyByDataImport 
};