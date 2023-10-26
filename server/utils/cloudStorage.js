const config = require('../data/config.json');
const { Storage } = require('@google-cloud/storage');
const keyFilename = './hotels-402512-885d95abc7fb.json';
const storage = new Storage({ keyFilename });


async function uploadImage(hotel, image, handledLabel, imageBuffer = null) {
    try {
        const label = handledLabel || 'unknown';
        const newFilename = `${hotel.name}-${label}.jpg`;

        const bucketName = 'hotelsbucket01'; 
        const objectPath = `renamed-images/${newFilename}`;

        if (imageBuffer) {
            // If the image buffer is provided, use it to upload the image directly
            const file = storage.bucket(bucketName).file(objectPath);
            await file.save(imageBuffer, {
                contentType: 'image/jpeg'
            });
        } else {
            // If the image is already in GCS and you just want to copy/rename:
            const sourceBucket = storage.bucket(bucketName);
            await sourceBucket.file(image.url.split('/').pop()).copy(sourceBucket.file(objectPath));
        }

        image.cloudStorageUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
        return image.cloudStorageUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

module.exports = { uploadImage };