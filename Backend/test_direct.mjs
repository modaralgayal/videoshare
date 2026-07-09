// Direct test of clamscan initialization logic
(async () => {
  try {
    console.log('Testing direct clamscan initialization...');

    // Dynamically import the clamscan module (CommonJS)
    const clamscanModule = await import('clamscan');
    console.log('clamscanModule imported:', typeof clamscanModule);

    const NodeClam = clamscanModule.default || clamscanModule;
    console.log('NodeClam:', NodeClam);

    // Configure ClamAV to use the local clamscan binary (since we don't have clamd daemon)
    const clamConfig = {
      remove_infected: false, // We're scanning buffers, not saving files
      quarantine_infected: false,
      clamscan: {
        path: '/usr/bin/clamscan', // Path to clamscan binary
        scan_archives: true,     // Scan archives if needed
        active: true             // Enable clamscan method
      },
      clamdscan: {
        active: false            // Disable clamdscan method (we don't have daemon running)
      },
      preference: 'clamscan'     // Prefer clamscan over clamdscan
    };

    console.log('Configuration:', JSON.stringify(clamConfig, null, 2));

    // Initialize the clamscan instance (returns a promise)
    console.log('Creating NodeClam instance...');
    const clamInstance = new NodeClam();
    console.log('Instance created');

    console.log('Initializing clamscan...');
    await clamInstance.init(clamConfig);
    console.log('ClamAV initialized successfully!');

    // Test with EICAR file
    console.log('Testing with EICAR file...');
    const result = await clamInstance.is_infected('/tmp/clamav_test/eicar.com.txt');
    console.log('EICAR scan result:', result);

    // Test with clean file
    console.log('Testing with clean file...');
    const cleanResult = await clamInstance.is_infected('/tmp/clamav_test/clean.txt');
    console.log('Clean file scan result:', cleanResult);

  } catch (error) {
    console.error('Error during direct test:', error);
    console.error('Error stack:', error.stack);
  }
})();