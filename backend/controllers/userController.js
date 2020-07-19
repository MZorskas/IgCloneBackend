const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { secretPassword } = require('../config/config');

register = async (req, res) => {
  let data = req.body;
  let user = new UserModel();
  console.log(data);
  console.log(data.phoneNumber);
  // if (!data.email) {
  //   user.phoneNumber = data.phoneNumber;
  // } else if (!data.phoneNumber) {
  //   user.email = data.email;
  // }
  // data.email
  //   ? (user.email = data.email)
  //   : (user.phoneNumber = data.phoneNumber);
  user.email = data.email;
  user.fullName = data.fullName;
  user.username = data.username;
  user.password = data.password;
  user.dateOfBirth = data.dateOfBirth;
  try {
    let createdUser = await user.save();
    let role = 'userRole';
    let token = jwt.sign({ id: user._id }, secretPassword);
    console.log(token);
    user.token = token;
    user.tokens.push({ role, token });
    user.save();
    console.log('labas');
    res.header('x-auth-IG', token).json(user);
  } catch (e) {
    console.log(e);
    if (e.code === 11000)
      return res
        .status(400)
        .json(`This ${Object.keys(e.keyValue)[0]} is already taken. Try again`);

    res.status(400).json(e);
  }
};

login = async (req, res) => {
  let data = req.body;
  try {
    let user = await UserModel.findOne({
      $or: [
        { username: data.username },
        {
          $and: [
            { email: data.email },
            {
              email: { $ne: null },
            },
          ],
        },
        {
          $and: [
            { phoneNumber: data.phoneNumber },
            {
              phoneNumber: { $ne: null },
            },
          ],
        },
      ],
    });
    console.log(user);

    const match = await bcrypt.compare(data.password, user.password);
    if (!match || !user)
      return res.status(400).json('Login failed, wrong user credentials');
    let role = 'userRole';
    let token = jwt.sign({ id: user._id }, secretPassword);
    console.log(token);
    user.tokens.push({ role, token });

    user.save();
    res.header('x-auth-IG', token).json(user);
    console.log('labas');

    // res.json(user);
  } catch (e) {
    res.status(400).json('Login failed, wrong user credentials');
  }
};

loginWithStorage = async (req, res) => {
  let user = req.user;
  console.log('Storage', user);
  try {
    let role = 'userRole';
    let token = jwt.sign({ id: user._id }, secretPassword);
    console.log(token);
    user.tokens.push({ role, token });
    user.save();
    res.header('x-auth-IG', token).json(user);
  } catch (e) {
    res.status(400).json(e);
  }
};

changePassword = async (req, res) => {
  let data = req.body;
  console.log(data);
  try {
    let user = req.user;
    const match = await bcrypt.compare(data.oldPassword, user.password);
    if (!match) return res.status(400).json('Wrong old password');
    if (data.newPassword != data.repeatNewPassword)
      return res.status(400).json('New passwords do not match');
    user.password = data.newPassword;
    await user.save();
    res.json({ success: 'Password changed!', password: user.password });
  } catch (e) {
    res.status(400).json(e);
  }
};

editInfo = async (req, res) => {
  let data = req.body;
  console.log(data);
  try {
    let user = req.user;
    if (data.fullName) {
      user.fullName = data.fullName;
    }
    if (data.bio) {
      user.bio = data.bio;
    }
    await user.save();
    res.json({
      success: 'Information edited!',
      fullName: user.fullName,
      bio: user.bio,
    });
  } catch (e) {
    res.status(400).json(e);
  }
};

getSingleUserByUsername = async (req, res) => {
  let username = req.params.username;
  console.log(username);

  try {
    let user = await UserModel.findOne({ username: username });
    if (!user) return res.status(400).json('This user doesnt exist');
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
};

getActiveUser = async (req, res) => {
  try {
    let user = req.user;
    if (!user) return res.status(400).json('This user doesnt exist');
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
};

getAllUsers = async (req, res) => {
  console.log(req.user);

  try {
    let allUsers = await UserModel.find();
    res.json(allUsers);
  } catch (e) {
    res.status(400).json(e);
  }
};

getAllUsersExceptFollowing = async (req, res) => {
  try {
    let allUsers = await UserModel.find({
      followers: { $ne: req.user._id },
      _id: { $ne: req.user._id },
    })
      .select('profilePicture username fullName followers following')
      .exec();
    res.json(allUsers);
  } catch (e) {
    res.status(400).json(e);
  }
};

getAllFollowingUsers = async (req, res) => {
  let username = req.params.username;
  try {
    let user = await UserModel.findOne({ username: username });
    if (!user) return res.status(400).json('This user doesnt exist');

    let followingUsers = await UserModel.find({ followers: user._id })
      .select('profilePicture username fullName followers following')
      .exec();

    res.json(followingUsers);
  } catch (e) {
    res.status(400).json(e);
  }
};

getAllFollowers = async (req, res) => {
  let username = req.params.username;
  console.log(username);
  try {
    let user = await UserModel.findOne({ username: username });
    if (!user) return res.status(400).json('This user doesnt exist');

    let followers = await UserModel.find({ following: user._id })
      .select('profilePicture username fullName followers following')
      .exec();

    res.json(followers);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
};

logout = async (req, res) => {
  let user = req.user;
  let token = req.token;
  console.log('logout', user);
  await user.update({
    $pull: {
      tokens: {
        token: token,
        // $slice: ['$token', -1],
      },
    },
  });
  res.json('successfully signed out');
};

addPhoneNumber = async (req, res) => {
  try {
    let user = req.user;
    let token = req.token;
    let data = req.body;
    console.log(user);
    user.phoneNumber = data.phoneNumber;
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
};

addEmail = async (req, res) => {
  try {
    let user = req.user;
    let token = req.token;
    let data = req.body;
    console.log(user);
    user.email = data.email;
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
};

changeProfilePicture = async (req, res) => {
  let data = req.body;
  console.log(data);
  console.log(req.file);
  let user = req.user;
  user.profilePicture = `http://localhost:3001/${req.file.path}`;
  let savedUser = await user.save();
  console.log(await savedUser);
  res.json(savedUser);
};

toggleFollow = async (req, res) => {
  try {
    let reqUser = req.user;
    let reqUserId = req.user._id;
    let targetUserId = req.params.userId;

    // check if your (reqUser) id doesn't match the id of the user(targetUser) you want to follow/unfollow
    if (reqUserId == targetUserId) {
      return res.status(400).json('You cannot follow/unfollow yourself');
    }

    if (reqUser.following.includes(targetUserId)) {
      let TargetUser = await UserModel.findOneAndUpdate(
        { _id: targetUserId },
        {
          $pull: { followers: reqUserId },
          $inc: { followersCount: -1 },
        }
      );

      let ReqUser = await UserModel.findOneAndUpdate(
        { _id: reqUserId },
        {
          $pull: { following: targetUserId },
          $inc: { followingCount: -1 },
        }
      );
      res
        .status(200)
        .json({ success: 'User unfollowed', targetUserId, reqUserId });
    } else {
      let TargetUser = await UserModel.findOneAndUpdate(
        { _id: targetUserId },
        {
          $push: {
            followers: reqUserId,
          },
          $inc: { followersCount: 1 },
        }
      );
      let ReqUser = await UserModel.findOneAndUpdate(
        { _id: reqUserId },
        {
          $push: {
            following: targetUserId,
          },
          $inc: { followingCount: 1 },
        }
      );
      res
        .status(200)
        .json({ success: 'User followed', targetUserId, reqUserId });
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

searchUser = async (req, res) => {
  let input = req.body.input;
  try {
    let results = await UserModel.find({
      $or: [{ username: { $regex: input } }, { fullName: { $regex: input } }],
    })
      .select('profilePicture username fullName')
      .limit(5)
      .exec();
    if (!results) return res.json('No results found.');
    console.log(results);
    res.json(results);
  } catch (e) {
    res.status(400).json(e);
  }
};

module.exports = {
  register,
  getAllUsers,
  getActiveUser,
  login,
  changePassword,
  logout,
  addPhoneNumber,
  addEmail,
  changeProfilePicture,
  toggleFollow,
  getSingleUserByUsername,
  loginWithStorage,
  getAllFollowingUsers,
  getAllFollowers,
  getAllUsersExceptFollowing,
  changePassword,
  editInfo,
  searchUser,
};
