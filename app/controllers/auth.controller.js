import asyncHandler from '../middleware/async-handler.middleware.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import Token from '../models/token.model.js';
import 'dotenv/config';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

const createResToken = async (user, statusCode, res) => {
  user.password = undefined;
  const token = signToken(user._id);
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
  if (req.body) {
    if (req.body.password !== req.body.passwordConfirmation) {
      res.status(422);
      throw new Error('password does not match');
    }

    req.body.role = req.body.role ? req.body.role : 'user';
    delete req.body.passwordConfirmation;
  }

  if (req.auth) {
    req.body.createdBy = req.auth.userData.email;
  }

  const user = await User.create(req.body);
  createResToken(user, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  let decryptedPass = req.header('decryptedPass');
  if (!req.body) {
    res.status(422);
    throw new Error('email and password required');
  }
  if (!req.body.email && !req.body.password) {
    res.status(422);
    throw new Error('email and password required');
  }

  const userData = await User.findOne({
    email: req.body.email
  });

  if (userData) {
    let passwordInputed = req.body.password;
    if (decryptedPass === undefined) {
      passwordInputed = await userData.decrypt(req.body.password);
    }

    const password = await userData.decrypt(userData.password);

    if (passwordInputed === password) {
      createResToken(userData, 200, res);
    } else {
      res.status(422);
      throw new Error('email or password invalid');
    }
  }
  else {
    res.status(422);
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
  const token = await Token.findOne({ token: req.auth.token });
  token.isActived = false;
  await token.save();
  res.status(200).json({
    message: 'logout successfully',
  })

}