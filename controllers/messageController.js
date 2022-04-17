const Message = require('../models/message')


exports.get_form = function(req, res) {
    res.render("message-form", {user: req.user})
}
exports.post_form= function (req, res, next)  {
    const newmessage = new Message({
      title: req.body.title,
      text: req.body.message,
      user: req.user.id,
    });
    newmessage.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  };
  