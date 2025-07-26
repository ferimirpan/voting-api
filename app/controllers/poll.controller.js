import asyncHandler from '../middleware/async-handler.middleware.js';
import Poll from '../models/poll.model.js';

export const addPoll = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(422);
    throw Error('params is required');
  }

  req.body.createdBy = req.auth.userData.email;

  if (!req.body.options.length) {
    res.status(422);
    throw Error('option is required');
  }

  if (req.body.options.length < 2) {
    res.status(422);
    throw Error('there must be at least 2 options');
  }

  let optionId = 0;
  const options = [];
  for (const item of req.body.options) {
    optionId++;
    options.push({
      optionId,
      name: item.name,
      createdAt: new Date,
      createdBy: req.auth.userData.email,
    })
    item.optionId = optionId;
  }

  req.body.options = options;

  await Poll.create(req.body);
  res.status(200).json({
    message: 'saved successfully',
  });
});

export const addOption = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(422);
    throw Error('params is required');
  }

  const pollId = req.params.id;
  const poll = await Poll.findById(pollId);

  if (!poll) {
    res.status(422);
    throw new Error('poll id not found');
  }

  const options = poll.options;
  const lastOptionId = options[options.length - 1].optionId;

  req.body.createdBy = req.auth.userData.email;
  options.push({
    optionId: lastOptionId + 1,
    name: req.body.name,
    createdAt: new Date,
    createdBy: req.auth.userData.email,
  });
  poll.options = options;
  poll.updatedBy = req.auth.userData.email;

  await poll.save();
  res.status(200).json({
    message: 'updated successfully',
  });
});

export const pollList = asyncHandler(async (req, res) => {
  const search = req.query.search;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skipAmount = (page - 1) * limit;

  let pollData = [];

  if (search) {
    const regex = new RegExp(search, 'i');
    const polls = await Poll.find({
      fullName: {
        $regex: regex,
      },
      isActived: true,
    })
      .skip(skipAmount)
      .limit(limit);
    pollData = polls;
  } else {
    const polls = await Poll.find({ isActived: true })
      .skip(skipAmount)
      .limit(limit);
    pollData = polls;
  }

  res.status(200).json({
    message: 'success',
    page,
    limit,
    data: pollData,
  });
});

export const deletePoll = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const poll = await Poll.findById(id);

  if (!poll) {
    res.status(422);
    throw new Error('poll id not found');
  }

  poll.isActived = false;
  await poll.save();

  res.status(200).json({
    message: 'deleted successfully',
  });
});

export const voted = asyncHandler(async (req, res) => {
  const pollId = req.body.pollId;
  const poll = await Poll.findById(pollId);

  if (!poll) {
    res.status(422);
    throw new Error('poll id not found');
  }

  const deadlineVote = new Date(poll.deadlineVote);
  const currentDate = new Date;

  console.log('deadlineVote', deadlineVote);
  console.log('currentDate', currentDate);

  if (deadlineVote < currentDate) {
    res.status(422);
    throw new Error('sorry, polling is closed');
  }

  const voteds = poll.voted;

  if (!voteds.length) {
    voteds.push({
      userId: req.auth.userData.id,
      optionId: req.body.optionId,
      createdAt: new Date,
    });
  } else {
    let userVoted = false;
    for (const item of voteds) {
      if (item.userId === req.auth.userData.id) {
        console.log('item', item)
        userVoted = true;
        item.optionId = req.body.optionId;
        item.updatedAt = new Date;
      }
    }

    console.log('userVoted', userVoted)
    if (!userVoted) {
      voteds.push({
        userId: req.auth.userData.id,
        optionId: req.body.optionId,
        createdAt: new Date,
      })
    }
  }

  console.log('voteds', voteds)
  poll.voted = voteds;
  poll.updatedAt = new Date;

  console.log('poll', poll);
  const updated = await poll.save();
  console.log('updated', updated);

  res.status(200).json({
    message: 'voted successfully',
  });
});
