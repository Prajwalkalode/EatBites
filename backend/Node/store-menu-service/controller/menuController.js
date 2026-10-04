const MenuItem = require('../model/menuItem');

const editableFields = [
    'itemName',
    'description',
    'price',
    'category',
    'isVeg',
    'itemImage',
    'isAvailable'
];

function getActiveItemFilter(req) {
    return {
        storeId: req.params.storeId,
        menuItemId: req.params.menuItemId,
        $or: [
            { isActive: true },
            { isActive: { $exists: false }, isDeleted: { $ne: true } }
        ]
    };
}

function getActorEmail(req, bodyField = 'updatedBy') {
    return req.user?.email ?? req.body?.[bodyField];
}

function handleWriteError(res, error, fallbackMessage) {
    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Menu item ID already exists for this store'
        });
    }

    const statusCode = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    return res.status(statusCode).json({
        success: false,
        message: statusCode === 400 ? error.message : fallbackMessage
    });
}

async function getMenuByStore(req, res) {
    const storeServiceUrl = process.env.STORE_SERVICE_URL?.replace(/\/$/, '');
    if (!storeServiceUrl) {
        return res.status(503).json({ success: false, message: 'Store service URL is not configured' });
    }

    try {
        const storeResponse = await fetch(
            `${storeServiceUrl}/stores/${encodeURIComponent(req.params.storeId)}`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (storeResponse.status === 404) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }
        if (!storeResponse.ok) {
            return res.status(502).json({ success: false, message: 'Unable to verify store' });
        }
    } catch (error) {
        return res.status(502).json({ success: false, message: 'Store service is unavailable' });
    }

    try {
        const menuItems = await MenuItem.find({
            storeId: req.params.storeId,
            $or: [
                { isActive: true },
                { isActive: { $exists: false }, isDeleted: { $ne: true } }
            ]
        });
        return res.status(200).json({ success: true, data: menuItems });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve store menu' });
    }
}

async function createMenuItem(req, res) {
    const { storeId } = req.params;
    const body = req.body;

    if (!storeId?.trim() || !body || Array.isArray(body) || typeof body !== 'object') {
        return res.status(400).json({ success: false, message: 'A store ID and menu item object are required' });
    }

    if (typeof body.menuItemId !== 'string' || !body.menuItemId.trim() ||
        typeof body.itemName !== 'string' || !body.itemName.trim() ||
        typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0) {
        return res.status(400).json({
            success: false,
            message: 'menuItemId, itemName, and a positive numeric price are required'
        });
    }

    try {
        const actorEmail = getActorEmail(req, 'createdBy');
        const menuItem = await MenuItem.create({
            menuItemId: body.menuItemId.trim(),
            storeId: storeId.trim(),
            itemName: body.itemName.trim(),
            description: body.description,
            price: body.price,
            category: body.category,
            isVeg: body.isVeg,
            itemImage: body.itemImage,
            isAvailable: body.isAvailable,
            isActive: true,
            createdBy: actorEmail,
            updatedBy: actorEmail
        });
        return res.status(201).json({ success: true, data: menuItem });
    } catch (error) {
        return handleWriteError(res, error, 'Failed to create menu item');
    }
}

async function updateMenuItem(req, res) {
    const updates = {};
    for (const field of editableFields) {
        if (Object.hasOwn(req.body ?? {}, field)) {
            updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'At least one editable field is required' });
    }

    if (Object.hasOwn(updates, 'price') &&
        (typeof updates.price !== 'number' || !Number.isFinite(updates.price) || updates.price <= 0)) {
        return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    const actorEmail = getActorEmail(req);
    if (actorEmail !== undefined) {
        updates.updatedBy = actorEmail;
    }

    try {
        const menuItem = await MenuItem.findOneAndUpdate(
            getActiveItemFilter(req),
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        );
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found for this store' });
        }
        return res.status(200).json({ success: true, data: menuItem });
    } catch (error) {
        return handleWriteError(res, error, 'Failed to update menu item');
    }
}

async function toggleMenuItemAvailability(req, res) {
    try {
        const actorEmail = getActorEmail(req);
        const setFields = {
            isAvailable: { $not: [{ $ifNull: ['$isAvailable', true] }] },
            updatedAt: new Date()
        };
        if (actorEmail !== undefined) {
            setFields.updatedBy = actorEmail;
        }

        const menuItem = await MenuItem.findOneAndUpdate(
            getActiveItemFilter(req),
            [{
                $set: setFields
            }],
            { returnDocument: 'after', runValidators: true, updatePipeline: true, timestamps: false }
        );
        
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found for this store' });
        }
        return res.status(200).json({ success: true, data: menuItem });
    } catch (error) {
        return handleWriteError(res, error, 'Failed to toggle menu item availability');
    }
}

async function softDeleteMenuItem(req, res) {
    try {
        const actorEmail = getActorEmail(req);
        const updates = { isActive: false };
        if (actorEmail !== undefined) {
            updates.updatedBy = actorEmail;
        }

        const menuItem = await MenuItem.findOneAndUpdate(
            getActiveItemFilter(req),
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        );
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found for this store' });
        }
        return res.status(200).json({ success: true, data: menuItem });
    } catch (error) {
        return handleWriteError(res, error, 'Failed to delete menu item');
    }
}

module.exports = {
    getMenuByStore,
    createMenuItem,
    updateMenuItem,
    toggleMenuItemAvailability,
    softDeleteMenuItem
};