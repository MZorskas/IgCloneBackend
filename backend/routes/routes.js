const router = require('express').Router();
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({
  storage: storage,
});

const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const middleware = require('../middleware/middleware');

router.post('/firstPost', (req, res) => {
  let data = req.body;
  console.log(data);
  res.json('success');
});

//user routes
router.post('/user/register', userController.register);
router.get(
  '/user/getSingleUserByUsername/:username',
  userController.getSingleUserByUsername
);
router.get(
  '/user/getAllUsers',
  middleware.authenticate,
  userController.getAllUsers
);

router.get(
  '/user/getAllFollowingUsers/:username',
  middleware.authenticate,
  userController.getAllFollowingUsers
);

router.get(
  '/user/getAllFollowers/:username',
  middleware.authenticate,
  userController.getAllFollowers
);

router.get(
  '/user/getAllUsersExceptFollowing/',
  middleware.authenticate,
  userController.getAllUsersExceptFollowing
);

router.post('/user/login', userController.login);
router.post(
  '/user/loginWithStorage',
  middleware.authenticate,
  userController.loginWithStorage
);
router.post('/user/logout', middleware.authenticate, userController.logout);

router.post(
  '/user/addPhoneNumber',
  middleware.authenticate,
  userController.addPhoneNumber
);
router.post('/user/addEmail', middleware.authenticate, userController.addEmail);

router.post(
  '/user/changeProfilePicture',
  middleware.authenticate,
  upload.single('profilePicture'),
  userController.changeProfilePicture
);

router.post(
  '/user/toggleFollow/:userId',
  middleware.authenticate,
  userController.toggleFollow
);

//post routes
router.post(
  '/post/createPost',
  middleware.authenticate,
  upload.single('postFile'),
  postController.createPost
);
router.get(
  '/post/getAllUserPostsByUsername/:username',
  postController.getAllUserPostsByUsername
);

router.get(
  '/post/getSavedPosts/:page',
  middleware.authenticate,
  postController.getSavedPosts
);

router.get(
  '/post/getAllFollowingUsersPosts/:page',
  middleware.authenticate,
  postController.getAllFollowingUsersPosts
);

router.get(
  '/post/getAllExplorePosts/:page',
  middleware.authenticate,
  postController.getAllExplorePosts
);

router.get('/post/getSinglePost/:postId', postController.getSinglePost);

router.post(
  '/post/deletePost/:postId',
  middleware.authenticate,
  postController.deletePost
);
router.post(
  '/post/toggleLike/:postId',
  middleware.authenticate,
  postController.toggleLike
);

router.get(
  '/post/getAllUsersPosts/',
  middleware.authenticate,
  postController.getAllUsersPosts
);

router.get(
  '/post/getAllPosts/:page',
  middleware.authenticate,
  postController.getAllPosts
);

router.post(
  '/post/postNewComment/:postId',
  middleware.authenticate,
  postController.postNewComment
);
router.post(
  '/post/deleteComment/:commentId',
  middleware.authenticate,
  postController.deleteComment
);

router.post(
  '/post/toggleSave/:postId',
  middleware.authenticate,
  postController.toggleSave
);

module.exports = router;
