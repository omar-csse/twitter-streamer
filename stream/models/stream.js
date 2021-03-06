let db = require('./db');
let T = require('../config/twitter');
let alphabet = new Array( 26 ).fill( 1 ).map( ( _, i ) => String.fromCharCode( 97 + i ) );

module.exports.stream = () => {

    let stream = T.stream('statuses/filter', { track: alphabet, language: 'en'});
    stream.on('tweet', (tweet) => {
        db.updateStreamDB(tweet.text);
    });

    stream.on('error', (err) => {
        console.log(err);
    });

    console.log(`Twitter streaming is on`);
}