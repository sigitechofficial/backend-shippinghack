require('dotenv').config();
const {verify} = require('jsonwebtoken');
const { warehouse } = require('../models');

// Roles (warehouses.classifiedAId): 1=Admin owner, 2=Admin employee,
// 3=Warehouse owner, 5=Warehouse employee.
//
// "Act as warehouse": an Admin owner may operate the warehouse panel scoped to a
// specific operational warehouse by sending an `x-warehouse-id` header. Every
// warehouse endpoint scopes by req.user.id, so resolving the effective id here —
// once, centrally — lets an admin drive all 108 endpoints with no per-endpoint
// change. The header is validated against a real, active operational warehouse
// and is honored ONLY for admin owners; non-admins are always locked to their
// own id.
module.exports = async function validateToken(req,res, next){
    try {
        const acccessToken = req.header('accessToken');
        //If no token -- Throw Error
        if(!acccessToken) throw new Error();
        // Verify Token , If not auto Throw Error
        const validToken = verify(acccessToken, process.env.JWT_ACCESS_SECRET);
        req.user = validToken;

        // Acting-as-warehouse applies ONLY to the warehouse panel. This same
        // middleware also guards the /admin and /merchant routers, which must
        // keep the admin's real identity — so gate the override on the mount.
        const actingHeader = req.header('x-warehouse-id');
        if (actingHeader && req.baseUrl === '/warehouse') {
            const caller = await warehouse.findByPk(req.user.id, {
                attributes: ['id', 'classifiedAId'],
            });
            // Only an Admin owner may impersonate a warehouse.
            if (caller && caller.classifiedAId === 1) {
                const actingId = parseInt(actingHeader, 10);
                const target = Number.isInteger(actingId)
                    ? await warehouse.findOne({
                        where: { id: actingId, classifiedAId: 3, status: true },
                        attributes: ['id'],
                    })
                    : null;
                if (!target) {
                    return res.json({
                        status: '0',
                        message: 'Access Denied',
                        data: {},
                        error: 'Invalid warehouse selection',
                    });
                }
                req.adminId = req.user.id;         // preserve real identity (audit)
                req.actingWarehouseId = target.id; // for any endpoint that wants it
                req.user.id = target.id;           // scope all downstream queries
            }
            // Non-admins: ignore the header entirely.
        }
        next();
    } catch (error) {
        return res.json({
            status: '0',
            message: 'Access Denied',
            data: {},
            error: 'You are not authorized to access it',
        })
    }
}

//redis_Client.del(key);