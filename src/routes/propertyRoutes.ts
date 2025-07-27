import { Router } from 'express';
import {
  addProperty,  getAllProperties, updateProperty, deleteProperty, 
  getPropertyByUserId, getPropertyById,advancedSearch,
  getFilterOptions, addPropertyByDataImport
} from '../controllers/propertyController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/multer'

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
 
propertyRouter.post('/import', 
  authenticateToken,
  (req, res, next) => {
    console.log('=== DEBUG INFO ===');
    console.log('Headers received:', req.headers['content-type']);
    console.log('All headers:', req.headers);
    
 
   
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      const data = Buffer.concat(chunks);
      console.log('Raw request data preview:', data.toString().substring(0, 200));
    });
    
    upload.single('propertyData')(req, res, (err: any) => {
      console.log('=== MULTER RESULT ===');
      if (err) {
        console.error('Multer error details:', {
          message: err.message,
          code: err.code,
          field: err.field,
          stack: err.stack
        });
        
        // More specific error handling
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ 
            error: 'Unexpected field name detected',
            details: `Expected field name: "propertyData", but received different field name`,
            hint: 'In Postman: Body → form-data → Key must be exactly "propertyData" → Type: File',
            received_field: err.field || 'unknown'
          });
        }
        
        return res.status(400).json({ 
          error: 'File upload error', 
          details: err.message,
          code: err.code,
          hint: 'Make sure to use field name "propertyData" with type "File" in Postman form-data'
        });
      }
      
      console.log('File received successfully:', req.file ? {
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : 'No file received');
      console.log('=== END DEBUG ===');
      
      return next();
    });
  },
  addPropertyByDataImport
);



export default propertyRouter;
