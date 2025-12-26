import { Router } from 'express';
import { chat, getSuggestions } from '../controllers/chatController';

const router = Router();

// POST /api/chat - Send a message to Nova
router.post('/', chat);

// GET /api/chat/suggestions - Get suggested questions
router.get('/suggestions', getSuggestions);

export default router;
