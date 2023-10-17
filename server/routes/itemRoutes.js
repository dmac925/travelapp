const express     = require('express'),
    router        = express.Router(),
    controller    = require('../controllers/itemsController');


router.get('/', controller.findAll);

router.get('/categories', controller.findCategories);

router.post('/userItemsEmail', controller.findUserItemsEmail);

router.post('/userItems', controller.findUserItems);

router.post('/new', controller.insert);

router.post('/delete', controller.delete);

router.post('/update', controller.update);

router.get('/:task_id', controller.findOne);



module.exports = router;