import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function AverageRatings() {
  const [monthlyRatings, setMonthlyRatings] = React.useState(null);
  const { hotelId } = useParams();

  React.useEffect(() => {
    const fetchAverageRatings = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/hotels/${hotelId}/average-ratings`);
        setMonthlyRatings(response.data);
      } catch (error) {
        console.error('Error fetching average ratings:', error);
      }
    };

    fetchAverageRatings();
  }, [hotelId]);

  function calculatePercentageChange(arr) {
    const changes = [null]; // The first item has no change from a previous value.

    for (let i = 1; i < arr.length; i++) {
      const previousValue = arr[i - 1];
      const currentValue = arr[i];
      if (previousValue === 0 || currentValue === 0) {
        changes.push(null); // Avoid division by zero or misleading 100% changes.
      } else {
        const change = ((currentValue - previousValue) / previousValue) * 100;
        changes.push(change.toFixed(2)); // Two decimal places for clarity.
      }
    }

    return changes;
  }

  if (!monthlyRatings) {
    return <p>Loading monthly ratings...</p>;
  }

  return (
    <div>
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
      {monthlyRatings && monthlyRatings.reviewTexts ? (
        <div style={{ margin: '20px 0' }}>
          <h2>Review Texts by Month</h2>
          {monthlyRatings.labels.map((label, index) => (
            <div key={index}>
              <h3>{label}</h3>
              <p>{monthlyRatings.reviewTexts[index]}</p>
              <p>Character Count: {monthlyRatings.reviewTexts[index].length}</p>
              <p>Word Count: {monthlyRatings.reviewTexts[index].split(' ').length}</p>
              {/* You can add more analysis here */}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading review texts...</p>
      )}
    </div>
  );
}

export default AverageRatings;
