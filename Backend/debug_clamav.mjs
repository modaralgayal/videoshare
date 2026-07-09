import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting clamscan test...');

async function testClamAVModule() {
  try {
    console.log('1. Importing clamscan module...');
    const clamscanModule = await import('clamscan');
    console.log('   Module imported:', typeof clamscanModule);

    const NodeClam = clamscanModule.default || clamscanModule;
    console.log('2. NodeClam class:', NodeClam);

    console.log('3. Creating NodeClam instance...');
    const clam = new NodeClam();
    console.log('   Instance created');

    console.log('4. Preparing configuration...');
    const clamConfig = {
      remove_infected: false,
      quarantine_infected: false,
      clamscan: {
        path: '/usr/bin/clamscan',
        scan_archives: true,
        active: true
      },
      clamdscan: {
        active: false
      },
      preference: 'clamscan'
    };
    console.log('   Config:', JSON.stringify(clamConfig, null, 2));

    console.log('5. Initializing clamscan...');
    await clam.init(clamConfig);
    console.log('   Initialized successfully');

    console.log('6. Testing with EICAR file...');
    const result = await clam.is_infected('/tmp/clamav_test/eicar.com.txt');
    console.log('   Scan result:', result);

    console.log('7. Testing with clean file...');
    const cleanResult = await clam.is_infected('/tmp/clamav_test/clean.txt');
    console.log('   Clean file result:', cleanResult);

    return true;
  } catch (error) {
    console.error('Error in test:', error);
    console.error('Error stack:', error.stack);
    return false;
  }
}

testClamAVModule().then(success => {
  console.log('Test completed, success:', success);
  process.exit(success ? 0 : 1);
});