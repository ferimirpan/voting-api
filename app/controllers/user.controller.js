import User from '../models/user.model.js';
import asyncHandler from '../middleware/async-handler.middleware.js';
import { Op } from 'sequelize'

export const userList = asyncHandler(async (req, res) => {
  const search = req.query.search;

  let userData = [];

  if (search) {
    const regex = new RegExp(search, 'i');
    const users = await User.find({
      fullName: {
        $regex: regex,
      },
      isActived: true,
    }).select('-password');
    userData = users;
  } else {
    const users = await User.find({ isActived: true }).select('-password');
    userData = users;
  }

  res.status(200).json({
    message: 'success',
    data: userData,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    res.status(422);
    throw new Error('user id not found');
  }
  user.fullName = req.body.fullName;
  user.email = req.body.email;

  if (req.body.password && req.body.passwordConfirmation) {
    if (req.body.password !== req.body.passwordConfirmation) {
      throw Error('password does not match');
    }
    delete req.body.passwordConfirmation;
    user.password = req.body.password;
  }

  await user.save();

  res.status(200).json({
    message: 'updated successfully',
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    res.status(422);
    throw new Error('user id not found');
  }

  user.isActived = false;
  await user.save();

  res.status(200).json({
    message: 'deleted successfully',
  });
});

