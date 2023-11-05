const express = require('express'),
    router = express.Router(),
    controller = require('../controllers/hotelController');  
    const googleCloudStorage = require('../utils/cloudStorage');



router.get('/brands', controller.findBrands); 

router.post('/new', controller.insert);

router.post('/delete', controller.delete);

router.post('/update', controller.update);

router.get('/:hotel_id', controller.findOne);  

router.post('/generate-response', controller.getReviewResponse);

router.get('/:hotel_id/sentiment-analysis', controller.getSentimentAnalysis);

router.get('/:hotel_id/average-ratings', controller.getAverageRatings);

router.get('/', controller.findAll);

module.exports = router;
