let db = require('./db');
let twitter = require('../config/twitter');
let alphabet = new Array( 26 ).fill( 1 ).map( ( _, i ) => String.fromCharCode( 97 + i ) );

module.exports.stream = () => {

    let stream = twitter.T.stream('statuses/filter', { track: alphabet, language: 'en'});
    stream.on('tweet', (tweet) => {
        db.updateStreamDB(tweet.text);
    });
    console.log(`Twitter streaming is on`);
}