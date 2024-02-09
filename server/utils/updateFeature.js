require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/property');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const BATCH_SIZE = 100;

async function updatePropertiesChillOutToLounge() {
    let offset = 0;
    let updatedCount = 0;

    while (true) {
        const properties = await Property.find({ propFeatures: "Chill out place" }) // Find properties with "Chill out place"
                                          .skip(offset)
                                          .limit(BATCH_SIZE);

        if (properties.length === 0) {
            break; // Exit the loop if no more properties to process
        }

        for (let property of properties) {
            // Check if "Chill out place" is in propFeatures
            const chillOutFeatureIndex = property.propFeatures.indexOf("Chill out place");
            if (chillOutFeatureIndex !== -1) {
                // Prepare the updated features list by replacing "Chill out place" with "Lounge"
                const updatedFeatures = property.propFeatures.map(feature => feature === "Chill out place" ? "Lounge" : feature);

                // Update the document
                await Property.updateOne(
                    { _id: property._id },
                    {
                        $set: { propFeatures: updatedFeatures }
                    }
                );

                updatedCount++;
            }
        }

        offset += properties.length;
    }

    console.log(`Updated ${updatedCount} properties to replace 'Chill out place' with 'Lounge'.`);
    mongoose.disconnect();
}

updatePropertiesChillOutToLounge();
