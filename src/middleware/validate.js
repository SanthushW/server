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
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json(formatError(error));
    req.query = value;
    return next();
  };
}

export { Joi };







