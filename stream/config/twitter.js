let Twit = require('twit');

const configTwitterAPI = async () => {
    module.exports.T = new Twit({
        consumer_key: process.env.TWIT_CONSUMER_KEY,
        consumer_secret: process.env.TWIT_CONSUMER_SECRET,
        access_token: process.env.TWIT_ACCESS_TOKEN,
        access_token_secret: process.env.TWIT_ACCESS_TOKEN_SECRET,
        timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
        strictSSL: true, // optional - requires SSL certificates to be valid.
    });
}

module.exports = {
    configTwitterAPI: configTwitterAPI
}