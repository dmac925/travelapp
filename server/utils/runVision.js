const analyzeImagesInHotels = require('./vision');

// Call the function to run the script
analyzeImagesInHotels()
  .then(() => {
    console.log('Vision script completed.');
    process.exit(0); // Exit the script gracefully
  })
  .catch((error) => {
    console.error('Error running Vision script:', error);
    process.exit(1); // Exit with an error code
  });