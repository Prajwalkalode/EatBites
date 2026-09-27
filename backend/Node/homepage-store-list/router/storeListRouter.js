const express = require('express');
const router = express.Router();
const { getStores, addStore, deleteStore } = require('../controller/storeListController');

router.get('/stores', getStores);
router.post('/stores', addStore);
router.delete('/stores/:storeId', deleteStore);

router.get('/health', (req, res) => {
    return res.status(200).json({message: 'homepage-store-list health-status: ok!'});
});

module.exports = router;