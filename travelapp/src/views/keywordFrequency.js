import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const KeywordFrequency = () => {
  const [chartData, setChartData] = useState([]);

  const hotelId = '654277c1abc0c6a7612d8b1a'; // Define hotelId here

  useEffect(() => {
    const fetchSentimentAnalysis = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/hotels/${hotelId}/sentiment-analysis`);
        const transformedData = transformDataForChart(response.data);
        setChartData(transformedData);
      } catch (error) {
        console.error('Error fetching sentiment analysis data:', error);
      }
    };

    fetchSentimentAnalysis();
  }, []);

  const transformDataForChart = (sentimentAnalysis) => {
    return sentimentAnalysis.map((monthAnalysis) => {
      const monthData = { month: monthAnalysis.monthYear };
      monthAnalysis.sentimentAnalysis.categories.forEach((category) => {
        category.keywords.forEach((keyword) => {
          const key = `${keyword.keyword} (${keyword.sentiment})`;
          monthData[key] = (monthData[key] || 0) + keyword.mentions;
        });
      });
      return monthData;
    });
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        {chartData.length > 0 && Object.keys(chartData[0]).filter(key => key !== 'month').map((key, index) => (
          <Bar key={key} dataKey={key} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default KeywordFrequency;
