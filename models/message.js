var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    title: { type: String, required: true, minlength: 5, maxlength: 100 },
    text:  { type: String, required: true, minlength: 5, maxlength: 400 },
    date: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Message', MessageSchema)