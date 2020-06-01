const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { secretPassword } = require('../config/config');

register = async (req, res) => {
  let data = req.body;
  let user = new UserModel();
  console.log(data);
  console.log(data.phoneNumber);
  data.email
    ? (user.email = data.email)
    : (user.phoneNumber = data.phoneNumber);
  user.fullName = data.fullName;
  user.username = data.username;
  user.password = data.password;

  try {
    let createdUser = await user.save();
    let role = 'userRole';
    let token = jwt.sign({ id: user._id }, secretPassword);
    console.log(token);
    user.tokens.push({ role, token });
    user.save();
    console.log('labas');
    res.header('x-auth-IG', token).json(user);
  } catch (e) {
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

    if (!user) return res.status(400).json('No such user');
    const match = await bcrypt.compare(data.password, user.password);
    if (!match) return res.status(400).json('Wrong password');
    let role = 'userRole';
    let token = jwt.sign({ id: user._id }, secretPassword);
    console.log(token);
    user.tokens.push({ role, token });

    user.save();
    res.header('x-auth-IG', token).json(user);
    console.log('labas');

    // res.json(user);
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

changePassword = async (req, res) => {
  let data = req.body;
  let user = await UserModel.findOne({
    email: data.email,
  });
  if (!user) return res.status(400).json('Invalid email, please relog');
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

// getSingleUser = async (req, res) => {

// }

logout = async (req, res) => {
  let user = req.user;
  let token = req.token;
  await user.update({
    $pull: {
      tokens: {
        token: token,
      },
    },
  });
  res.json('successfully signed out');
};

addDateOfBirth = async (req, res) => {
  try {
    let user = req.user;
    let token = req.token;
    let data = req.body;
    console.log(user);
    user.dateOfBirth = data.dateOfBirth;
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(400).json(e);
  }
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
  user.profilePicture = `http://localhost:3000/${req.file.path}`;
  let savedUser = await user.save();
  console.log(await savedUser);
  res.json(savedUser);
};

followUser = async (req, res) => {
  //   try {
  //     let user = req.user;
  //     let id = req.params.id;
  //     // console.log(req.user._id);
  //     // console.log(req.params.id);
  //     // check if your id doesn't match the id of the user you want to follow
  //     if (user._id == id) {
  //       return res.status(400).json('You cannot follow yourself');
  //     }
  //     // add the id of the user you want to follow in following array
  //     const query = {
  //       _id: user._id,
  //       following: { $not: { $elemMatch: { $eq: id } } },
  //     };
  //     const update = {
  //       $addToSet: {
  //         following: id,
  //       },
  //     };
  //     const updated = await UserModel.findOneAndUpdate(query, update);
  //     // // add your id to the followers array of the user you want to follow
  //     // const secondQuery = {
  //     //   _id: id,
  //     //   followers: { $not: { $elemMatch: { $eq: user._id } } },
  //     // };
  //     // const secondUpdate = {
  //     //   $addToSet: { followers: user._id },
  //     // };
  //     // const secondUpdated = await User.updateOne(secondQuery, secondUpdate);
  //     if (!updated) {
  //       return res.status(404).json({ error: 'Unable to follow that user' });
  //     }
  //     res.status(200).json(update);
  //   } catch (err) {
  //     res.status(400).send({ error: err.message });
  //   }
};

module.exports = {
  register,
  getAllUsers,
  login,
  changePassword,
  logout,
  addDateOfBirth,
  addPhoneNumber,
  addEmail,
  changeProfilePicture,
  followUser,
};
