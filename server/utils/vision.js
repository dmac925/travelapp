const axios = require('axios');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const mongoose = require('mongoose');
const Hotel = require('../models/hotelSchema');
const config = require('../data/config.json');
const { uploadImage } = require('./cloudStorage');
const { handlePoolLabel, handleBathLabel, handleGymLabel } = require('./labelHandlers');

const client = new ImageAnnotatorClient();
const key = './hotels-402512-b8151a4e4515.json';
const labelHandlers = [handlePoolLabel, handleBathLabel, handleGymLabel]; 

async function analyzeImagesInHotels() {
  let imageBuffer = null;
  try {
      const hotels = await Hotel.find();

      for (const hotel of hotels) {
          console.log(`Analyzing images for hotel: ${hotel.name}`);

          for (const image of hotel.images) {
              console.log(`Processing image for hotel: ${hotel.name}`); 

              if (!image.processed) { 
                  console.log(`Image not processed yet for hotel: ${hotel.name}`); 

                  let result;

                  if (image.url.startsWith('gs://')) {
                      const gcsUri = `gs://hotelsbucket01/${image.url.split('/').pop()}`;
                      const response = await client.labelDetection(gcsUri);

                      if (response && response.length > 0) {
                          result = response[0];
                      } else {
                          console.error("No response from Vision API for GCS image:", gcsUri);
                          continue; // Skip this image and move to the next
                      }
                  } else {
                      const axiosResponse = await axios.get(image.url, {
                          responseType: 'arraybuffer'
                      });

                      if (axiosResponse.status !== 200) {
                          console.error("Failed to fetch the image:", image.url, "Status:", axiosResponse.status);
                          continue;
                      }

                      imageBuffer = axiosResponse.data;
                      const base64Image = Buffer.from(imageBuffer).toString('base64');

                      const response = await client.labelDetection({
                          image: {
                              content: base64Image
                          }
                      });

                      if (response && response.length > 0) {
                          result = response[0];
                      } else {
                          console.error("No response from Vision API for fetched image:", image.url);
                          continue; // Skip this image and move to the next
                      }
                  }

                  console.log("Vision API result:", result);

                  const labels = result.labelAnnotations.map((label) => label.description);
                  console.log(`Labels detected for hotel ${hotel.name}:`, labels); 

                  // Use label handling functions
                  const handledLabel = labelHandlers.reduce((label, handler) => label || handler(labels), '') || labels.join(', ');
                  console.log(`Handled label for hotel ${hotel.name}:`, handledLabel); 

                  image.label = handledLabel;

                  const newFilename = `${hotel.name}-${handledLabel}.jpg`;
                  image.renamedUrl = `./renamed-images/${newFilename}`;

                  const newCloudUrl = await uploadImage(hotel, image, handledLabel, imageBuffer);
                  
                  if (!hotel.imageArchive) hotel.imageArchive = [];  // initialize the archive if it doesn't exist
                  hotel.imageArchive.push(image.url);  // archive the old URL
                  image.url = newCloudUrl;  // update to the new URL

                  image.processed = true;
              }
          }
          
          await hotel.save();
      }

      console.log('Image analysis and renaming completed.');
  } catch (error) {
      console.error('Error analyzing images:', error);
  }
}

analyzeImagesInHotels();