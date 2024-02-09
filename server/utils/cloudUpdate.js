require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const mongoose = require('mongoose');
const Property = require('../models/Property'); 
const axios = require('axios');

const keyFilename = './newhomes-411610-c0a56e66b3e7.json'; 
const storage = new Storage({ keyFilename });

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        uploadImagesToGoogleCloud(); 
    })
    .catch(err => console.error('Could not connect to MongoDB:', err));

async function uploadImagesToGoogleCloud() {
    try {
        console.log('Fetching properties...');
        const propertiesWithImages = await Property.find({
            imageList: { 
                $ne: '',
                $not: /https:\/\/storage\.googleapis\.com\/newhomesbucket01\/properties\//
            }
        });
        console.log(`Found ${propertiesWithImages.length} properties with images`);


        for (const property of propertiesWithImages) {
            if (!property.imageList || property.imageList.trim() === '') {
                console.log(`No images to upload for property: ${property.name}`);
                continue; // Skip to the next property if no images are found
            }

            const images = property.imageList.split('|');
            let newImageUrls = [];
            let imageCounter = 1;

            for (const imageUrl of images) {
                const newImageName = `${property.address.city}-${property.slug}-${String(imageCounter).padStart(2, '0')}.jpeg`;
                const newImageUrl = await uploadImageToGCS(property, imageUrl, newImageName);
                if (newImageUrl) {
                    newImageUrls.push(newImageUrl);
                }
                imageCounter++;
            }

            // Update the property's imageList in the database
            if (newImageUrls.length > 0) {
                await Property.findByIdAndUpdate(property._id, { imageList: newImageUrls.join('|') });
                console.log(`Updated imageList for property: ${property.name}`);
            }
        }
        console.log('All images uploaded and properties updated');
    } catch (e) {
        console.error('Error:', e);
    }
}

async function uploadImageToGCS(property, imageUrl, newImageName) {
    const maxRetries = 3; // Maximum number of retries
    let attempt = 0; // Current attempt

    while (attempt < maxRetries) {
        try {
            const bucketName = 'newhomesbucket01';
            const objectPath = `properties/${property.propId}-${property.slug}/${newImageName}`;
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
    uploadImagesToGoogleCloud();
}
