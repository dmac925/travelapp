const fs = require('fs').promises;
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
  return null;  
}

function formatPostalCode(postalCode) {
  let cleaned = postalCode.replace(/\s/g, "");  // Remove any spaces
  return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`; // Insert space before last 3 characters
}

const mapToSchema = (hotelData) => {
  let uniqueRoomTypes = new Set();

  const latitude = parseFloat(hotelData.location.lat);
  const longitude = parseFloat(hotelData.location.lng);

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
    location: {
      lat: hotelData.location.lat,
      lng: hotelData.location.lng
    },
    address: {
      full: hotelData.address.full,
      postalCode: formatPostalCode(hotelData.address.postalCode),
      street1: hotelData.address.street,
      country: hotelData.address.country,
      region: hotelData.address.region
    },
    hotelClass: hotelData.stars,
    price: hotelData.price,
    currency: hotelData.currency,
    bookingRating: hotelData.rating, 
    bookingReviewNum: hotelData.reviews,
    bookingDescription: hotelData.description,
    checkIn: hotelData.checkIn,
    checkOut: hotelData.checkOut,
    hotelFacilities: hotelData.facilities.map(f => f.name).join(", "),
    hotelRooms: uniqueRooms.map(room => ({
      roomType: room.roomType,
      roomSize: extractRoomSize(room.features),
      bedType: room.bedType,
      roomPrice: room.price,
      roomPriceCurr: room.currency,
    })),
  };
}

const filePath = path.join(__dirname, 'bigdata.jsonl');

const hotelsToInsert = [];

async function loadData() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const lines = data.split('\n');
    for (const line of lines) {
      if (line) {
        try {
          const hotelData = JSON.parse(line);
          const mappedHotel = mapToSchema(hotelData);

          const hotel = new Hotel(mappedHotel);
          hotelsToInsert.push(hotel);

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    }

    if (hotelsToInsert.length) {
      Hotel.insertMany(hotelsToInsert)
        .then(() => console.log('All hotel data saved successfully'))
        .catch(err => console.error('Error saving hotel data:', err));
    }

  } catch (error) {
    console.error('Error reading the file:', error);
  }
}

loadData();