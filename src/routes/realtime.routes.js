import { Router } from 'express';
import { addSseClient } from '../utils/sse.js';

const router = Router();

/**
 * @openapi
 * /realtime/sse:
 *   get:
 *     summary: Subscribe to real-time bus updates via SSE
 *     responses:
 *       200:
 *         description: Event stream
 */
router.get('/sse', (req, res) => {
  addSseClient(res);
});

export default router;



