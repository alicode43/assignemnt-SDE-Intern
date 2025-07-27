import Property, { IProperty } from '../models/Property';

export class PropertyService {
  async getAllProperties(filters: any = {}) {
    try {
      const query = this.buildQuery(filters);
      const properties = await Property.find(query)
        .populate('ownerId', 'firstName lastName email')
        .sort({ createdAt: -1 });
      return properties;
    } catch (error) {
      throw new Error(`Error fetching properties: ${error}`);
    }
  }

  async getPropertyById(id: string) {
    try {
      const property = await Property.findById(id)
        .populate('ownerId', 'firstName lastName email');
      return property;
    } catch (error) {
      throw new Error(`Error fetching property: ${error}`);
    }
  }

  async createProperty(propertyData: Partial<IProperty>) {
    try {
      const property = new Property(propertyData);
      const savedProperty = await property.save();
      return savedProperty;
    } catch (error) {
      throw new Error(`Error creating property: ${error}`);
    }
  }

  async updateProperty(id: string, updateData: Partial<IProperty>) {
    try {
      const property = await Property.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('ownerId', 'firstName lastName email');
      return property;
    } catch (error) {
      throw new Error(`Error updating property: ${error}`);
    }
  }

  async deleteProperty(id: string) {
    try {
      const property = await Property.findByIdAndDelete(id);
      return property;
    } catch (error) {
      throw new Error(`Error deleting property: ${error}`);
    }
  }

  private buildQuery(filters: any) {
    const query: any = {};

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    if (filters.bedrooms) {
      query.bedrooms = filters.bedrooms;
    }

    if (filters.bathrooms) {
      query.bathrooms = filters.bathrooms;
    }

    if (filters.isAvailable !== undefined) {
      query.isAvailable = filters.isAvailable;
    }

    return query;
  }
}
