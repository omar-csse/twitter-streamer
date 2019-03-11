const Connection = require('../config/mongodb');

let ioInstance;

module.exports.io = (io) => {
    ioInstance = io;
}

module.exports.updateStreamDB = async (tweet) => {
    let db = Connection.db.collection('stream');
    await db.insertOne({tweet: tweet});
    let count = await db.find({}).count();
    ioInstance.emit('tweets', {tweets: count});
}