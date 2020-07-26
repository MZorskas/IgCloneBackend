const PostModel = require('../models/postModel');
const CommentModel = require('../models/commentModel');

postNewComment = async (req, res) => {
  let postId = req.params.postId;
  let userId = req.user._id;

  try {
    let post = await PostModel.findOne({
      _id: postId,
    });
    if (!post) return res.json('Post not found');

    let comment = await CommentModel.create({
      user: userId,
      post: postId,
      text: req.body.text,
    });

    post.comments.push(comment._id);
    post.commentsCount = post.commentsCount + 1;

    await post.save();

    comment = await comment
      .populate({ path: 'user', select: 'profilePicture username' })
      .populate({ path: 'post', select: 'user' })
      .execPopulate();

    // console.log(comment);

    res.json({ success: 'Comment created', comment });
  } catch (e) {
    res.status(400).json({ failure: 'Something went wrong', error: e });
  }
};

deleteComment = async (req, res) => {
  let commentId = req.params.commentId;

  try {
    let comment = await CommentModel.deleteOne({
      _id: commentId,
      user: req.user._id,
    });

    // console.log(comment);

    if (comment.deletedCount === 0)
      res.status(400).json('Comment doesnt exist');
    res.json({ success: 'Comment deleted', commentId });
  } catch (e) {
    res.status(400).json({ failure: 'Something went wrong', error: e });
  }
};

toggleLikeComment = async (req, res) => {
  let commentId = req.params.commentId;
  let userId = req.user._id;

  try {
    let comment = await CommentModel.findOne({ _id: commentId });
    if (!comment)
      return res
        .status(400)
        .json({ failure: 'Comment doesnt exist', error: e });

    let postId = comment.post._id;

    if (comment.likes.includes(userId)) {
      comment = await comment.updateOne({
        $inc: { likesCount: -1 },
        $pull: { likes: userId },
      });
      res.json({ success: 'Comment unliked', commentId, userId, postId });
    } else {
      comment = await comment.updateOne({
        $inc: { likesCount: 1 },
        $push: { likes: userId },
      });
      res.json({ success: 'Comment liked', commentId, userId, postId });
    }
  } catch (e) {
    res.status(400).json({ failure: 'Something went wrong', error: e });
  }
};

module.exports = {
  postNewComment,
  deleteComment,
  toggleLikeComment,
};
