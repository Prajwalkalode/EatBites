const Store = require('../model/store');

async function getStores(req, res) {
	try {
		const stores = await Store.find();
		return res.status(200).json(stores);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to retrieve stores' });
	}
}

async function getStoreById(req, res) {
	try {
		const store = await Store.findOne({ storeId: req.params.storeId });
		if (!store) {
			return res.status(404).json({ message: 'Store not found' });
		}
		return res.status(200).json(store);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to retrieve store' });
	}
}

async function addStore(req, res) {
	try {
		const requiredFields = ['storeId', 'storeName', 'storeImage', 'pureVeg', 'ratings'];
		const missingFields = requiredFields.filter(field => {
			const value = req.body?.[field];
			return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
		});

		if (missingFields.length > 0) {
			const error = new Error(`Missing required attributes: ${missingFields.join(', ')}`);
			error.statusCode = 400;
			throw error;
		}

		const store = await Store.create(req.body);
		return res.status(201).json(store);
	} catch (error) {
		const statusCode = error.statusCode || 500;
		const message = statusCode === 400 ? error.message : 'Failed to add store';
		return res.status(statusCode).json({ message });
	}
}

async function deleteStore(req, res) {
	try {
		const store = await Store.findOneAndDelete({ storeId: req.params.storeId });
		if (!store) {
			return res.status(404).json({ message: 'Store not found' });
		}
		return res.status(200).json({ message: 'Store deleted successfully', store });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to delete store' });
	}
}

module.exports = { getStores, getStoreById, addStore, deleteStore };
