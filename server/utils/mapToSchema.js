const fs = require('fs');
const path = require('path');
const Hotel = require('../models/hotelSchema');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://andrewg:barcelonacode@hoteltesting.fxjzcen.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const extractRoomSize = (features) => {
  for (let feature of features) {
    let match = feature.match(/\d+\s(m²|feet²)/);
    if (match) return match[0];
  }
  return null;  // Default value if no room size is found
}

const mapToSchema = (hotelData) => {
  let uniqueRoomTypes = new Set();

  // Filter out duplicates based on roomType
  const uniqueRooms = hotelData.rooms.filter(room => {
    if (!uniqueRoomTypes.has(room.roomType)) {
      uniqueRoomTypes.add(room.roomType);
      return true;
    }
    return false;
  });

  return {
    name: hotelData.name,
    // 'brand' is not available in the given data, setting it to a default value
    brand: "Unknown",
    location: {
      lat: hotelData.location.lat,
      lng: hotelData.location.lng
    },
    address: {
      full: hotelData.address.full,
      postalCode: hotelData.address.postalCode,
      street: hotelData.address.street,
      country: hotelData.address.country,
      region: hotelData.address.region
    },
    stars: hotelData.stars,
    price: hotelData.price,
    currency: hotelData.currency,
    // Setting ratings to default as they are not available in the given data
    bookingRating: hotelData.rating, // Using this for now
    tripadvisorRating: null,
    googleRating: null,
    checkIn: hotelData.checkIn,
    checkOut: hotelData.checkOut,
    // 'totalRooms' is not available in the data, setting it to a default value
    totalRooms: null,
    // Mapping facilities to a string for now, you can modify as needed
    hotelFacilities: hotelData.facilities.map(f => f.name).join(", "),
    // 'openDate' and 'refurbishedDate' are not available in the data
    openDate: null,
    refurbishedDate: null,
    hotelRooms: uniqueRooms.map(room => ({
      roomType: room.roomType,
      roomSize: extractRoomSize(room.features),
      bedType: room.bedType,
      roomPrice: room.price,
      roomPriceCurr: room.currency,
    })),
    hotelImages: hotelData.images.map(img => ({
      label: 'Hotel Image',
      url: img,
      imageLabels: [],
      renamedImages: [{
        processed: false,
        label: 'Renamed Image',
        url: img,
        imageLabels: []
      }]
    })),
    imageArchive: []
  };
}

const filePath = path.join(__dirname, 'bigdata.jsonl');

fs.readFileSync(filePath, 'utf-8').split('\n').forEach(line => {
  if (line) {
    try {
      const hotelData = JSON.parse(line);
      const mappedHotel = mapToSchema(hotelData);

      // Create an instance of the model and save it to the database
      const hotel = new Hotel(mappedHotel);
      hotel.save()
        .then(() => console.log('Hotel data saved successfully'))
        .catch(err => console.error('Error saving hotel data:', err));
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  }
});
