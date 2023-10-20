const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotelSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: String },
    location: {
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    stars: { type: Number, required: true, min: 1, max: 5 },
    totalRooms: { type: Number },
    parking: { type: Boolean },
    images: [
        {
            label: { type: String, required: true },
            url: { type: String, required: true },
            imageLabels: [String],
            renamedImages: [
                {
                    processed: { type: Boolean, default: false },
                    label: { type: String, required: true },
                    url: { type: String, required: true },
                    imageLabels: [String],
                },
            ],
           
        }
    ],
    imageArchive: [String], 
});

module.exports = mongoose.model("Hotel", hotelSchema);
