import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import { overview, routeDetail } from '../controllers/analytics.controller.js';

const router = Router();

/**
 * @openapi
 * /analytics/overview:
 *   get:
 *     summary: Get system analytics overview
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 */
router.get('/overview', authenticate, apiLimiter, overview);

/**
 * @openapi
 * /analytics/route/{id}:
 *   get:
 *     summary: Get analytics for a specific route
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
router.get('/route/:id', authenticate, apiLimiter, routeDetail);

export default router;







