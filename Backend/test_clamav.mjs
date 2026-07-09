import { scanFileForViruses } from './src/controllers/upload.js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function testClamAV() {
  try {
    console.log('Testing ClamAV implementation...');

    // Test 1: Clean file
    console.log('\n1. Testing clean file...');
    const cleanFilePath = join('/tmp/clamav_test', 'clean.txt');
    const cleanBuffer = readFileSync(cleanFilePath);

    try {
      const result = await scanFileForViruses(cleanBuffer);
      console.log('✓ Clean file passed virus scan:', result);
    } catch (error) {
      console.log('✗ Clean file failed virus scan:', error.message);
    }

    // Test 2: EICAR test virus file
    console.log('\n2. Testing EICAR test virus file...');
    const eicarFilePath = join('/tmp/clamav_test', 'eicar.com.txt');
    const eicarBuffer = readFileSync(eicarFilePath);

    try {
      const result = await scanFileForViruses(eicarBuffer);
      console.log('✗ EICAR test file should have been detected as virus but passed:', result);
    } catch (error) {
      if (error.message && (error.message.includes('Virus') || error.message.includes('infected') || error.message.includes('FOUND'))) {
        console.log('✓ EICAR test file correctly detected as virus:', error.message);
      } else {
        console.log('? EICAR test file failed with unexpected error:', error.message);
      }
    }

    // Test 3: Empty buffer
    console.log('\n3. Testing empty buffer...');
    try {
      const result = await scanFileForViruses(Buffer.from(''));
      console.log('✓ Empty file scanned as clean:', result);
    } catch (error) {
      console.log('✗ Empty file scan failed:', error.message);
    }

    console.log('\nClamAV testing complete!');
    return true;
  } catch (error) {
    console.error('Error during testing:', error);
    return false;
  }
}

testClamAV().then(success => {
  process.exit(success ? 0 : 1);
});