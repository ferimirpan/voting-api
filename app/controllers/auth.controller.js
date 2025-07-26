import asyncHandler from '../middleware/async-handler.middleware.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import Token from '../models/token.model.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

const createResToken = async (user, statusCode, res) => {
  const token = signToken(user._id);

  delete user.password;
  await Token.create({
    token,
    createdBy: user._id,
  });
  res.status(statusCode).json({
    token,
    data: user,
  })
}

export const registerUser = asyncHandler(async (req, res) => {
  if (req.body.password !== req.body.passwordConfirmation) {
    throw Error('password does not match');
  }

  req.body.role = req.body.role ? req.body.role : 'user';
  delete req.body.passwordConfirmation;
  const user = await User.create(req.body);
  createResToken(user, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(400);
    throw new Error('email and password required');
  }
  if (!req.body.email && !req.body.password) {
    res.status(400);
    throw new Error('email and password required');
  }

  const userData = await User.findOne({
    email: req.body.email
  });


  if (userData && (await userData.comparePassword(req.body.password))) {
    createResToken(userData, 200, res);
  } else {
    res.status(400);
    throw new Error('email or password invalid');
  }
});

export const loginData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.userData.id).select('-password');
  if (user) {
    res.status(200).json({ message: 'success', data: user });
  } else {
    res.status(401);
    throw new Error('user not found');
  }
});

export const logout = async (req, res) => {
  console.log('req.auth', req.auth)
  // perlu research untuk update isActived = false
  // await Token.updateOne({ token: req.auth.token });
  res.status(200).json({
    message: 'logout successfully',
  })

}