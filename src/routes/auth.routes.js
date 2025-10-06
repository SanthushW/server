import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller.js';
import { createUserByAdmin } from '../controllers/auth.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { Joi, validateBody } from '../middleware/validate.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new viewer account (public)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *           examples:
 *             viewer:
 *               value:
 *                 username: viewer_example
 *                 password: password123
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/register', authLimiter, validateBody(Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
  // disallow creating admin accounts via public register; default to viewer
  role: Joi.string().valid('viewer').default('viewer'),
})), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate and retrieve a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *           examples:
 *             login:
 *               value:
 *                 username: Admin01
 *                 password: admin123
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/login', authLimiter, validateBody(Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
})), login);
/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get authenticated user profile
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/me', authenticate, me);

// Admin-only: create users with specified roles (admin/operator/viewer)
/**
 * @openapi
 * /auth/users:
 *   post:
 *     summary: Admin-only - create users (admin/operator/viewer)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *           examples:
 *             createAdmin:
 *               value:
 *                 username: AdminMain01
 *                 password: admin123
 *                 role: admin
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/users', authenticate, requireRole('admin'), validateBody(Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('admin', 'operator', 'viewer').required(),
})), createUserByAdmin);


export default router;


