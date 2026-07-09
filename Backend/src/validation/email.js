/**
 * Validate email input
 * @param {*} value - The value to validate
 * @returns {Object} Validation result { valid: boolean, error: string|null, value: string|null }
 */
export const validateEmail = (value) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return {
      valid: false,
      error: 'Email is required',
      value: null
    };
  }

  // Convert to string if not already
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: 'Email must be a string',
      value: null
    };
  }

  // Trim whitespace
  const trimmedValue = value.trim();

  // Check if empty after trimming
  if (trimmedValue.length === 0) {
    return {
      valid: false,
      error: 'Email is required',
      value: null
    };
  }

  // Check pattern
  if (!emailPattern.test(trimmedValue)) {
    return {
      valid: false,
      error: 'Please enter a valid email address',
      value: null
    };
  }

  return {
    valid: true,
    error: null,
    value: trimmedValue
  };
};