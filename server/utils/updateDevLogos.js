require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const mongoose = require('mongoose');
const Developer = require('../models/Developer'); // Update this path based on your actual model file
const axios = require('axios');

const keyFilename = './newhomes-411610-c0a56e66b3e7.json'; // Ensure this path and file are correct
const storage = new Storage({ keyFilename });

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        uploadDeveloperLogosToGoogleCloud();
    })
    .catch(err => console.error('Could not connect to MongoDB:', err));

async function uploadDeveloperLogosToGoogleCloud() {
    try {
        console.log('Fetching developers...');
        const developersWithImages = await Developer.find({
            imageURL: { 
                $ne: '',
                $not: /https:\/\/storage\.googleapis\.com\/newhomesbucket01\/developers\//
            }
        });
        console.log(`Found ${developersWithImages.length} developers with logos`);

        for (const developer of developersWithImages) {
            if (!developer.imageURL || developer.imageURL.trim() === '') {
                console.log(`No logo to upload for developer: ${developer.name}`);
                continue; // Skip to the next developer if no logo is found
            }

            const newImageName = `${developer.devCode}-${developer.slug}.jpeg`;
            const newImageUrl = await uploadImageToGCS(developer, developer.imageURL, newImageName);
            if (newImageUrl) {
                // Update the developer's imageURL in the database
                await Developer.findByIdAndUpdate(developer._id, { imageURL: newImageUrl });
                console.log(`Updated imageURL for developer: ${developer.name}`);
            }
        }
        console.log('All logos uploaded and developers updated');
    } catch (e) {
        console.error('Error:', e);
    }
}

async function uploadImageToGCS(developer, imageUrl, newImageName) {
    const maxRetries = 3; // Maximum number of retries
    let attempt = 0; // Current attempt

    while (attempt < maxRetries) {
        try {
            const bucketName = 'newhomesbucket01';
            const objectPath = `developers/${developer.devCode}-${developer.slug}/${newImageName}`;
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(objectPath);
    
            // Check if the file already exists to avoid overwriting
            const [exists] = await file.exists();
            if (exists) {
                console.log(`File already exists: ${objectPath}`);
                return `https://storage.googleapis.com/${bucketName}/${objectPath}`; // Return existing file URL
            }
    
            const response = await axios({
                method: 'get',
                url: imageUrl,
                responseType: 'stream'
            });
    
            return new Promise((resolve, reject) => {
                response.data.pipe(file.createWriteStream({
                    metadata: {
                        contentType: response.headers['content-type']
                    }
                }))
                .on('error', (error) => {
                    attempt++;
                    if (attempt >= maxRetries) {
                        console.error('Error uploading image after several attempts:', error);
                        reject(error);
                    }
                })
                .on('finish', () => {
                    const cloudStorageUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
                    console.log('Uploaded to:', cloudStorageUrl);
                    resolve(cloudStorageUrl);
                });
            });
        } catch (error) {
            console.error('Error in uploadImageToGCS:', error);
            if (error.code === 'ECONNRESET' && attempt < maxRetries) {
                console.log(`Retrying upload... Attempt ${attempt + 1}`);
                attempt++;
            } else {
                return null;
            }
        }
    }
}

// If you want to be able to call this from the command line
if (require.main === module) {
    uploadDeveloperLogosToGoogleCloud();
}
