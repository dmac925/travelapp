require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/Property'); 

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        addDeveloperSlugs();  // Call the new function here
    })
    .catch(err => console.error('Could not connect to MongoDB:', err));

async function addDeveloperSlugs() {
    try {
        console.log('Adding developer slugs...');
        const allProperties = await Property.find({});
        console.log(`Found ${allProperties.length} properties`);

        for (const property of allProperties) {
            const developerSlug = generateSlug(property.developerName);
            console.log(`Updating property ${property.name} with slug: ${developerSlug}`);
            await Property.updateOne({ _id: property._id }, { $set: { developerSlug: developerSlug } });
        }
        console.log('All developer slugs added');
    } catch (e) {
        console.error('Error:', e);
    }
}

function generateSlug(developerName) {
    if (!developerName) {
        // Handle the case where developerName is undefined or null
        return 'default-slug'; // or return an empty string, depending on your requirements
    }
    // Replace all non-word characters with a hyphen and convert to uppercase
    return developerName.replace(/\W+/g, '-').toLowerCase();
}

// If you want to be able to call this from the command line
if (require.main === module) {
    addDeveloperSlugs();
}
