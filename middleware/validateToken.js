require('dotenv').config();
const {verify} = require('jsonwebtoken');
//importing redis
const redis_Client = require('../routes/redis_connect')
module.exports = async function validateToken(req,res, next){
    try {
        const accessToken = req.header('accessToken');
        console.log(accessToken);
        console.log("URL--------------------->",req.url);
        //If no token -- Throw Error
        if(!accessToken) throw new Error();
        // Verify Token , If not auto Throw Error
        const validToken = verify(accessToken, process.env.JWT_ACCESS_SECRET);
        const redis_Token = await redis_Client.hGetAll(`tsh${validToken.id}`);
        //console.log("language==================>",redis_Token)
        if(!redis_Token) throw new Error();
        let dvToken = validToken.dvToken;
        const redis_valid = verify(redis_Token[dvToken], process.env.JWT_ACCESS_SECRET);
        req.user = redis_valid;
        console.log("language==================>",redis_valid)
        req.user.language=redis_Token.language || redis_valid.language
        next();
    } catch (error) {
        return res.json({
            status: '0',
            message: 'Access Denied',
            data: {error},
            error: 'You are not authorized to access it',
        })  
    }
}

//redis_Client.del(key);