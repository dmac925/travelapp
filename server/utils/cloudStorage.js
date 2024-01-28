require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../data/config.json');
const { Storage } = require('@google-cloud/storage');
const keyFilename = './newhomes-411610-d0e93a12f223.json';
const storage = new Storage({ keyFilename });
const fetch = require('node-fetch');
const Property = require('../models/property');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        uploadImagesToGoogleCloud();
    })
    .catch(err => console.error('Could not connect to MongoDB:', err));

    async function uploadImagesToGoogleCloud() {
        try {
            const properties = await Property.find({ imagesUploadedToGCS: { $ne: true } });
            for (const property of properties) {
                await uploadPropertyImages(property);
                await Property.updateOne({ _id: property._id }, { $set: { imagesUploadedToGCS: true } });
            }
        } catch (error) {
            console.error('Error in uploadImagesToGoogleCloud:', error);
        }
    }
async function downloadImageBuffer(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const imageBuffer = await response.buffer();
        return imageBuffer;
    } catch (error) {
        console.error(`Error downloading image from URL (${imageUrl}):`, error);
        throw error; // Rethrow to handle it in the calling function
    }
}


async function uploadPropertyImages(property) {
    try {
        const bucketName = 'newhomesbucket01';
        const propertyFolder = `${property.propId}-${property.name.replace(/\s+/g, '-')}`;

        // Check if the property's imageList is defined
        if (!property.imageList) {
            console.warn(`No imageList for property ${property._id}`);
            return;
        }

        const imageUrls = property.imageList.split('|');
        let newImageUrls = []; // Store new GCS URLs

        // Base URL for images in your Google Cloud Storage bucket
       
        for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];

            // Skip if the image is already in GCS
            if (imageUrl.startsWith(gcsBaseUrl)) {
                console.log(`Image already in GCS, skipping: ${imageUrl}`);
                continue;
            }

            // Image processing logic for images not in GCS
            const imageLabel = `image-${(i + 1).toString().padStart(2, '0')}`;
            const newFilename = `${propertyFolder}/${propertyFolder}-${imageLabel}.jpg`;
            const objectPath = `${propertyFolder}/${newFilename}`;

            const imageBuffer = await downloadImageBuffer(imageUrl);
            const file = storage.bucket(bucketName).file(objectPath);
            await file.save(imageBuffer, { contentType: 'image/jpeg' });

            const newGcsUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
            newImageUrls.push(newGcsUrl); // Add the new URL to the list
        }

        // Update MongoDB document if new images were uploaded
        if (newImageUrls.length > 0) {
            await Property.updateOne(
                { _id: property._id },
                { $set: { imageList: newImageUrls.join('|') } }
            );
        }

    } catch (error) {
        console.error('Error uploading property images:', error);
    }
}

module.exports = { uploadPropertyImages };
