const User = require("../models/user");

exports.get_membership = function (req, res) {
  res.render("member-form");
};
exports.post_membership = function (req, res) {
  if (req.body.secretword === process.env.supersecretpassword) {
    User.findByIdAndUpdate(req.user._id, { is_member: true }).exec(
      (err, result) => {
        if (err) {
          next(err);
        }
        console.log(result);
        req.user.is_member = true;
        res.redirect("/");
      }
    );
  } else res.redirect("/");
};
