/**
 * Validate URL input
 * @param {*} value - The value to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowRelative - Whether to allow relative URLs
 * @returns {Object} Validation result { valid: boolean, error: string|null, value: string|null }
 */
export const validateURL = (value, options = {}) => {
  const {
    allowRelative = false
  } = options;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return {
      valid: false,
      error: 'URL is required',
      value: null
    };
  }

  // Convert to string
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: 'URL must be a string',
      value: null
    };
  }

  // Trim whitespace
  const trimmedValue = value.trim();

  // Allow relative URLs if specified
  if (allowRelative && (trimmedValue.startsWith('/') || trimmedValue.startsWith('./') || trimmedValue.startsWith('../'))) {
    return {
      valid: true,
      error: null,
      value: trimmedValue
    };
  }

  // Validate absolute URL
  const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  if (!urlPattern.test(trimmedValue)) {
    return {
      valid: false,
      error: 'Please enter a valid URL',
      value: null
    };
  }

  return {
    valid: true,
    error: null,
    value: trimmedValue
  };
};