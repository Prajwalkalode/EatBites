const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    menuItemId: { type: String, required: true, trim: true },
    storeId: { type: String, required: true, trim: true },
    itemName: { type: String, required: true, trim: true },
    description: String,
    price: {
        type: Number,
        required: true,
        validate: {
            validator: price => price > 0,
            message: 'Price must be a positive number'
        }
    },
    category: String,
    isVeg: Boolean,
    itemImage: String,
    isAvailable: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
});

menuItemSchema.index({ storeId: 1, menuItemId: 1 }, { unique: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);