const calculateAverageRatings = (reviews) => {
    const monthlyRatings = {};
    const monthlyReviewTexts = {}; 

    reviews.forEach(review => {
        const date = new Date(review.publishedAtDate);
        const monthYearKey = `${date.getMonth() + 1}-${date.getFullYear()}`; 

        if (!monthlyRatings[monthYearKey]) {
            monthlyRatings[monthYearKey] = {
                totalRating: 0,
                count: 0,
            };
            monthlyReviewTexts[monthYearKey] = []; 
        }

        monthlyRatings[monthYearKey].totalRating += review.stars;
        monthlyRatings[monthYearKey].count++;
        monthlyReviewTexts[monthYearKey].push(review.text); 
    });

    const sortedKeys = Object.keys(monthlyRatings).sort();
    const averageRatings = sortedKeys.map(key => (monthlyRatings[key].totalRating / monthlyRatings[key].count).toFixed(2));
    const reviewCounts = sortedKeys.map(key => monthlyRatings[key].count); 
    const reviewTexts = sortedKeys.map(key => monthlyReviewTexts[key].join(" ")); 

    return {
        labels: sortedKeys,
        datasets: [{
            label: 'Average Rating',
            data: averageRatings,
            backgroundColor: 'rgba(75,192,192,0.2)', 
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
        },
        {
            label: 'Review Count', 
            data: reviewCounts,
            backgroundColor: 'rgba(255,99,132,0.2)', 
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
        }],
        reviewTexts: reviewTexts 
    };
};

module.exports = calculateAverageRatings;
