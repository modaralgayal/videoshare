/**
 * Validate string input
 * @param {*} value - The value to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (inclusive)
 * @param {number} options.maxLength - Maximum length (inclusive)
 * @param {boolean} options.trim - Whether to trim the string before validation
 * @param {RegExp} options.pattern - Regex pattern the string must match
 * @returns {Object} Validation result { valid: boolean, error: string|null, value: string|null }
 */
export const validateString = (value, options = {}) => {
  const {
    minLength = 0,
    maxLength = Infinity,
    trim = false,
    pattern = null
  } = options;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return {
      valid: false,
      error: 'Value is required',
      value: null
    };
  }

  // Convert to string if not already
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: 'Value must be a string',
      value: null
    };
  }

  // Trim if requested
  let processedValue = value;
  if (trim) {
    processedValue = value.trim();
  }

  // Check length
  if (processedValue.length < minLength) {
    return {
      valid: false,
      error: `Value must be at least ${minLength} characters long`,
      value: null
    };
  }

  if (processedValue.length > maxLength) {
    return {
      valid: false,
      error: `Value must be no more than ${maxLength} characters long`,
      value: null
    };
  }

  // Check pattern if provided
  if (pattern && !pattern.test(processedValue)) {
    return {
      valid: false,
      error: 'Value format is invalid',
      value: null
    };
  }

  return {
    valid: true,
    error: null,
    value: processedValue
  };
};