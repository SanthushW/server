import Joi from 'joi';

export function validateTrip(req, res, next) {
  // canonical statuses: scheduled, in-progress, completed, cancelled
  const canonicalStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
  const tripSchema = Joi.object({
    id: Joi.number().optional(),
    busId: Joi.number().required(),
    routeId: Joi.number().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
    status: Joi.string().valid(...canonicalStatuses).optional()
  });

  const { error } = tripSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: true,
      message: error.details[0].message,
    });
  }

  // Check for XSS attempts in status field
  if (typeof req.body.status === 'string') {
    const sanitizedStatus = req.body.status.replace(/[<>]/g, '');
    if (sanitizedStatus !== req.body.status) {
      return res.status(400).json({ error: true, message: 'Invalid characters detected in status field' });
    }
  }

  // Validate time ranges
  const startTime = new Date(req.body.startTime);
  const endTime = new Date(req.body.endTime);
  const maxTripDuration = 24 * 60 * 60 * 1000; // 24 hours
  if (endTime - startTime > maxTripDuration) {
    return res.status(400).json({ error: true, message: 'Trip duration cannot exceed 24 hours' });
  }

  // Normalize some common synonyms to canonical values used elsewhere
  if (req.body.status && typeof req.body.status === 'string') {
    const normalization = {
      in_progress: 'in-progress',
      inprogress: 'in-progress',
      ongoing: 'in-progress',
      canceled: 'cancelled',
      cancel: 'cancelled',
      cancelled: 'cancelled',
    };
    const s = req.body.status.toString();
    req.body.status = normalization[s] || s;
    // if after normalization it's still not canonical, coerce to canonical if possible
    if (!canonicalStatuses.includes(req.body.status)) {
      // fallback: if it contains 'cancel' or 'complete' or 'progress'
      const low = req.body.status.toLowerCase();
      if (low.includes('cancel')) req.body.status = 'cancelled';
      else if (low.includes('complete')) req.body.status = 'completed';
      else if (low.includes('progress') || low.includes('ongo')) req.body.status = 'in-progress';
    }
  }

  return next();
}
