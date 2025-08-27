import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { Joi, validateBody } from '../middleware/validate.js';

const router = Router();

router.post('/register', authLimiter, validateBody(Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('operator', 'admin', 'viewer').default('operator'),
})), register);

router.post('/login', authLimiter, validateBody(Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
})), login);
router.get('/me', authenticate, me);

export default router;


