var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.user) console.log(req.user.username)
  res.render('index', { title: 'Auth-test', user: req.user });
});

module.exports = router;
