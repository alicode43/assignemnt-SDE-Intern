import { Router } from 'express';
import {
  register,
  login,
  getAllUser,
  getUserById
} from '../controllers/userController';

const router = Router();

// User routes
router.post('/register', register);
router.post('/login', login);
router.get('/', getAllUser);
router.get('/:id', getUserById);



export default router;
