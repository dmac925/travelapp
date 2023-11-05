import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './siteReviewTable.css';

const ReviewTable = () => {
  const [reviews, setReviews] = useState([]);
  const [scaleFactor, setScaleFactor] = useState(1);
  const { hotelId } = useParams();

  useEffect(() => {
    const fetchHotelDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/hotels/${hotelId}`);
        const hotelDetail = response.data;

        if (hotelDetail) {
          const reviewsData = [
            { platform: 'Google', rating: hotelDetail.googleRating, count: hotelDetail.googleReviewNum },
            { platform: 'Booking.com', rating: hotelDetail.bookingRating, count: hotelDetail.bookingReviewNum },
            { platform: 'Tripadvisor', rating: hotelDetail.tripadvisorRating, count: hotelDetail.tripadvisorReviewNum }
          ];

          const totalReviewCount = reviewsData.reduce((acc, review) => acc + review.count, 0);

          reviewsData.forEach((review) => {
            review.percentage = Math.round((review.count / totalReviewCount) * 100);
          });

          const sortedReviews = reviewsData.sort((a, b) => b.count - a.count);
          setReviews(sortedReviews);

          if (sortedReviews.length > 0) {
            setScaleFactor(100 / sortedReviews[0].percentage);
          }
        }
      } catch (error) {
        console.error('Error fetching hotel detail:', error);
      }
    };

    fetchHotelDetail();
  }, [hotelId]);

  return (
    <div className="review-table">
      <h2>Review Sites Distribution</h2>
      {reviews.map((review) => (
        <div className="review-row" key={review.platform}>
          <div className="platform">{review.platform}</div>
          <div className="rating">{review.rating} ⭐</div>
          <div className="bar" style={{ width: `${Math.min(100, review.percentage * scaleFactor)}%`, background: 'green' }}></div>
          <div className="count">{review.count} ({review.percentage}%)</div>
        </div>
      ))}
    </div>
  );
};

export default ReviewTable;
