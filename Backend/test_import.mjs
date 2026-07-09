import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing upload.js import...');

try {
  const uploadModule = await import('./src/controllers/upload.js');
  console.log('Upload module imported successfully');
  console.log('clamscanInitialized:', uploadModule.clamscanInitialized);
} catch (error) {
  console.error('Error importing upload module:', error);
  console.error('Error stack:', error.stack);
}