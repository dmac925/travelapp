const express = require('express');
const app = express();
require ("dotenv").config();
const port = process.env.PORT || 5060;
const mongoose = require("mongoose");

app.use(require("express").json());
app.use(express.urlencoded({ extended: false }));
app.use(require("cors")());

const path = require('path');

async function connecting(){
    try {
        await mongoose.connect(process.env.MONGO);
        console.log('Connected to the DB')
    } catch ( error ) {
        console.log('ERROR: Seems like your DB is not running, please start it up !!!');
    }
    }

    const cors = require('cors');
app.use(cors());

app.use("/users", require ("./routes/usersRoutes"));
app.use("/api", require("./routes/openai"));
app.use("/hotels", require ("./routes/hotelRoutes"));




app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '../taskapp/build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../taskapp/build', 'index.html'));
});

connecting().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);

    })
})
 