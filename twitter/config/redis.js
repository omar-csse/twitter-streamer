/*
    Redis (AWS elasticcashe) configuration
*/

let config = {
    host: process.env.REDIS_URI,
    port: process.env.REDIS_PORT,
    pass: process.env.REDIS_PASSWORD
}

module.exports = config;
