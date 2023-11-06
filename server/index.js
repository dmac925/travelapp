require ("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5060;
const mongoose = require("mongoose");

app.use(require("express").json());
app.use(express.urlencoded({ extended: false }));
app.use(require("cors")());

const path = require('path');

async function connecting() {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log('Connected to the DB')
    } catch (error) {
        console.log('ERROR: Seems like your DB is not running, please start it up !!!');
        console.error(error);
    }
}

const cors = require('cors');
app.use(cors());

// Add the cache prevention headers
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); 
    res.setHeader('Pragma', 'no-cache'); 
    res.setHeader('Expires', '0');
    next();
});

app.use("/users", require("./routes/usersRoutes"));
app.use("/api", require("./routes/openai"));
app.use("/hotels", require("./routes/hotelRoutes"));

// These should be the last:
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '../travelapp/build')));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../travelapp/build', 'index.html'));
});

connecting().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
});
