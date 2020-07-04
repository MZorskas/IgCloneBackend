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
  '/user/followUser/:id',
  middleware.authenticate,
  userController.followUser
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
// router.get(
//   '/post/getAllUserPostsByUsername/:username',
//   middleware.authenticate,
//   postController.getAllUserPostsByUsername
// );
router.get('/post/getSinglePost/:postId', postController.getSinglePost);

router.post(
  '/post/deletePost/:postId',
  middleware.authenticate,
  postController.deletePost
);
router.post(
  '/post/likePost/:postId',
  middleware.authenticate,
  postController.likePost
);

router.get(
  '/post/getAllUsersPosts/',
  middleware.authenticate,
  postController.getAllUsersPosts
);

router.get(
  '/post/getAllPosts/:page/:limit',
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

module.exports = router;
