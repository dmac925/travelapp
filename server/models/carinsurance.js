const mongoose = require('mongoose');

const carInsuranceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: false},
    description: { type: String, required: false },
    status: {type:String, required: false},
    due: { type: Date, required: false },
    reminder: { type: Date, required: false },
    completed: { type: Date, required: false },
    category: { type: String, required: true, unique: false },
    user_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"users"}
 
  });
  
  module.exports = mongoose.model("carInsurance", carInsuranceSchema);