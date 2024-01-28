const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const propertySchema = new Schema({
    propId: { type: Number },
    name: { type: String, required: true },
    developerName: { type: String },
    developerId: { type: Number },
    location: {
        lat: { type: Number},
        lng: { type: Number}
    },
    address: {
        full: { type: String },
        postalCode: { type: String },
        street1: { type: String },
        street2: { type: String },
        city: { type: String },
        state: { type: String },
        region: { type: String },
        country: { type: String },
        area: { type: String },
        mapAddress: { type: String },
        shortAddress: { type: String },
    },
    mainDescription: { type: String },
    metaDescription: { type: String },
    featuredImage: { type: String },
    propFeatures: [String],
    developmentAmenities: { type: String },
    priceFrom: { type: Number },
    priceTo: { type: Number },
    currency: { type: String },
    importDate: { type: String },
    oldPermalink: { type: String },
    imageList: { type: String },
    imageNumbers: { type: String },
    propType: { type: String },
    propertyTypes: [{
        type: { type: String },
        bedCounts: { type: String }
    }],
    slug: { type: String },
});

module.exports = mongoose.model("Property", propertySchema);

