import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KeywordCard from './KeywordCard';
import './KeywordContainer.css'; // if you have styles

const KeywordContainer = () => {
    const [keywords, setKeywords] = useState([]);
    const [filteredKeywords, setFilteredKeywords] = useState([]);
    const [dateFilter, setDateFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [dates, setDates] = useState([]);
    const hotelId = '654277c1abc0c6a7612d8b1a'; // Define hotelId here

    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/hotels/${hotelId}/sentiment-analysis`);
                const data = response.data;
        
                const allCategories = [];
                const allDates = [];
                const keywordsData = data.flatMap(monthAnalysis => {
                    allDates.push(monthAnalysis.monthYear);
                    return monthAnalysis.sentimentAnalysis.categories.flatMap(category => {
                        if (category.category && !allCategories.includes(category.category)) {
                            allCategories.push(category.category);
                        }
                        return category.keywords.map(keyword => ({
                            monthYear: monthAnalysis.monthYear,
                            category: category.category,
                            keyword: keyword.keyword,
                            positive: keyword.sentiment === 'Positive' ? keyword.mentions : 0,
                            negative: keyword.sentiment === 'Negative' ? keyword.mentions : 0
                        }));
                    });
                });

                setDates(Array.from(new Set(allDates)));
                setCategories(allCategories);
                setKeywords(keywordsData);
                setFilteredKeywords(keywordsData);
            } catch (error) {
                console.error('Error fetching keywords data:', error);
            }
        };

        fetchKeywords();
    }, []);

    useEffect(() => {
        const applyFilters = () => {
            let filtered = keywords;
            if (dateFilter) {
                filtered = filtered.filter(keyword => keyword.monthYear === dateFilter);
            }
            if (categoryFilter) {
                filtered = filtered.filter(keyword => keyword.category === categoryFilter);
            }
            setFilteredKeywords(filtered);
        };

        applyFilters();
    }, [dateFilter, categoryFilter, keywords]);

    if (!keywords.length) {
        return <div>Loading...</div>;
    }

    return (
        <div className="keywords-container">
            <div className="filters">
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                    <option value="">All Dates</option>
                    {dates.map((date, index) => (
                        <option key={index} value={date}>{date}</option>
                    ))}
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
            </div>
            {filteredKeywords.map((data, index) => (
                <KeywordCard
                    key={index}
                    keyword={data.keyword}
                    positive={data.positive}
                    negative={data.negative}
                />
            ))}
        </div>
    );
};

export default KeywordContainer;
