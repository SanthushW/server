import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import { listTrips, getTrip, createTrip, updateTrip, deleteTrip } from '../controllers/trips.controller.js';
import { Joi, validateBody, validateQuery } from '../middleware/validate.js';

const router = Router();

/**
 * @openapi
 * /trips:
 *   get:
 *     summary: List all trips
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', apiLimiter, validateQuery(Joi.object({
  date: Joi.string().isoDate().optional(),
  busId: Joi.number().integer().optional(),
  routeId: Joi.number().integer().optional(),
  sort: Joi.string().valid('startTime', 'endTime', 'id').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
})), listTrips);
/**
 * @openapi
 * /trips/{id}:
 *   get:
 *     summary: Get trip by ID
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
router.get('/:id', apiLimiter, getTrip);
router.post('/', authenticate, requireRole('operator', 'admin'), validateBody(Joi.object({
  busId: Joi.number().integer().required(),
  routeId: Joi.number().integer().required(),
  startTime: Joi.string().isoDate().required(),
  endTime: Joi.string().isoDate().required(),
  status: Joi.string().valid('scheduled', 'ongoing', 'completed', 'canceled').optional(),
})), createTrip);
router.put('/:id', authenticate, requireRole('operator', 'admin'), validateBody(Joi.object({
  busId: Joi.number().integer().optional(),
  routeId: Joi.number().integer().optional(),
  startTime: Joi.string().isoDate().optional(),
  endTime: Joi.string().isoDate().optional(),
  status: Joi.string().valid('scheduled', 'ongoing', 'completed', 'canceled').optional(),
})), updateTrip);
router.delete('/:id', authenticate, requireRole('admin'), deleteTrip);

export default router;


