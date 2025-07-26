import jwt from 'jsonwebtoken';
import asyncHandler from './async-handler.middleware.js';
import User from '../models/user.model.js';
import Token from '../models/token.model.js';

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
  let token = req.header('Authorization');
  if (token) {
    try {
      const checkToken = await Token.findOne({ token, isActived: true });
      if (!checkToken) {
        res.status(401);
        throw new Error('Unautorization, invalid token checkToken');
      }
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decode.id).select('-password');
      req.auth = { token, userData: user };
      next();
    } catch (e) {
      res.status(401);
      throw new Error('Unautorization, invalid token');
    }
  } else {
    res.status(401);
    throw new Error('Unautorization, token is required');
  }
})