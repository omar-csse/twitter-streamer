/*
    This model for updating the tweets as well as getting the tweets
*/

let TweetsConnection = require('../config/tweetsdb');

module.exports.getTweetsDB = (query) => {
    return TweetsConnection.db
        .collection('tweets')
        .findOne({key: query})
        .then(data => {return data})
        .catch(err => console.log(err));
}

module.exports.updateTweetsDB = (query, analyzedTweets) => {

    let db = TweetsConnection.db.collection('tweets');

    return new Promise((resolve, reject) => {
        db.findOne({
            key: query
        }, (err, dbData) => {
            if (err) {
                console.log(err);
                return reject('error in updateTweetsDB');
            } else if (dbData) {
                resolve(db.updateOne({key: query}, {$addToSet: {'tweets': {$each: analyzedTweets}}}));
            } else {
                let dbData = {
                    key: query,
                    tweets: analyzedTweets
                }
                resolve(db.insertOne(dbData));
            }
        });
    });
}