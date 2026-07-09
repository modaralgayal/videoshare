import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testClamscan() {
  try {
    console.log('Attempting to import clamscan...');
    const clamscanModule = await import('clamscan');
    console.log('clamscanModule:', clamscanModule);
    const NodeClam = clamscanModule.default || clamscanModule;
    console.log('NodeClam:', NodeClam);
    const clam = new NodeClam();
    console.log('clam instance created');
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
    console.log('Initializing clamscan...');
    await clam.init(clamConfig);
    console.log('Clamscan initialized successfully');
    const result = await clam.is_infected('/tmp/clamav_test/eicar.com.txt');
    console.log('Scan result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testClamscan();