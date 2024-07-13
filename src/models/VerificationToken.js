const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verificationTokenSchema = new Schema({
  identifier: { type: String, unique: true },
  token: { type: String, unique: true },
  expires: Date
});

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
