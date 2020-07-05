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

    user = await UserModel.findOneAndUpdate(
      { _id: user._id },
      {
        $push: { posts: post._id },
        $inc: { postCount: 1 },
      }
    );
    // const updated = await UserModel.findOneAndUpdate(
    //   {
    //     _id: req.params.id,
    //     // following: { $not: { $elemMatch: { $eq: user._id } } },
    //   }
    //   // {
    //   //   $addToSet: {
    //   //     following: user._id,
    //   //   },
    //   // }
    // );

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

    await res.json({
      success: 'Post created',
      post,
      user: req.user.username,
    });
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
    let post = await PostModel.findOne({ _id: postId });

    if (!post) return res.status(401).json('Post not found');

    console.log(post.user);
    console.log(req.user._id);
    if (post.user.toString() != req.user._id.toString())
      return res.status(401).json('You are not authorized to delete this post');

    await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      {
        $pull: { posts: post._id },
        $inc: { postCount: -1 },
      }
    );
    // console.log(post);
    // if (post.deletedCount == 0) res.status(400).json('Post doesnt exist');
    await post.remove();

    res.json({
      success: 'Post deleted',
      post: postId,
      user: req.user.username,
    });
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
    //Find all posts except req user
    let allPosts = await PostModel.find({ user: { $ne: req.user._id } })
      .limit(10)
      .sort({
        creationDate: -1,
      });
    console.log(allPosts);
    res.json(allPosts);
  } catch (e) {
    res.status(400).json(e);
  }
};

getAllPosts = async (req, res) => {
  console.log('x');
  try {
    // let user = await UserModel.findById(req.params.id);
    let user = req.user;
    let page = Number(req.params.page);
    let limit = 9;
    let skip = (page - 1) * limit;
    //Find all posts except req user
    let allPosts = await PostModel.find({ user: { $ne: req.user._id } })
      .limit(limit)
      .skip(skip)
      .sort({
        creationDate: -1,
      });
    console.log(allPosts);
    res.json(allPosts);
  } catch (e) {
    res.status(400).json(e);
    console.log(e);
  }
};

// "like/unlike a post"

toggleLike = async (req, res) => {
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

toggleSave = async (req, res) => {
  let postId = req.params.postId;
  let userId = req.user._id;
  console.log('ToggleSave userId:', userId);
  console.log('ToggleSave postId:', postId);
  try {
    let post = await PostModel.findOne({ _id: postId });
    console.log('ToggleSave post:', post);
    if (!post) return res.status(401).json('Post not found');
    let user = await UserModel.findOne({ _id: userId });

    if (post.saves.includes(userId)) {
      post = await post.updateOne({
        $inc: { savesCount: -1 },
        $pull: { saves: userId },
      });

      user = await user.updateOne({
        $pull: { savedPosts: postId },
      });

      res.status(200).json({ success: 'Post removed', postId, userId });
    } else {
      post = await post.updateOne({
        $inc: { savesCount: 1 },
        $push: { saves: userId },
      });

      user = await user.updateOne({
        $push: { savedPosts: postId },
      });

      res.status(200).json({ success: 'Post saved', postId, userId });
    }
  } catch (e) {
    res.status(400).json(e);
  }
};

//Remove post from saved list
removePost = async (req, res) => {
  let postId = req.params.postId;
  let userId = req.user._id;
  try {
    let post = await PostModel.findOne({ _id: postId });

    console.log(post);

    res.json(post);
  } catch (e) {
    res.status(400).json(e);
  }
};

module.exports = {
  createPost,
  getSinglePost,
  getAllUsersPosts,
  getAllUserPostsByUsername,
  deletePost,
  toggleLike,
  postNewComment,
  deleteComment,
  getAllPosts,
  toggleSave,
};
