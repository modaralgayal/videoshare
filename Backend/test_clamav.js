const { scanFileForViruses } = require('./src/controllers/upload.js');
const fs = require('fs');
const path = require('path');

async function testClamAV() {
  try {
    console.log('Testing ClamAV implementation...');

    // Test 1: Clean file
    console.log('\n1. Testing clean file...');
    const cleanFilePath = path.join('/tmp/clamav_test', 'clean.txt');
    const cleanBuffer = fs.readFileSync(cleanFilePath);

    try {
      const result = await scanFileForViruses(cleanBuffer);
      console.log('✓ Clean file passed virus scan:', result);
    } catch (error) {
      console.log('✗ Clean file failed virus scan:', error.message);
    }

    // Test 2: EICAR test virus file
    console.log('\n2. Testing EICAR test virus file...');
    const eicarFilePath = path.join('/tmp/clamav_test', 'eicar.com.txt');
    const eicarBuffer = fs.readFileSync(eicarFilePath);

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
      await scanFileForViruses(Buffer.from(''));
      console.log('✗ Empty buffer should have failed validation');
    } catch (error) {
      console.log('✓ Empty buffer correctly rejected:', error.message);
    }

    console.log('\nClamAV testing complete!');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testClamAV();