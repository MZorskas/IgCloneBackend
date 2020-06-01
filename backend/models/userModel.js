const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    minlength: 5,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    // sparse: true,
  },
  phoneNumber: {
    type: Number,
    minlength: 9,
    required: false,
    unique: true,
    // sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  dateOfBirth: { type: Date },
  profilePicture: {
    type: String,
  },
  following: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  followers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
      },
      role: {
        type: String,
      },
    },
  ],
});

UserSchema.pre('save', function (next) {
  let user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(user.password, salt, function (err, hash) {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
