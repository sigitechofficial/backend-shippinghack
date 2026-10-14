const { warehouse } = require('../models');

// Use after validateAdmin: lets only an Admin owner (warehouses.classifiedAId 1)
// through. Guards business plan endpoints that change prices or subscriptions.
module.exports = async function adminOwnerOnly(req, res, next) {
    let caller = null;
    try {
        caller = await warehouse.findByPk(req.user.id, {
            attributes: ['id', 'classifiedAId', 'email'],
        });
    } catch (error) {
        caller = null;
    }
    // Customer, driver and admin tokens share one signing secret and their ids
    // overlap, so the id alone proves nothing: the token must also be an
    // admin-panel token (it carries featureData) for this admin's own email.
    const isAdminToken =
        Array.isArray(req.user && req.user.featureData) &&
        caller &&
        String(caller.email || '').toLowerCase() === String(req.user.email || '').toLowerCase();
    if (!caller || caller.classifiedAId !== 1 || !isAdminToken) {
        return res.json({
            status: '0',
            message: 'Access Denied',
            data: {},
            error: 'Only an admin owner can do this',
        });
    }
    next();
};
