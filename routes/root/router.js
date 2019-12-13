/** @module root/router */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    let worldData = res.app.locals.worldData;
    
    res.render('index', { worldData });
    res.end();
});

router.get('/help', (req, res) => {
    res.render('help_page');
    res.end();
});

/** router for /root */
module.exports = router;
