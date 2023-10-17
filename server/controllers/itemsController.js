const Tasks = require('../models/tasks');
const Users = require('../models/users'); 
const Items = require('../models/items');

class itemsController {

    async findAll(req, res){
        try{
            const items = await Items.find();
            res.send(items);
        }
        catch(e){
            res.send({e})
        }
    }

    async findCategories(req, res) {
        try {
            const tasks = await Items.find().select('category -_id');
            const uniqueCategories = [...new Set(items.map(task => item.category))];
            res.send(uniqueCategories);
        } catch (e) {
            res.send({ e });
        }
    }

    async findUserItemsEmail(req, res) {
        const { email } = req.body;
        try {
            const user = await Users.findOne({ email }); 
            if (!user) {
                return res.send({ error: "User not found" });
            }
            const tasks = await Items.find({ user_id: user._id });
            res.send(items);
        } catch (e) {
            res.send({ e });
        }
    }

    async findUserItems(req, res){
        const { user_id } = req.body; 
        try {
            const tasks = await Items.find({ user_id }); 
            res.send(items);
        }
        catch(e) {
            res.send({ e });
        }
    }

    async findOne(req ,res){
        let { item_id} = req.params;
        try{
            const task = await Items.findOne({_id:item_id});
            res.send(items);
        }
        catch(e){
            res.send({e})
        }

    }

    async insert (req, res) {
        const item = req.body;
        console.log(item);
        try{
            const done = await Items.create(item);
            res.send(done)
        }
        catch(e){
            res.send({e})
        }
    }

    async taskStatus(req, res) {
        const { itemId, newStatus } = req.body;
        try {
          const updated = await Items.updateOne({ _id: itemId }, { $set: { status: newStatus } });
          res.send({ updated });
        } catch (error) {
          res.send({ error });
        }
      }

    async delete (req, res){
        let { taskId } = req.body;
        
        try{
            const removed = await Items.deleteOne({ _id: itemId });
            
            res.send({removed});
        }
        catch(error){
            res.send({error});
        };
    }
    
    async update (req, res){
        let { itemId, title, price, description, status, category }  = req.body;
        try{
            const updated = await Items.updateOne(
                { _id: itemId },
                { $set: { title, price, description, status, category } } 
            );
            res.send({updated});
        }
        catch(error){
            res.send({error});
        };
    }


};
module.exports = new itemsController();