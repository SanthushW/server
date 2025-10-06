import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { addSseClient } from '../utils/sse.js';

const router = Router();

/**
 * @openapi
 * /realtime/sse:
 *   get:
 *     summary: Subscribe to real-time bus updates via SSE
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event stream
 *       401:
 *         description: Unauthorized
 */
router.get('/sse', authenticate, (req, res) => {
  addSseClient(res);
});

/**
 * @openapi
 * /realtime/sse/{id}:
 *   get:
 *     summary: Subscribe to real-time updates for a specific bus via SSE
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
 *         description: Event stream
 *       401:
 *         description: Unauthorized
 */
router.get('/sse/:id', authenticate, (req, res) => {
  const id = req.params.id;
  addSseClient(res, { id });
});

export default router;



