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
  data.email
    ? (user.email = data.email)
    : (user.phoneNumber = data.phoneNumber);
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
  // console.log(user);
  console.log(data);
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
    // console.log(data);
    console.log(user);
    // console.log(user.phoneNumber);

    // if (!user) return res.status(400).json('No such user');
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

getAllUsers = async (req, res) => {
  console.log(req.user);

  try {
    let allUsers = await UserModel.find();
    res.json(allUsers);
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

changePassword = async (req, res) => {
  let data = req.body;
  let user = await UserModel.findOne({
    email: data.email,
  });
  if (user === null) return res.status(400).json('Invalid email, please relog');
  const match = await bcrypt.compare(data.oldPassword, user.password);
  if (!match) return res.status(400).json('Wrong password');
  if (data.newPassword != data.repeatNewPassword)
    return res.status(400).json('Passwords do not  match');
  console.log(user);
  user.password = data.newPassword;
  await user.save();
  console.log(user);
  res.json('Password changed');
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

followUser = async (req, res) => {
  try {
    let reqUser = req.user;
    let reqUserId = req.user._id;
    let targetUserId = req.params.id;

    // check if your (reqUser) id doesn't match the id of the user(targetUser) you want to follow/unfollow
    if (reqUserId == targetUserId) {
      return res.status(400).json('You cannot follow/unfollow yourself');
    }

    if (reqUser.following.includes(targetUserId)) {
      let TargetUser = await UserModel.findOneAndUpdate(
        { _id: targetUserId },
        {
          $pull: { followers: reqUserId },
        }
      );

      let ReqUser = await UserModel.findOneAndUpdate(
        { _id: reqUserId },
        {
          $pull: { following: targetUserId },
        }
      );
      res.status(200).json(TargetUser);
    } else {
      let TargetUser = await UserModel.findOneAndUpdate(
        { _id: targetUserId },
        {
          $push: {
            followers: reqUserId,
          },
        }
      );
      let ReqUser = await UserModel.findOneAndUpdate(
        { _id: reqUserId },
        {
          $push: {
            following: targetUserId,
          },
        }
      );
      res.status(200).json(TargetUser);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

module.exports = {
  register,
  getAllUsers,
  login,
  changePassword,
  logout,
  addPhoneNumber,
  addEmail,
  changeProfilePicture,
  followUser,
  getSingleUserByUsername,
  loginWithStorage,
};
