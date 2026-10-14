const { warehouse } = require('../models');

// Use after validateAdmin: lets only an Admin owner (warehouses.classifiedAId 1)
// through. Guards business plan endpoints that change prices or subscriptions.
module.exports = async function adminOwnerOnly(req, res, next) {
    let caller = null;
    try {
        caller = await warehouse.findByPk(req.user.id, {
            attributes: ['id', 'classifiedAId'],
        });
    } catch (error) {
        caller = null;
    }
    if (!caller || caller.classifiedAId !== 1) {
        return res.json({
            status: '0',
            message: 'Access Denied',
            data: {},
            error: 'Only an admin owner can do this',
        });
    }
    next();
};
