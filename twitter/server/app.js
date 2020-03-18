/*
    This file will create the server using express framework. 
    Also, join the server side with the static files using
    the express static built-in function.
*/
require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
let bodyParser = require('body-parser')
const cors = require('cors');

/* 
    mongodb config
*/
const TweetsConnection = require('../config/tweetsdb');
const StreamConnection = require('../config/streamdb');

/*
    Streaming
*/
const stream = require('../models/channel');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../client/')));

/*
    Define the port and the local host. 
    Set pug as the view engine 
*/
const port = process.env.PORT || 3020;
app.set('view engine', 'pug');

/*
    Require the middlewares created in the routes folder.
    All the routes are seperated to keep the project organized.
*/
app.use(require('../routes/main').router);

/*
    Handle the forbidden as well as the not found routes.
    If an error occured in one of the APIs, the 500 error
    will be shown.
*/
app.all('/api*', (req, res, next) => {
    res.status(403);
    next(err);
});
app.get('*', function (req, res) {
    res.status(404);
    next(err);
});
app.use((err, req, res, next) => {
    res.status(res.statusCode || 500);
    res.render(path.join(__dirname, '../client/html/error'), {
        status: res.statusCode
    });
});

/*
    Create the server after connecting to mongodb
*/
const main = async () => {
    await StreamConnection.connectToDB();
    await TweetsConnection.connectToDB();
    const server = app.listen(port);
    let io = require('socket.io').listen(server);
    require('../models/channel').io(io);
    stream.startStreaming(io);
    console.log('socket.io is connected');
    return `🚀  Twitter sentiment analysis is on, and app is running on http://127.0.0.1:${port}/`   
}

main().then(console.log)