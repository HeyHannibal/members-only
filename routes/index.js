var express = require('express');
var router = express.Router();
const Message = require("../models/message");


/* GET home page. */
router.get('/', function(req, res, next) {  
    Message.find({})
      .sort({date : 1})
      .populate('user')
      .exec(function (err, messages) {
        if (err) {return next(err); }
        console.log(req.user)
        res.render('index', {user: req.user, messages: messages, })
      })

  }
);

module.exports = router;
