const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    minlength: 3,
  },
  image: {
    type: String,
    required: false,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;
