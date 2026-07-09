/**
 * Validate array input
 * @param {*} value - The value to validate
 * @param {Object} options - Validation options
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (inclusive)
 * @param {number} options.maxLength - Maximum length (inclusive)
 * @param {Function} options.itemValidator - Function to validate each item
 * @returns {Object} Validation result { valid: boolean, error: string|null, value: Array|null }
 */
export const validateArray = (value, options = {}) => {
  const {
    minLength = 0,
    maxLength = Infinity,
    itemValidator = null
  } = options;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return {
      valid: false,
      error: 'Value is required',
      value: null
    };
  }

  // Check if it's an array
  if (!Array.isArray(value)) {
    return {
      valid: false,
      error: 'Value must be an array',
      value: null
    };
  }

  // Check length
  if (value.length < minLength) {
    return {
      valid: false,
      error: `Array must have at least ${minLength} items`,
      value: null
    };
  }

  if (value.length > maxLength) {
    return {
      valid: false,
      error: `Array must have no more than ${maxLength} items`,
      value: null
    };
  }

  // Validate each item if validator provided
  if (itemValidator) {
    const invalidItems = [];
    const validatedItems = [];

    for (let i = 0; i < value.length; i++) {
      const itemResult = itemValidator(value[i]);
      if (!itemResult.valid) {
        invalidItems.push({ index: i, error: itemResult.error });
      } else {
        validatedItems.push(itemResult.value);
      }
    }

    if (invalidItems.length > 0) {
      return {
        valid: false,
        error: `Invalid items at indices: ${invalidItems.map(item => item.index).join(', ')}`,
        value: null
      };
    }

    return {
      valid: true,
      error: null,
      value: validatedItems
    };
  }

  return {
    valid: true,
    error: null,
    value: [...value] // Return a copy
  };
};