require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/property'); // Adjust the path as needed

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const BATCH_SIZE = 100; // Adjust the batch size as needed

async function updateFeaturedImage() {
    let offset = 0;
    let updatedCount = 0;

    while (true) {
        const properties = await Property.find({
            $or: [
              { featuredImage: { $exists: true, $eq: null } },
              { featuredImage: { $exists: true, $eq: '' } }
            ]
          })
                                        .skip(offset)
                                        .limit(BATCH_SIZE);

        if (properties.length === 0) {
            break;
        }

        const bulkOperations = properties.map(property => {
            if (property.imageList && property.imageList !== '') {
                const images = property.imageList.split('|');
                if (images.length > 0) {
                    return {
                        updateOne: {
                            filter: { _id: property._id },
                            update: { $set: { featuredImage: images[0].trim() } }
                        }
                    };
                }
            }
        }).filter(operation => operation != null); // Filter out any undefined operations

        if (bulkOperations.length > 0) {
            await Property.bulkWrite(bulkOperations);
            updatedCount += bulkOperations.length;
        }

        offset += properties.length;
    }

    console.log(`Updated featured images for ${updatedCount} properties.`);
    mongoose.disconnect();
}

updateFeaturedImage();
