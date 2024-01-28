require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const mongoose = require('mongoose');
const Property = require('../models/Property'); 
const axios = require('axios');
const { Readable } = require('stream');

const keyFilename = './newhomes-411610-d0e93a12f223.json'; 
const storage = new Storage({ keyFilename });

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        uploadImagesToGoogleCloud(); 
    })
    .catch(err => console.error('Could not connect to MongoDB:', err));

async function uploadImagesToGoogleCloud() {
    try {
        console.log('Version 2.0')
        console.log('Fetching properties...');
        const allProperties = await Property.find({});
        console.log(`Found ${allProperties.length} properties`);

        for (const property of allProperties) {
            const images = property.imageList.split('|');
            console.log(`Uploading images for property: ${property.name}`);
            
            for (const imageUrl of images) {
                const adjustedImageUrl = imageUrl.replace('renamed-images/', '');
                console.log(`Uploading image: ${adjustedImageUrl}`);
                await uploadImageToGCS(property, adjustedImageUrl);
            }
            
        }
        console.log('All images uploaded');
    } catch (e) {
        console.error('Error:', e);
    }
}

async function uploadImageToGCS(property, imageUrl) {
 
    try {
        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'stream'
        });

        const newFilename = `${imageUrl.split('/').pop()}`;
        const bucketName = 'newhomesbucket01';
        const objectPath = `${property.propID}/${property.slug}/${property.slug}-${newFilename}`;

        
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(objectPath);
        
        return new Promise((resolve, reject) => {
            response.data.pipe(file.createWriteStream({
                metadata: {
                    contentType: response.headers['content-type']
                }
            }))
            .on('error', (error) => {
                console.error('Error uploading image:', error);
                reject(error);
            })
            .on('finish', () => {
                const cloudStorageUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
                console.log('Uploaded to:', cloudStorageUrl);
                resolve(cloudStorageUrl);
            });
        });
    } catch (error) {
        console.error('Error in uploadImageToGCS:', error);
    }
}

// If you want to be able to call this from the command line
if (require.main === module) {
    uploadImagesToGoogleCloud();
}
