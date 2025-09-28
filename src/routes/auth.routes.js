import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller.js';
import { createUserByAdmin } from '../controllers/auth.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { Joi, validateBody } from '../middleware/validate.js';

const router = Router();

router.post('/register', authLimiter, validateBody(Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
  // disallow creating admin accounts via public register; default to viewer
  role: Joi.string().valid('viewer').default('viewer'),
})), register);

router.post('/login', authLimiter, validateBody(Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
})), login);
router.get('/me', authenticate, me);

// Admin-only: create users with specified roles (admin/operator/viewer)
router.post('/users', authenticate, requireRole('admin'), validateBody(Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('admin', 'operator', 'viewer').required(),
})), createUserByAdmin);

export default router;


