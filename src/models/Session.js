const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  sessionToken: { type: String, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  expires: Date
});

module.exports = mongoose.model('Session', sessionSchema);
