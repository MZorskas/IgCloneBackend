const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { secretPassword } = require('../config/config');

test = (req, res, next) => {
  let allowed = true;
  if (allowed) {
    next();
  } else {
    res.status(400).json('Allowed is set to false');
  }
};

authenticate = async (req, res, next) => {
  let token = req.header('x-auth-IG');
  if (!token) return res.status(403).json('Bad token');
  try {
    let decoded = jwt.verify(token, secretPassword);
    let user = await UserModel.findOne({
      _id: decoded.id,
      'tokens.token': token,
    });
    if (!user) throw 'e';
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    // res.status(403).json('You are not authorized');
    res.status(403).json(e);
  }
};

module.exports = {
  test,
  authenticate,
};
