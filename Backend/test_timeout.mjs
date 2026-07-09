import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Testing upload.js module with timeout ===');

// Import the upload module to trigger the IIFE
let uploadModule;
try {
  console.log('Importing upload module...');
  uploadModule = await import('./src/controllers/upload.js');
  console.log('Import completed immediately');
} catch (error) {
  console.error('Error during import:', error);
}

// Wait a bit to see if the IIFE executes
setTimeout(() => {
  if (uploadModule) {
    console.log('After timeout - clamscanInitialized from export:', uploadModule.clamscanInitialized);
    console.log('After timeout - clamscanInstance from export:', !!uploadModule.clamscanInstance);
  } else {
    console.log('Upload module not available');
  }
  process.exit(0);
}, 100);