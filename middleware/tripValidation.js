const Joi = require('joi');

const tripSchema = Joi.object({
  id: Joi.number().required(),
  busId: Joi.number().required(),
  routeId: Joi.number().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
  status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled').required()
});

const validateTrip = (req, res, next) => {
  const { error } = tripSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: true,
      message: error.details[0].message
    });
  }

  // Check for XSS attempts in status field
  const sanitizedStatus = req.body.status.replace(/[<>]/g, '');
  if (sanitizedStatus !== req.body.status) {
    return res.status(400).json({
      error: true, 
      message: 'Invalid characters detected in status field'
    });
  }

  // Validate time ranges
  const startTime = new Date(req.body.startTime);
  const endTime = new Date(req.body.endTime);
  const maxTripDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  if (endTime - startTime > maxTripDuration) {
    return res.status(400).json({
      error: true,
      message: 'Trip duration cannot exceed 24 hours'
    });
  }

  next();
};

module.exports = validateTrip;