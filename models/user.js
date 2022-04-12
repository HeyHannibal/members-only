var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, minlength: 5, maxlength: 100 },
  family_name: { type: String, required: true, minlength: 5, maxLength: 100 },
  username: { type: String, required: true, minlength: 5, maxLength: 100 },
  email: { type: String, required: true, minlength: 5, maxLength: 100 },
  password: { type: String, required: true, minlength: 5, maxLength: 100 },
  is_admin : Boolean,
});

module.exports = mongoose.model('User', UserSchema)