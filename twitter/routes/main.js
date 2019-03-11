/*
    the main route (the main webpage).
*/
const router = require('express').Router();
const path = require('path');

router.get('/', (req, res) => {
    res.render(path.join(__dirname, '../client/html/main'));
});

module.exports = {
    router: router,
}