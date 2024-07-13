const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true },
  title: String,
  desc: String,
  img: String,
  views: { type: Number, default: 0 },
  catSlug: { type: String, ref: 'Category' },
  userEmail: { type: String, ref: 'User' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

module.exports = mongoose.model('Post', postSchema);
