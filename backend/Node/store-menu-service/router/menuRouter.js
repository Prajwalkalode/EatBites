const express = require('express');
const {
    getMenuByStore,
    createMenuItem,
    updateMenuItem,
    toggleMenuItemAvailability,
    softDeleteMenuItem
} = require('../controller/menuController');

const router = express.Router();

router.post('/stores/:storeId/addItem', createMenuItem);
router.put('/stores/:storeId/menu/:menuItemId', updateMenuItem);
router.patch('/stores/:storeId/menu/:menuItemId/availability', toggleMenuItemAvailability);
router.delete('/stores/:storeId/menu/:menuItemId', softDeleteMenuItem);

router.get('/health', (req, res) => {
    return res.status(200).json({ message: 'store-menu-service health-status: ok!' });
});

router.get('/:storeId', getMenuByStore);

module.exports = router;