const PostModel = require('../models/postModel');
const UserModel = require('../models/userModel');
const CommentModel = require('../models/commentModel');

createPost = async (req, res) => {
  let data = req.body;
  try {
    let user = req.user;
    console.log(user);
    let post = new PostModel();
    console.log('1', data.description);
    console.log('2', req.file.path);
    post.description = data.description;
    post.user = user._id;
    post.image = `http://localhost:3001/${req.file.path}`;
    // console.log(post.title);
    // console.log(post.user);
    post = await post.save();

    // let post = await PostModel.create({
    //   user: user._id,
    //   description: data.description,
    //   image: `http://localhost:3001/${req.file.path}`,
    // });

    // let comment = await CommentModel.create({
    //   user: userId,
    //   post: postId,
    //   text: req.body.text,
    // });
    // // console.log('COMMENT', comment);
    // post.comments.push(comment._id);
    // post.commentsCount = post.commentsCount + 1;
    // await post.save();

    post = await post
      .populate({ path: 'user', select: 'profilePicture username' })
      .execPopulate();

    console.log({ data: post });
    await res.json(post);
  } catch (e) {
    res.status(400).json(e);
  }
};

getAllUserPostsByUsername = async (req, res) => {
  let username = req.params.username;
  console.log(username);
  try {
    let user = await UserModel.findOne({ username: username });
    let allPosts = await PostModel.find({
      user: user._id,
    })
      .populate({
        path: 'comments',
        select: 'text',
        populate: {
          path: 'user',
          select: 'username profilePicture',
        },
      })
      .populate({ path: 'user', select: 'profilePicture username' })
      .lean()
      .exec();

    // allPosts.map((post) =>
    //   post
    //     .populate({ path: 'user', select: 'profilePicture username' })
    //     .execPopulate()
    // );

    // .populate({ path: 'user', select: 'profilePicture username' })
    // .execPopulate();
    console.log(allPosts);
    res.json(allPosts);
  } catch (e) {
    res.status(400).json(e);
  }
};

deletePost = async (req, res) => {
  let postId = req.params.postId;
  try {
    let post = await PostModel.deleteOne({
      _id: postId,
      user: req.user._id,
    });
    console.log(post);
    if (post.deletedCount == 0) res.status(400).json('Post doesnt exist');
    res.json('Post deleted');
  } catch (e) {
    res.status(400).json('Post cant be deleted');
  }
};

getSinglePost = async (req, res) => {
  let postId = req.params.postId;
  console.log(postId);
  try {
    let post = await PostModel.findById(postId)
      .populate({
        path: 'comments',
        select: 'text',
        populate: {
          path: 'user',
          select: 'username profilePicture',
        },
      })
      .populate({
        path: 'user',
        select: 'username profilePicture',
      })

      .lean()
      .exec();

    if (!post) return res.json('Post not found');
    res.json(post);
    console.log(post);
  } catch (e) {
    res.status(400).json(e);
  }
};

postNewComment = async (req, res) => {
  let postId = req.params.postId;
  let userId = req.user._id;

  try {
    console.log(postId);
    let post = await PostModel.findOne({
      _id: postId,
    });
    if (!post) return res.json('Post not found');

    let comment = await CommentModel.create({
      user: userId,
      post: postId,
      text: req.body.text,
    });
    // console.log('COMMENT', comment);
    post.comments.push(comment._id);
    post.commentsCount = post.commentsCount + 1;
    await post.save();

    comment = await comment
      .populate({ path: 'user', select: 'profilePicture username' })
      .execPopulate();
    // console.log(comment.user.profilePicture);
    // console.log(comment.user.username);
    console.log({ data: comment });
    res.json({ data: comment });
  } catch (e) {
    res.status(400).json(e);
  }
};

deleteComment = async (req, res) => {
  let commentId = req.params.commentId;
  console.log('delete Comment user ', req.user._id);
  try {
    let comment = await CommentModel.deleteOne({
      _id: commentId,
      user: req.user._id,
    });
    console.log(comment);
    if (comment.deletedCount === 0)
      res.status(400).json('Comment doesnt exist');
    // console.log(comment.user.profilePicture);
    // console.log(comment.user.username);
    res.json({ success: 'Comment deleted', commentId });
  } catch (e) {
    res.status(400).json('Comment cant be deleted');
  }
};

getAllUsersPosts = async (req, res) => {
  try {
    // let user = await UserModel.findById(req.params.id);
    let user = req.user;
    console.log(user);
    let allPosts = await PostModel.find({});
    console.log(allPosts);
    res.json(allPosts);
  } catch (e) {
    res.status(400).json(e);
  }
};

// "like/unlike a post"

likePost = async (req, res) => {
  let postId = req.params.postId;
  let userId = req.user._id;
  try {
    let post = await PostModel.findOne({ _id: postId });

    post.likes.includes(userId)
      ? (post = await post.updateOne({
          $inc: { likeCount: -1 },
          $pull: { likes: userId },
        }))
      : (post = await post.updateOne({
          $inc: { likeCount: 1 },
          $push: { likes: userId },
        }));

    console.log(post);

    res.json(post);
  } catch (e) {
    res.status(400).json('Post already liked');
  }
};

module.exports = {
  createPost,
  getSinglePost,
  getAllUsersPosts,
  getAllUserPostsByUsername,
  deletePost,
  likePost,
  postNewComment,
  deleteComment,
};
