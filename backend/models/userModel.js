const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    // required: [true, 'Please enter your full name'],
    required: true,
  },
  username: {
    type: String,
    minlength: 5,
    unique: true,
    // required: [true, 'Please enter your username'],
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
    // required: [true, 'Please enter your username'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  dateOfBirth: { type: Date },
  profilePicture: {
    type: String,
    default:
      'https://pngimage.net/wp-content/uploads/2018/06/no-user-image-png.png',
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  followingCount: {
    type: Number,
    default: 0,
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followersCount: {
    type: Number,
    default: 0,
  },
  bio: {
    type: String,
  },
  token: {
    type: String,
  },
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
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
