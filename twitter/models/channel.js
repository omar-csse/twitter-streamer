/*
    socket connection and subscribtion for channels will
    be handled here. On stream, the socket will join a room
    for streaming. The subscribe function will update the tweets
    and send them back to all clients who are connected to the 
    same channel. Also, socket.io-redis is used as an adapter for 
    sockets connection using elastic cashe Redis. 
*/

let db = require('./db');
let tweets = require('./tweets');
let StreamConnection = require('../config/streamdb');
let redis = require('socket.io-redis');
let redisConfig = require('../config/redis');

let ioInstcance;

let io = (io) => {  

    ioInstcance = io;
    io.adapter(redis({host: redisConfig.host, port: redisConfig.port, auth_pass: redisConfig.pass}));
    ioInstcance.adapter(redis({host: redisConfig.host, port: redisConfig.port, auth_pass: redisConfig.pass}));

    io.on('connection', (socket) => { 
        socket.on('subscribe', (data) => {
            console.log(`client with socket id: ${socket.id} subscribed to ${data.channel} channel`);
            subscribe(data.channel);
            socket.join(data.channel);  
        });
        socket.on('unsubscribe', (data) => {
            console.log(`client with socket id: ${socket.id} unsubscribed from ${data.channel} channel`);
            socket.leave(data.channel);
        });
        socket.on('stream', (data) => {
            if (!(JSON.parse(data.streamON))) {
                startStream(socket);
            }
        });
        socket.on('disconnect', () => {
            console.log(`client with socket id: ${socket.id} disconnected`);
            socket.conn.close();
        });
    });
};

let subscribe = (channel) => {
    tweets.updateTweets(channel).then(() => {
        db.getTweetsDB(channel)
        .then((tweets) => {
            ioInstcance.to(channel).emit('tweets', tweets);
        })
        .catch(err => io.to(channel).emit('error'));
    });
}

let startStream = (socket) => { 
    let allTweets = [];
    let stream = StreamConnection.db
        .collection('stream')
        .find({})
        .stream()
    stream.on('data', (data) => {
        allTweets = [];
        tweets.analyzeStream(data.tweet).then((analyzedTweet) => {
            allTweets.push(analyzedTweet);
        });
    });
    stream.on('error', (err) => {
        console.log(err);
    });
    socket.on('unstream', () => {
        stream.destroy();
        clearInterval(streamInterval);
    });
    socket.on('disconnect', () => {
        stream.destroy();
        clearInterval(streamInterval);
    });
    let streamInterval = setInterval(() =>{
        var nextTweet = allTweets.shift();
        if (nextTweet) {
            socket.emit('stream', {tweet: nextTweet});
        }
    }, 100);
}

let self = module.exports = {
    io: io,
}