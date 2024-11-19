require('dotenv').config();
const {verify} = require('jsonwebtoken');
module.exports = async function validateToken(req,res, next){
    try {
        const acccessToken = req.header('accessToken');
        console.log("URL--------------------->",req.url);
        //If no token -- Throw Error
        if(!acccessToken) throw new Error();
        // Verify Token , If not auto Throw Error
        const validToken = verify(acccessToken, process.env.JWT_ACCESS_SECRET);
        console.log("🚀 ~ validateToken ~ validToken:", validToken)
        req.user = validToken;
        next();
    } catch (error) {
        console.log("Validate Token ERROR==============>");
        
        return res.json({
            status: '0',
            message: 'Access Denied',
            data: {},
            error: 'You are not authorized to access it',
        })  
    }
}

//redis_Client.del(key);