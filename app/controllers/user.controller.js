import User from '../models/user.model.js';
import asyncHandler from '../middleware/async-handler.middleware.js';

export const userList = asyncHandler(async (req, res) => {
  const search = req.query.search;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skipAmount = (page - 1) * limit;
  let filter = { isActived: true };

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.fullName = {
      $regex: regex,
    };
  }

  const users = await User.find(filter).select('-password')
    .skip(skipAmount)
    .limit(limit);

  res.status(200).json({
    message: 'success',
    page,
    limit,
    data: users,
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

