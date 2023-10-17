async function saveDataToDatabase(req, res, Model) {
    try {
        const newEntry = new Model(req.body);
        const savedEntry = await newEntry.save();
        res.status(200).json(savedEntry);
    } catch (error) {
        console.error("Database save error:", error);
        res.status(500).json({ error: 'Failed to save data.' });
    }
}

module.exports = {
    saveDataToDatabase
};