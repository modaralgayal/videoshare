import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing upload.js module initialization...');

// Import the upload module
import * as uploadModule from './src/controllers/upload.js';

console.log('Import completed');
console.log('clamscanInitialized:', uploadModule.clamscanInitialized);
console.log('clamscanInstance:', uploadModule.clamscanInstance !== null ? 'Set' : 'Null');

// Wait a bit to see if the IIFE executes
setTimeout(() => {
  console.log('After timeout:');
  console.log('clamscanInitialized:', uploadModule.clamscanInitialized);
  console.log('clamscanInstance:', uploadModule.clamscanInstance !== null ? 'Set' : 'Null');
}, 100);