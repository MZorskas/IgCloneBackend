const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  description: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  commentsCount: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;
