/**
 * Validate number input
 * @param {*} value - The value to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value (inclusive)
 * @param {number} options.max - Maximum value (inclusive)
 * @param {boolean} options.integer - Whether value must be an integer
 * @param {boolean} options.positive - Whether value must be positive (> 0)
 * @param {boolean} options.negative - Whether value must be negative (< 0)
 * @returns {Object} Validation result { valid: boolean, error: string|null, value: number|null }
 */
export const validateNumber = (value, options = {}) => {
  const {
    min = -Infinity,
    max = Infinity,
    integer = false,
    positive = false,
    negative = false
  } = options;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return {
      valid: false,
      error: 'Value is required',
      value: null
    };
  }

  // Convert to number
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return {
      valid: false,
      error: 'Value must be a number',
      value: null
    };
  }

  // Check if integer is required
  if (integer && !Number.isInteger(numValue)) {
    return {
      valid: false,
      error: 'Value must be an integer',
      value: null
    };
  }

  // Check range
  if (numValue < min) {
    return {
      valid: false,
      error: `Value must be at least ${min}`,
      value: null
    };
  }

  if (numValue > max) {
    return {
      valid: false,
      error: `Value must be no more than ${max}`,
      value: null
    };
  }

  // Check if positive is required
  if (positive && numValue <= 0) {
    return {
      valid: false,
      error: 'Value must be greater than zero',
      value: null
    };
  }

  // Check if negative is required
  if (negative && numValue >= 0) {
    return {
      valid: false,
      error: 'Value must be less than zero',
      value: null
    };
  }

  return {
    valid: true,
    error: null,
    value: numValue
  };
};