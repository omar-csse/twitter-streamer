/*
    This file will create the server using express framework. 
    Also, join the server side with the static files using
    the express static built-in function.
*/
require('dotenv').config()
const path = require('path');
const express = require('express');
const app = express();
const helmet = require('helmet')

app.use(helmet())

/* 
    mongodb config
*/
const StreamConnection = require('../config/mongodb');

/* 
    twitter config
*/
const twitter = require('../config/twitter');

/*
    Get twitter streaming and link the static files
*/
app.use(express.static(path.join(__dirname, '../client/')));
let stream = require('../models/stream');

/*
    Define the port and the local host. 
    Set pug as the view engine 
*/
const port = process.env.PORT || 3030;
app.set('view engine', 'pug');

/*
    Require the middlewares created in the routes folder.
    All the routes are seperated to keep the project organized.
*/
app.use(require('../routes/main').router);

/*
    Create the server after connecting to mongodb and strat streaming
*/

const main = async () => {
    await StreamConnection.connectToDB();
    const server = app.listen(port);
    let io = require('socket.io').listen(server);
    require('../models/db').io(io);
    console.log('socket.io is connected');
    stream.stream();
    return `🚀  Stream is on, and app is running on http://127.0.0.1:${port}/`   
}

main().then(console.log)