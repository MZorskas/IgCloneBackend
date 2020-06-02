const UserModel = require('../models/userModel');
const PostModel = require('../models/postModel');

// changeProfilePicture = async (req, res) => {
// console.log(req.file);
// //   let user = req.user;
// user.profilePicture = `http://localhost:3000/${req.file.path}`;
//   let savedUser = await user.save();
//   console.log(await savedUser);
//   res.json(savedUser);
// };

createPost = async (req, res) => {
  let data = req.body;
  // console.log(data);
  console.log(req.file);
  try {
    let user = req.user;
    console.log(user);
    let post = new PostModel();
    post.title = data.title;

    post.user = user._id;
    // post.image = `http://localhost:3000/${req.file.path}`;

    // console.log(post.title);
    // console.log(post.user);

    let createdPost = await post.save();
    res.json(createdPost);
  } catch (e) {
    res.status(400).json(e);
  }
};

getSingleUserPost = async (req, res) => {
  let postId = req.params.postId;
  console.log(postId);
  try {
    let post = await PostModel.findOne({
      _id: postId,
      user: req.user._id,
    });
    res.json(post);
  } catch (e) {
    res.status(400).json(e);
  }
};

getAllUserPosts = async (req, res) => {
  try {
    // let user = await UserModel.findById(req.params.id);
    let user = req.user;
    console.log(user);
    let allPosts = await PostModel.find({
      user: user._id,
    });
    console.log(allPosts);
    res.json(allPosts);
  } catch (e) {
    res.status(400).json(e);
  }
};

deletePost = async (req, res) => {
  let postId = req.params.postId;
  try {
    let response = await PostModel.deleteOne({
      _id: postId,
      user: req.user._id,
    });
    console.log(response);
    if (response.deletedCount == 0) res.status(400).json('item doesnt exist');
    res.json('item deleted');
  } catch (e) {
    res.status(400).json('item cant be deleted');
  }
};

getSingleUserPost = async (req, res) => {
  let postId = req.params.postId;
  console.log(postId);
  try {
    let post = await PostModel.findOne({
      _id: postId,
      // user: req.user._id,
    });
    res.json(post);
    console.log(post);
  } catch (e) {
    res.status(400).json(e);
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

// function to like/unlike a post

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
  getSingleUserPost,
  getAllUsersPosts,
  getAllUserPosts,
  deletePost,
  likePost,
};
