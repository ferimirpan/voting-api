import express from 'express';
import { protectedMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { addPoll, addOption, pollList, deletePoll, voted, resultPoll } from '../controllers/poll.controller.js';

const router = express.Router();

router.post('/', protectedMiddleware, adminMiddleware, addPoll);
router.patch('/addOption/:id', protectedMiddleware, addOption);
router.get('/', protectedMiddleware, pollList);
router.delete('/:id', protectedMiddleware, adminMiddleware, deletePoll);
router.post('/voted', protectedMiddleware, voted);
router.get('/result/:id', protectedMiddleware, adminMiddleware, resultPoll);

export default router;
