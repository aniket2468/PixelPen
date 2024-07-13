const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  type: String,
  provider: String,
  providerAccountId: String,
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String
});

accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

module.exports = mongoose.model('Account', accountSchema);
