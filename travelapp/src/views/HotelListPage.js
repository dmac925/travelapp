import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HotelListPage() {
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    stars: '',
    location: '',
    price: '',
  });
  const [selectedHotel, setSelectedHotel] = useState(null); // To keep track of the selected hotel

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/hotels');
        setHotels(response.data);
      } catch (error) {
        console.error('Error fetching hotel data:', error);
      }
    };

    fetchData();
  }, []);

  const handleHotelClick = (hotel) => {
    // Toggle the selected hotel. If it's already selected, set it to null to close the expansion.
    setSelectedHotel((prevSelectedHotel) =>
      prevSelectedHotel === hotel ? null : hotel
    );
  };

  const filteredHotels = hotels.filter((hotel) => (
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!filterCriteria.stars || hotel.stars === parseInt(filterCriteria.stars, 10))
    // Add more filtering criteria here based on filterCriteria
  ));
  

  return (
    <div>
      <h1>Hotel List</h1>
      <input
        type="text"
        placeholder="Search by hotel name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{ marginTop: '20px' }}>
        {filteredHotels.map((hotel, index) => (
          <div
            key={index}
            style={{
              boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
              padding: '16px',
              borderRadius: '8px',
              margin: '20px 0',
              cursor: 'pointer',
            }}
            onClick={() => handleHotelClick(hotel)}
          >
            <h2>{hotel.name}</h2>
            <p>Stars: {hotel.stars}</p>
            <p>Location: {hotel.address.region}</p>
            <p>Price: {`${hotel.price} ${hotel.currency}`}</p>
            <p>Booking Rating: {hotel.bookingRating}</p>
            <p>TripAdvisor Rating: {hotel.tripadvisorRating}</p>
            <p>Google Rating: {hotel.googleRating}</p>
            
            {selectedHotel === hotel && (
              <div>
                <h3>Room Information:</h3>
                {hotel.hotelRooms.map((room, roomIndex) => (
                  <div key={roomIndex} style={{ margin: '10px 0' }}>
                    <p>Room Type: {room.roomType}</p>
                    <p>Room Size: {room.roomSize}</p>
                    <p>Room Price: {room.roomPrice}</p>
                    {/* Add more attributes for room */}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HotelListPage;