import { Router } from 'express';
import { ingestGps } from '../controllers/ingest.controller.js';
import { Joi, validateBody } from '../middleware/validate.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Ingestion from GPS devices: accept busId and GPS payload.
const deviceLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false, skip: () => process.env.NODE_ENV === 'test' });

// Feature flag: set ENABLE_DEVICE_AUTH=true to require device authentication for GPS ingest
// To re-enable, uncomment the import for deviceAuth at top and the middleware below.
// import { deviceAuth } from '../middleware/deviceAuth.js';
const ENABLE_DEVICE_AUTH = process.env.ENABLE_DEVICE_AUTH === 'true';

/**
 * @openapi
 * /ingest/gps:
 *   post:
 *     summary: Ingest GPS location from device
 *     description: Accepts GPS payloads posted by devices.
 *     # No authentication required for device ingestion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - busId
 *               - lat
 *               - lng
 *             properties:
 *               busId:
 *                 type: integer
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *               speed:
 *                 type: number
 *               heading:
 *                 type: number
 *               battery:
 *                 type: number
 *     responses:
 *       '202':
 *         description: Accepted
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized - invalid device credentials
 *     examples:
 *       sample:
 *         summary: Sample GPS payload
 *         value:
 *           busId: 101
 *           timestamp: '2025-10-03T12:00:00Z'
 *           lat: 6.9271
 *           lng: 79.8612
 *           speed: 40
 */
router.post('/gps', deviceLimiter,
  // Enable deviceAuth when feature flag is on (uncomment to use)
  // ENABLE_DEVICE_AUTH ? deviceAuth :
  validateBody(Joi.object({
  busId: Joi.number().integer().required(),
  timestamp: Joi.string().isoDate().optional(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  speed: Joi.number().min(0).optional(),
  heading: Joi.number().min(0).max(360).optional(),
  battery: Joi.number().min(0).max(100).optional(),
})), ingestGps);

export default router;
