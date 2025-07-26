import express from 'express';
import { registerUser, login, loginData, logout } from '../controllers/auth.controller.js';
import { protectedMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.get('/loginData', protectedMiddleware, loginData);
router.post('/logout', protectedMiddleware, logout);

export default router;