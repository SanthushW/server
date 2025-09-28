import Joi from 'joi';

function formatError(error) {
  return {
    message: 'Validation error',
    details: error.details.map(d => ({ message: d.message, path: d.path })),
  };
}

export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json(formatError(error));
    req.body = value;
    return next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    // Allow callers to pass through small client hints such as compact/mobile even when not in schema.
    const original = { ...req.query };
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json(formatError(error));
    // Preserve compact/mobile flags if provided by client but not defined in the schema
    if (original.compact !== undefined && value.compact === undefined) value.compact = String(original.compact);
    if (original.mobile !== undefined && value.mobile === undefined) value.mobile = String(original.mobile);
    req.query = value;
    return next();
  };
}

export { Joi };







