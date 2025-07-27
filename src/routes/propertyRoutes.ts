import { Router } from 'express';
import {

addProperty, getAllProperties, updateProperty, deleteProperty , getPropertyByUserId , getPropertyById 
} from '../controllers/propertyController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
// router.get('/', addProperty)
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.get('/user/:id', getPropertyByUserId);

// Protected routes
router.post('/addProperty', authenticateToken, addProperty);
router.patch('/update/:id', authenticateToken, updateProperty);
router.delete('/:id', authenticateToken, deleteProperty);

export default router;
