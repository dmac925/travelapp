import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AverageRatings from './AverageRatings';
import ReviewTable from './ReviewTable';



function HotelDetailPage() {
  const [hotelDetail, setHotelDetail] = useState(null);
  const { hotelId } = useParams();

  useEffect(() => {
    const fetchHotelDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/hotels/${hotelId}`);
        setHotelDetail(response.data);
      } catch (error) {
        console.error('Error fetching hotel detail:', error);
      }
    };
    fetchHotelDetail();
  }, [hotelId]);

  return (
    <div>
      {hotelDetail ? (
        <div>
          <h1>{hotelDetail.name} (ID: {hotelDetail._id})</h1>
          
          {/* Basic Info */}
          <h3>Public Name</h3>
          <p>{hotelDetail.name}</p>

          <h3>Category</h3>
          <p>Hotel Class: {hotelDetail.hotelClass} Stars</p>

          <h3>Address</h3>
          <p>{hotelDetail.address.full}</p>

          <h3>Phone</h3>
          <p>{hotelDetail.phone}</p>

          <h3>Website</h3>
          <a href={hotelDetail.website} target="_blank" rel="noopener noreferrer">{hotelDetail.website}</a>

          <h3>Operating Hours</h3>
          {/* Placeholder for Operating Hours */}
          <p>Monday - Sunday: Placeholder Hours</p>

          {/* Ratings */}
          <h3>Ratings</h3>
          <p>Booking Rating: Placeholder Rating</p>
          <p>TripAdvisor Rating: {hotelDetail.tripadvisorRating}</p>
          <p>Google Rating: {hotelDetail.googleRating}</p>

          {/* Other Details */}
          <p>Total Rooms: {hotelDetail.totalRooms}</p>
          <p>Email: {hotelDetail.email}</p>

          {/* Review components */}
          <ReviewTable />
          <AverageRatings />
        </div>
      ) : (
        <p>Loading hotel details...</p>
      )}
    </div>
  );
}

export default HotelDetailPage;
