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

};

module.exports = new hotelController();
