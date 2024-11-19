require('dotenv').config();
const {
    warehouse, permission
} = require('../models');
module.exports = async function validateToken(req,res, next){
    try {
        let userData = await warehouse.findByPk(req.user.id, {
            attributes: ['classifiedAId', 'roleId']
        });
        let method = req.method.toLowerCase();
        method = method === 'get'? 'read': method === 'post'? 'create': method === 'put'? 'update': method;   
        if(userData.classifiedAId === 1) next()
        else{
            const permissionData = await permission.findAll({where: {featureId: req.query.featureId, roleId: userData.roleId}, attributes: ['permissionType']})
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

//redis_Client.del(key);