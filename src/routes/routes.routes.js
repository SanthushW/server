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
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, apiLimiter, validateQuery(Joi.object({
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */
router.get('/:id', authenticate, apiLimiter, getRoute);
/**
 * @openapi
 * /routes:
 *   post:
 *     summary: Create a route
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               distanceKm:
 *                 type: number
 *           examples:
 *             createRoute:
 *               value:
 *                 name: Route 1
 *                 origin: City A
 *                 destination: City B
 *                 distanceKm: 12.5
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticate, requireRole('admin'), validateBody(Joi.object({
  name: Joi.string().min(2).required(),
  origin: Joi.string().min(2).required(),
  destination: Joi.string().min(2).required(),
  distanceKm: Joi.number().min(0).optional(),
})), createRoute);
/**
 * @openapi
 * /routes/{id}:
 *   put:
 *     summary: Update a route
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               origin:
 *                 type: string
 *               destination:
 *                 type: string
 *               distanceKm:
 *                 type: number
 *           examples:
 *             updateRoute:
 *               value:
 *                 name: Route 1 Updated
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:id', authenticate, requireRole('admin'), validateBody(Joi.object({
  name: Joi.string().min(2).optional(),
  origin: Joi.string().min(2).optional(),
  destination: Joi.string().min(2).optional(),
  distanceKm: Joi.number().min(0).optional(),
})), updateRoute);
/**
 * @openapi
 * /routes/{id}:
 *   delete:
 *     summary: Delete a route
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteRoute);

export default router;


