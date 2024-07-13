const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  desc: String,
  userEmail: { type: String, ref: 'User' },
  postSlug: { type: String, ref: 'Post' }
});

module.exports = mongoose.model('Comment', commentSchema);
