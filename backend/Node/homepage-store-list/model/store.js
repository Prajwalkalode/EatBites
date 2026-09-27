const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
	storeId: String,
	storeName: String,
	storeImage: String,
	pureVeg: Boolean,
	ratings: Number
});

module.exports = mongoose.model('Store', storeSchema);
