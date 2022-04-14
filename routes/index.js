var express = require('express');
var router = express.Router();
const Message = require("../models/message");


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.user) {
    Message.find({})
      .sort({date : 1})
      .populate('user')
      .exec(function (err, messages) {
        if (err) {return next(err); }
        console.log(messages)
        res.render('index', {user: req.user, messages: messages, })
      })

  }
  else res.render('index', { title: 'Auth-test', user: req.user });
});

module.exports = router;
