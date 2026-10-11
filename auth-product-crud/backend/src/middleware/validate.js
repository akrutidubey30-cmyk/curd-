const { validationResult } = require('express-validator');

/**
 * Middleware to handle express-validator results
 * Formats errors into the required response structure:
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "errors": [
 *     {
 *       "field": "field_name",
 *       "message": "Error description"
 *     }
 *   ]
 * }
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const formattedErrors = result.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  next();
};

module.exports = validate;
