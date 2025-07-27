import { Router } from 'express';
import {
  addProperty,  getAllProperties, updateProperty, deleteProperty, 
  getPropertyByUserId, getPropertyById,advancedSearch,
  getFilterOptions, addPropertyByDataImport,
  addToFavorites, removeFromFavorites, getFavoriteProperties, checkFavoriteStatus
} from '../controllers/propertyController';
import { authenticateToken } from '../middleware/auth';
import { fileUploadWithLogging } from '../middleware/fileUploadLogger';

const propertyRouter = Router();

// Public routes
propertyRouter.get('/', getAllProperties);
propertyRouter.get('/search', advancedSearch);  
propertyRouter.get('/filter-options', getFilterOptions);  
propertyRouter.get('/:id', getPropertyById);
propertyRouter.get('/user/:id', getPropertyByUserId);

// Protected routes
propertyRouter.post('/addProperty', authenticateToken, addProperty);
propertyRouter.patch('/update/:id', authenticateToken, updateProperty);
propertyRouter.delete('/:id', authenticateToken, deleteProperty);

// Favorite property routes
propertyRouter.post('/:propertyId/favorite', authenticateToken, addToFavorites);
propertyRouter.delete('/:propertyId/favorite', authenticateToken, removeFromFavorites);
propertyRouter.get('/favorites/list', authenticateToken, getFavoriteProperties);
propertyRouter.get('/:propertyId/favorite/status', authenticateToken, checkFavoriteStatus);

// File import route
propertyRouter.post('/import', 
  authenticateToken,
  fileUploadWithLogging,
  addPropertyByDataImport
);



export default propertyRouter;
