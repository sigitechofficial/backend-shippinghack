require('dotenv').config();
const { warehouse, permission } = require('../models');

module.exports = async function validatePermission(req, res, next) {
    try {
        const userData = await warehouse.findByPk(req.user.id, {
            attributes: ['classifiedAId', 'roleId']
        });
        console.log("🚀 ~ validatePermission ~ userData:", userData);
        let method = req.method.toLowerCase();
        method = method === 'get' ? 'read' : method === 'post' ? 'create' : method === 'put' ? 'update' : method;
        
        if (userData.classifiedAId === 1) {
            return next();
        } else {
            
            const featureId = req.query.featureId || req.body.featureId;
            console.log("🚀 ~ validatePermission ~ featureId:", featureId)
            
            
            const feature = req.user.featureData.find(f => f.id === parseInt(featureId));
            console.log("🚀 ~ validatePermission ~ feature:", feature)
            if (!feature) {
                return res.json({
                    status: '0',
                    message: 'Access Denied',
                    data: {},
                    error: 'Feature not found or no access',
                });
            }
            
            const permissionData = await permission.findAll({
                where: { featureId: featureId, roleId: userData.roleId },
                attributes: ['permissionType']
            });
            console.log("🚀 ~ validatePermission ~ permissionData:", permissionData)
            
            // Determine if the user has the required permission
            console.log("Have the user have the required permission");
            
            const hasAccess = permissionData.some(ele => ele.permissionType === method);
            if (!hasAccess) {
                throw new Error('Access Denied');
            }
            
            return next();  
        }
    } catch (error) {
        return res.json({
            status: '0',
            message: 'Access Denied',
            data: {},
            error: 'You are not authorized to access it',
        });
    }
}

//redis_Client.del(key);