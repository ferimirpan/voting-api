import express from 'express';
import { userList, updateUser, deleteUser } from '../controllers/user.controller.js';
import { protectedMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/', protectedMiddleware, adminMiddleware, userList);
router.post('/', protectedMiddleware, adminMiddleware, registerUser);
router.put('/:id', protectedMiddleware, adminMiddleware, updateUser);
router.delete('/:id', protectedMiddleware, adminMiddleware, deleteUser);

export default router;
