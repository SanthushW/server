import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import { listBuses, getBus, createBus, updateBus, deleteBus, getBusLocations } from '../controllers/buses.controller.js';
import { Joi, validateBody, validateQuery } from '../middleware/validate.js';

const router = Router();

/**
 * @openapi
 * /buses:
 *   get:
 *     summary: List all buses
 *     parameters:
 *       - in: query
 *         name: route
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', apiLimiter, validateQuery(Joi.object({
  route: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive', 'maintenance').optional(),
  search: Joi.string().optional(),
  sort: Joi.string().valid('id', 'routeId', 'plate', 'status').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
})), listBuses);
/**
 * @openapi
 * /buses/{id}:
 *   get:
 *     summary: Get bus by ID
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
router.get('/:id', apiLimiter, getBus);
/**
 * @openapi
 * /buses/{id}/locations:
 *   get:
 *     summary: Get recent GPS history for a bus (last 100 points)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id/locations', apiLimiter, getBusLocations);
router.post('/', authenticate, requireRole('operator', 'admin'), validateBody(Joi.object({
  routeId: Joi.number().integer().required(),
  plate: Joi.string().min(3).max(20).required(),
  status: Joi.string().valid('active', 'inactive', 'maintenance').optional(),
  gps: Joi.object({ lat: Joi.number().min(-90).max(90), lng: Joi.number().min(-180).max(180) }).optional(),
})), createBus);
router.put('/:id', authenticate, requireRole('operator', 'admin'), validateBody(Joi.object({
  routeId: Joi.number().integer().optional(),
  plate: Joi.string().min(3).max(20).optional(),
  status: Joi.string().valid('active', 'inactive', 'maintenance').optional(),
  gps: Joi.object({ lat: Joi.number().min(-90).max(90), lng: Joi.number().min(-180).max(180) }).optional(),
})), updateBus);
router.delete('/:id', authenticate, requireRole('admin'), deleteBus);

export default router;


