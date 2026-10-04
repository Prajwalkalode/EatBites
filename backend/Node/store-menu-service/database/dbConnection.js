const mongoose = require('mongoose');

async function connectDB() {
    if (!process.env.MONGO_URL) {
        throw new Error('MongoDB URL is not configured!');
    }

    await mongoose.connect(process.env.MONGO_URL);
}

module.exports = connectDB;