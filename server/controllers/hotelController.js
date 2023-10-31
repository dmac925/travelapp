const Hotel = require('../models/hotelSchema');
const { processImages } = require('../utils/vision');


class hotelController {

    async findAll(req, res){
        try{
            const hotels = await Hotel.find();
            res.send(hotels);
        }
        catch(e){
            res.send({e});
        }
    }

    async findBrands(req, res) {
        try {
            const hotels = await Hotel.find().select('brand -_id');
            const uniqueBrands = [...new Set(hotels.map(hotel => hotel.brand))];
            res.send(uniqueBrands);
        } catch (e) {
            res.send({ e });
        }
    }

    async findOne(req ,res){
        let { hotel_id } = req.params;
        try{
            const hotel = await Hotel.findOne({_id:hotel_id});
            res.send(hotel);
        }
        catch(e){
            res.send({e});
        }
    }

    async insert(req, res) {
        const hotel = req.body;
        console.log(hotel);
    
        const renamedImages = await processImages(hotel);
        hotel.renamedImages = renamedImages;
    
        try {
          const done = await Hotel.create(hotel);
          res.send(done);
        } catch (e) {
          res.send({ e });
        }
      }

    async delete(req, res) {
        let { hotelId } = req.body;
        
        try{
            const removed = await Hotel.deleteOne({ _id: hotelId });
            
            res.send({removed});
        }
        catch(error){
            res.send({error});
        }
    }

    async update(req, res){
        let { hotelId, ...data } = req.body;
        
        try{
            const updated = await Hotel.updateOne({ _id: hotelId }, { $set: data });
            res.send({updated});
        }
        catch(error){
            res.send({error});
        }
    }

    getAverageRatings = async (req, res) => {
        const { hotel_id } = req.params;
    
        try {
            const hotel = await Hotel.findOne({ _id: hotel_id });
            const reviews = hotel.reviews;  
    
            if (!reviews) {
                return res.status(404).json({ error: 'Reviews not found for this hotel.' });
            }
    
            console.log("Fetched reviews:", reviews);
            const monthlyRatings = this.calculateAverageRatings(reviews);
            console.log("Calculated monthly ratings:", monthlyRatings);
    
            res.json(monthlyRatings);
        } catch (e) {
            console.error("Error in getAverageRatings:", e);
            res.status(500).json({ error: 'An error occurred while fetching average ratings.' });
        }
    }

    calculateAverageRatings(reviews) {
        const monthlyRatings = {};
    
        reviews.forEach(review => {
            const date = new Date(review.publishedAtDate);
            const monthYearKey = `${date.getMonth() + 1}-${date.getFullYear()}`; 
    
            if (!monthlyRatings[monthYearKey]) {
                monthlyRatings[monthYearKey] = {
                    totalRating: 0,
                    count: 0,
                };
            }
    
            monthlyRatings[monthYearKey].totalRating += review.stars;
            monthlyRatings[monthYearKey].count++;
        });
    
        const sortedKeys = Object.keys(monthlyRatings).sort();
        const averageRatings = sortedKeys.map(key => (monthlyRatings[key].totalRating / monthlyRatings[key].count).toFixed(2));
        const reviewCounts = sortedKeys.map(key => monthlyRatings[key].count); 
    
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
        };
    }

};

module.exports = new hotelController();
