import { Request, Response } from 'express';
import Property from '../models/Property';
import { createPropertySchema, updatePropertySchema } from '../schemas/propertySchema';
import mongoose from 'mongoose';


// Define interface for authenticated request
interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    email: string;
  };
}

// Assuming you have a Property model defined
const addProperty = async (req: AuthRequest, res: Response) => {
  try {
 
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const createdBy = req.user._id;  
 
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
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
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

    // console.log('Owner ID:', isCreator);
    // console.log('User ID:', userId);
    if (!isCreator) {
      return res.status(403).json({ error: 'You are not authorized to update this property' });
    }

    // if (ownerId) {
    //   console.log(userId === ownerId.createdBy);
    // } else {
    //   console.log('Owner ID not found');
    // }
    // Validate request body with Zod schema
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

export { addProperty, getAllProperties, updateProperty, deleteProperty , getPropertyByUserId , getPropertyById };