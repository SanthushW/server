import { Router } from 'express';
import { overview, routeDetail } from '../controllers/analytics.controller.js';

const router = Router();

/**
 * @openapi
 * /analytics/overview:
 *   get:
 *     summary: Get system analytics overview
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/overview', overview);

/**
 * @openapi
 * /analytics/route/{id}:
 *   get:
 *     summary: Get analytics for a specific route
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
router.get('/route/:id', routeDetail);

export default router;







