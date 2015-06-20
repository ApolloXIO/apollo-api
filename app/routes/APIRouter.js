var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
	res.send('You Made It!');
});

module.exports = router;