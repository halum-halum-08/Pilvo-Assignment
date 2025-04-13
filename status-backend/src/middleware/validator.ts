import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiError } from './errorHandler';

// Middleware to validate request inputs
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => {
        return {
          field: err.type === 'field' ? err.path : 'unknown',
          message: err.msg
        };
      });
      
      return next(new ApiError(400, 'Validation failed'));
    }

    next();
  };
};
