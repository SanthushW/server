import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import { listRoutes, getRoute, createRoute, updateRoute, deleteRoute } from '../controllers/routes.controller.js';
import { Joi, validateBody, validateQuery } from '../middleware/validate.js';

const router = Router();

/**
 * @openapi
 * /routes:
 *   get:
 *     summary: List all routes
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', apiLimiter, validateQuery(Joi.object({
  name: Joi.string().optional(),
  origin: Joi.string().optional(),
  destination: Joi.string().optional(),
  sort: Joi.string().valid('id', 'name').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
})), listRoutes);
/**
 * @openapi
 * /routes/{id}:
 *   get:
 *     summary: Get route by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not Found
 */
router.get('/:id', apiLimiter, getRoute);
router.post('/', authenticate, requireRole('admin'), validateBody(Joi.object({
  name: Joi.string().min(2).required(),
  origin: Joi.string().min(2).required(),
  destination: Joi.string().min(2).required(),
  distanceKm: Joi.number().min(0).optional(),
})), createRoute);
router.put('/:id', authenticate, requireRole('admin'), validateBody(Joi.object({
  name: Joi.string().min(2).optional(),
  origin: Joi.string().min(2).optional(),
  destination: Joi.string().min(2).optional(),
  distanceKm: Joi.number().min(0).optional(),
})), updateRoute);
router.delete('/:id', authenticate, requireRole('admin'), deleteRoute);

export default router;


