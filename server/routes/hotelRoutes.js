const express = require('express'),
    router = express.Router(),
    controller = require('../controllers/hotelController');  
    const googleCloudStorage = require('../utils/cloudStorage');



router.get('/brands', controller.findBrands); 

router.post('/new', controller.insert);

router.post('/delete', controller.delete);

router.post('/update', controller.update);

router.get('/:hotel_id', controller.findOne);  

router.get('/:hotel_id/average-ratings', controller.getAverageRatings);

router.get('/', controller.findAll);

module.exports = router;
