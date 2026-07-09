/**
 * Validate file input (for uploads)
 * @param {Object} file - File object with name, type, size properties
 * @param {Object} options - Validation options
 * @param {Array} options.allowedTypes - Array of allowed MIME types
 * @param {number} options.maxSize - Maximum file size in bytes
 * @type {number}
 * @param {Array} options.dangerousExtensions - Array of dangerous file extensions to block
 * @returns {Object} Validation result { valid: boolean, error: string|null }
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = [],
    maxSize = Infinity,
    dangerousExtensions = ['exe', 'sh', 'php', 'js', 'html', 'htm', 'phtml', 'php3', 'php4', 'php5', 'php8', 'pht', 'phtm', 'shtml', 'xhtml'],
    allowedExtensions = []
  } = options;

  // Handle null/undefined
  if (!file || typeof file !== 'object') {
    return {
      valid: false,
      error: 'Invalid file object',
    };
  }

  const { name, type, size } = file;

  // Validate file name
  if (!name || typeof name !== 'string') {
    return {
      valid: false,
      error: 'File name is required and must be a string',
    };
  }

  // Validate file type
  if (!type || typeof type !== 'string') {
    return {
      valid: false,
      error: 'File type is required and must be a string',
    };
  }

  // Validate file size
  if (!size || typeof size !== 'number' || size <= 0) {
    return {
      valid: false,
      error: 'File size is required and must be a positive number',
    };
  }

  // Check file type against allowed types
  if (allowedTypes.length > 0 && !allowedTypes.includes(type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size against maximum
  if (size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`,
    };
  }

  // Check for dangerous file extensions
  const fileExtension = name.split('.').pop().toLowerCase();
  if (dangerousExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'File type not allowed for security reasons',
    };
  }

  // Check filename length
  if (name.length > 255) {
    return {
      valid: false,
      error: 'Filename too long (maximum 255 characters)',
    };
  }

  return {
    valid: true,
    error: null,
  };
};