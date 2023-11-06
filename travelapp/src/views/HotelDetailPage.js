import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { URL } from '../config'
import AverageRatings from './AverageRatings';
import ReviewTable from './ReviewTable';

function HotelDetailPage() {
  const [hotelDetail, setHotelDetail] = useState(null);
  const { hotelId } = useParams();

  useEffect(() => {
    const fetchHotelDetail = async () => {
      try {
        const response = await axios.get(`${URL}/hotels/${hotelId}`);
        setHotelDetail(response.data);
      } catch (error) {
        console.error('Error fetching hotel detail:', error);
      }
    };
    fetchHotelDetail();
  }, [hotelId]);

  const tableStyle = {
    width: '60%',
    margin: 'auto',
    borderCollapse: 'collapse',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
  };

  const thStyle = {
    backgroundColor: '#f4f4f4',
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left'
  };

  const tdStyle = {
    border: '1px solid #ddd',
    padding: '8px'
  };

  return (
    <div>
      {hotelDetail ? (
        <div>
          <h1 style={{ textAlign: 'center' }}>{hotelDetail.name} (ID: {hotelDetail._id})</h1>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <th style={thStyle}>Public Name</th>
                <td style={tdStyle}>{hotelDetail.name}</td>
              </tr>
              <tr>
                <th style={thStyle}>Hotel Rating</th>
                <td style={tdStyle}>{hotelDetail.hotelClass} Stars</td>
              </tr>
              <tr>
                <th style={thStyle}>Address</th>
                <td style={tdStyle}>{hotelDetail.address.full}</td>
              </tr>
              <tr>
                <th style={thStyle}>Phone</th>
                <td style={tdStyle}>{hotelDetail.phone}</td>
              </tr>
              <tr>
                <th style={thStyle}>Website</th>
                <td style={tdStyle}>
                  <a href={hotelDetail.website} target="_blank" rel="noopener noreferrer">{hotelDetail.website}</a>
                </td>
              </tr>
              <tr>
                <th style={thStyle}>Operating Hours</th>
                <td style={tdStyle}>Monday - Sunday: Placeholder Hours</td>
              </tr>
              <tr>
                <th style={thStyle}>Ratings</th>
                <td style={tdStyle}>
                  <div>Booking Rating: Placeholder Rating</div>
                  <div>TripAdvisor Rating: {hotelDetail.tripadvisorRating}</div>
                  <div>Google Rating: {hotelDetail.googleRating}</div>
                </td>
              </tr>
              <tr>
                <th style={thStyle}>Total Rooms</th>
                <td style={tdStyle}>{hotelDetail.totalRooms}</td>
              </tr>
              <tr>
                <th style={thStyle}>Email</th>
                <td style={tdStyle}>{hotelDetail.email}</td>
              </tr>
            </tbody>
          </table>

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
