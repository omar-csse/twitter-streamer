/*
    This file will create the server using express framework. 
    Also, join the server side with the static files using
    the express static built-in function.
*/
require('dotenv').config({path:'../.env'});
const path = require('path');
const express = require('express');
let app = express();

/* 
    mongodb config
*/
const Connection = require('../config/mongodb');

/*
    Get twitter streaming and link the static files
*/
app.use(express.static(path.join(__dirname, '../client/')));
let stream = require('../models/stream');

/*
    Define the port and the local host. 
    Set pug as the view engine 
*/
const port = 3000;
const localhost = '127.0.0.1';
app.set('view engine', 'pug');

/*
    Require the middlewares created in the routes folder.
    All the routes are seperated to keep the project organized.
*/
app.use(require('../routes/main').router);

/*
    Create the server after connecting to mongodb and strat streaming
*/
Connection.connectToDB().then(() => {
    let server = app.listen(port, () => {
        console.log(`listening to port: ${port} on http://${localhost}:${port}/`);
    });
    let io = require('socket.io').listen(server);
    require('../models/db').io(io);
    console.log('socket.io is connected');
    stream.stream();    
});