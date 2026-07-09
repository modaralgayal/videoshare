// Simple test to see if the IIFE updates the variables
let clamscanInitialized = false;
let clamscanInstance = null;

console.log('Before IIFE:');
console.log('clamscanInitialized:', clamscanInitialized);
console.log('clamscanInstance:', clamscanInstance);

(async () => {
  console.log('Inside IIFE');
  clamscanInitialized = true;
  clamscanInstance = {};
  console.log('After setting in IIFE:');
  console.log('clamscanInitialized:', clamscanInitialized);
  console.log('clamscanInstance:', clamscanInstance);
})();

setTimeout(() => {
  console.log('After timeout:');
  console.log('clamscanInitialized:', clamscanInitialized);
  console.log('clamscanInstance:', clamscanInstance);
}, 100);