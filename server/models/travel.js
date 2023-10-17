const mongoose = require('mongoose');
const { Schema } = mongoose;

const travelSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    airline: String,
    reservationCode: String,
    flightNumber: String,
    date: Date,
    departure: String,
    arrival: String,
    passengerName: String,
    seat: String,
    carryOnBaggage: String,
    checkedBaggage: String,
    dateOfPayment: Date,
    paymentMethod: String,
    cardNumber: String,
    cardHolder: String,
    paymentStatus: String,
    totalAmount: Number,  
    airlineProgram: String,
    airlineProgramNumber: String
});

const Travel = mongoose.model('Travel', travelSchema);
module.exports = Travel;

