import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Link, useParams } from 'react-router-dom';


function HotelListPage() {
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    stars: '',
    location: '',
    price: '',
  });
  const [selectedHotel, setSelectedHotel] = useState(null); 
  const [expandedRoom, setExpandedRoom] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/hotels`);
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

  const handleRoomClick = (roomIndex) => {
    // Toggle the expanded room. If it's already expanded, set it to null to close it.
    setExpandedRoom((prevExpandedRoom) => (prevExpandedRoom === roomIndex ? null : roomIndex));
  };

  const filteredHotels = hotels.filter((hotel) => (
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!filterCriteria.stars || hotel.stars === parseInt(filterCriteria.stars, 10))
    // Add more filtering criteria here based on filterCriteria
  ));

  console.log("Number of filtered hotels:", filteredHotels.length);


  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'stars', headerName: 'Stars', width: 100 },
    { field: 'location', headerName: 'Location', width: 200 },
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'bookingRating', headerName: 'Booking Rating', width: 180 },
    { field: 'tripadvisorRating', headerName: 'TripAdvisor Rating', width: 220 },
    { field: 'googleRating', headerName: 'Google Rating', width: 150 },
    { field: 'totalRooms', headerName: 'Total Rooms', width: 150 },
    {
      field: 'details',
      headerName: 'Details',
      width: 150,
      renderCell: (params) => {
        const hotelId = params.row.hotelId; 
        if (!hotelId) return "N/A"; 
        return (
          <Link to={`/hotel/${hotelId}`}>
            <button>View Details</button>
          </Link>
        );
      }
    },
  ];

  const rows = filteredHotels.map((hotel, index) => ({
    id: index, // Using this as the unique ID for the DataGrid row
    hotelId: hotel._id,
    name: hotel.name,
    stars: hotel.stars,
    location: hotel.address.region,
    price: `${hotel.price} ${hotel.currency}`,
    bookingRating: hotel.bookingRating,
    tripadvisorRating: hotel.tripadvisorRating,
    googleRating: hotel.googleRating,
    totalRooms: hotel.totalRooms,
  }));

  return (
    <div>
      <h1>Hotel List</h1>
      <input
        type="text"
        placeholder="Search by hotel name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          // onRowClick={(params) => {
          //   const hotel = filteredHotels[params.rowIndex];
          //   handleHotelClick(hotel);
          // }}
        />
      </div>

      {selectedHotel && (
       <div>
       <h3>Room Information:</h3>
       {selectedHotel.hotelRooms.map((room, roomIndex) => (
         <div key={roomIndex} style={{ margin: '10px 0' }}>
           <button onClick={() => handleRoomClick(roomIndex)}>Room Type: {room.roomType}</button>
           {expandedRoom === roomIndex && (
             <div>
               <p>Room Size: {room.roomSize}</p>
               <p>Room Price: {room.roomPrice}</p>
               {/* Add more attributes for room */}
             </div>
           )}
         </div>
       ))}
     </div>
   )}
 </div>
);
}

export default HotelListPage;
