const { Schema, model } = require('mongoose');

const isEmail = require('validator/lib/isEmail');

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [isEmail, 'Please enter a valid email address'],
    },
    thoughts: [{type: Schema.Types.ObjectId, ref: 'thought'}],
    friends: [{type: Schema.Types.ObjectId, ref: 'user'}],
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
  }
);

userSchema.virtual('friendCount').get(function () {
  return this.friends.length;
});

const User = model('user', userSchema);

module.exports = {User, userSchema};
