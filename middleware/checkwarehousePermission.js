require('dotenv').config();
const {
    warehouse, permission
} = require('../models');
module.exports = async function validateToken(req,res, next){
    try {
        let userData = await warehouse.findByPk(req.user.id, {
            attributes: ['classifiedAId', 'roleId']
        });
        console.log("🚀 ~ validateToken ~ userData:", userData)
        let method = req.method.toLowerCase();
        method = method === 'get'? 'read': method === 'post'? 'create': method === 'put'? 'update': method;   
        // Warehouse owner (3) and Admin owner (1) get full access. An admin
        // "acting as" a warehouse already has req.user.id overridden to the
        // warehouse (classifiedAId 3) by validateAdmin; this also covers the
        // warehouse routes that don't run the acting-scope override.
        if(userData.classifiedAId === 3 || userData.classifiedAId === 1) next()
        else{
            // featureId may arrive as a query param or (for multipart/body-only POSTs) in the body
            const featureId = req.query.featureId || (req.body && req.body.featureId);
            const permissionData = await permission.findAll({where: {featureId, roleId: userData.roleId}, attributes: ['permissionType']})
            let hasAcsess = permissionData.some(ele=> ele.permissionType === method);
            if(!hasAcsess) throw Error();
            next();
        }
    } catch (error) {
        return res.json({
            status: '0',
            message: 'Access Denied',
            data: {},
            error: 'You are not authorized to access it',
        })  
    }
}