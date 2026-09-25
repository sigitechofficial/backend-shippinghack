require('dotenv').config()
const redis = require('redis');

const redisConfig = {
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    },
};

if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
}
if (process.env.REDIS_USERNAME) {
    redisConfig.username = process.env.REDIS_USERNAME;
}
if (process.env.REDIS_TLS === 'true') {
    redisConfig.socket.tls = true;
}

const redis_Client = redis.createClient(redisConfig);

redis_Client.on('connect', function(){
    console.log('redis client connected');
});
redis_Client.on('error', function(err){
    console.log('Redis error:', err.message);
});

(async function connect() {
    await redis_Client.connect();
})();

module.exports = redis_Client;
