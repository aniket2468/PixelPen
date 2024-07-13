import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: String,
  facebookId: String,
  githubId: String,
  name: String,
  email: { type: String, unique: true },
  emailVerified: Date,
  image: String,
  accounts: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }],
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

const User = mongoose.model('User', userSchema);
export default User;
