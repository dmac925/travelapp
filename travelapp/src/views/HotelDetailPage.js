import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';



function HotelDetailPage() {
  const [hotelDetail, setHotelDetail] = useState(null);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [monthlyRatings, setMonthlyRatings] = useState(null); // Define monthlyRatings state
  const { hotelId } = useParams();

  useEffect(() => {
    const fetchHotelDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/hotels/${hotelId}`);
        setHotelDetail(response.data);
      } catch (error) {
        console.error('Error fetching hotel detail:', error);
      }
    }
    fetchHotelDetail();
}, [hotelId]);

    const fetchAverageRatings = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/hotels/${hotelId}/average-ratings`);
        console.log(monthlyRatings);
        setMonthlyRatings(response.data);
      } catch (error) {
        console.error('Error fetching average ratings:', error);
      }
    };

    useEffect(() => {
        if (hotelDetail) {
            fetchAverageRatings();
        }
    }, [hotelDetail]);

    useEffect(() => {
        console.log(monthlyRatings);
    }, [monthlyRatings]);

  const handleRoomClick = (roomIndex) => {
    // Toggle the expanded room. If it's already expanded, set it to null to close it.
    setExpandedRoom((prevExpandedRoom) => (prevExpandedRoom === roomIndex ? null : roomIndex));
  };

  function calculatePercentageChange(arr) {
    const changes = [null];  // The first item has no change from a previous value.
  
    for (let i = 1; i < arr.length; i++) {
      const previousValue = arr[i - 1];
      const currentValue = arr[i];
      if (previousValue === 0 || currentValue === 0) {
        changes.push(null);  // Avoid division by zero or misleading 100% changes.
      } else {
        const change = ((currentValue - previousValue) / previousValue) * 100;
        changes.push(change.toFixed(2));  // Two decimal places for clarity.
      }
    }
  
    return changes;
  }


  return (
    <div>
      {hotelDetail ? (
        <div>
          <h1>{hotelDetail.name}</h1>
          <p>Stars: {hotelDetail.hotelClass}</p>
          <p>Location: {hotelDetail.address.region}</p>
          <p>Price: {hotelDetail.price} {hotelDetail.currency}</p>
          <p>Booking Rating: {hotelDetail.bookingRating}</p>
          <p>TripAdvisor Rating: {hotelDetail.tripadvisorRating}</p>
          <p>Google Rating: {hotelDetail.googleRating}</p>
          <p>Total Rooms: {hotelDetail.totalRooms}</p>
  
          <h2>Rooms</h2>
          {hotelDetail.hotelRooms.map((room, roomIndex) => (
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
          
          {monthlyRatings && monthlyRatings.labels && monthlyRatings.datasets ? (
            <div style={{ margin: '20px 0' }}>
              <h2>Average Ratings Over Time</h2>
              <table border="1">
                <thead>
                  <tr>
                    <th>Month</th>
                    {monthlyRatings.labels.map((label, index) => (
                      <th key={index}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyRatings.datasets.map((dataset, dsIndex) => {
                    const percentageChanges = calculatePercentageChange(dataset.data);
                    return (
                      <React.Fragment key={`data-${dsIndex}`}>
                        <tr>
                          <td>{dataset.label}</td>
                          {dataset.data.map((value, valueIndex) => (
                            <td key={valueIndex}>{value}</td>
                          ))}
                        </tr>
                        <tr>
                          <td>Percentage Change</td>
                          {percentageChanges.map((change, changeIndex) => (
                            <td key={changeIndex}>{change ? `${change}%` : '-'}</td>
                          ))}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Loading monthly ratings...</p>
          )}
        </div>
      ) : (
        <p>Loading hotel details...</p>
      )}
    </div>
  );
      }


export default HotelDetailPage;
