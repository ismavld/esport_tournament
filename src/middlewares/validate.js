import { z } from 'zod';
import { ApiError } from '../middlewares/errorHandler.js';

/**
 * Validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema to validate
 * @param {string} source - Where to validate ('body', 'query', 'params')
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validated = schema.parse(dataToValidate);

      // Replace the original data with validated data
      if (source === 'body') {
        req.body = validated;
      } else if (source === 'query') {
        req.query = validated;
      } else {
        req.params = validated;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ApiError(400, `Validation error: ${JSON.stringify(formattedErrors)}`));
      }
      next(error);
    }
  };
};
