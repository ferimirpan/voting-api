import asyncHandler from '../middleware/async-handler.middleware.js';
import Poll from '../models/poll.model.js';
import User from '../models/user.model.js';

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
  if (!req.body.name) {
    res.status(422);
    throw Error('name option is required');
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
  const votedActive = req.query.votedActive;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skipAmount = (page - 1) * limit;
  let filter = { isActived: true };
  let totalData = 0;
  let totalPage = 0;

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.name = {
      $regex: regex,
    };
  }

  if (votedActive) {
    if (votedActive === 'true') {
      filter = {
        $and: [
          {
            deadlineVote: {
              $gt: new Date,
            }
          },
          {
            'voted.userId': {
              $ne: req.auth.userData.id,
            }
          }
        ]
      };
    }
  }

  const polls = await Poll.find(filter)
    .skip(skipAmount)
    .limit(limit);

  if (polls.length) {
    totalData = await Poll.find(filter).countDocuments();
    for (const item of polls) {
      let votedEnable = true;
      if (new Date(item.deadlineVote) < new Date) {
        votedEnable = false;
      }
      item['votedEnable'] = votedEnable;
    }

    totalPage = Math.ceil(totalData / limit);
  }

  res.status(200).json({
    message: 'success',
    page,
    limit,
    totalPage,
    totalData,
    data: polls,
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
  const optionId = req.body.optionId;
  const poll = await Poll.findById(pollId);

  if (!poll) {
    res.status(422);
    throw new Error('poll id not found');
  }

  const option = poll.options.filter(item => item.optionId === optionId);
  if (!option.length) {
    res.status(422);
    throw new Error('option id not found');
  }

  const deadlineVote = new Date(poll.deadlineVote);
  const currentDate = new Date;

  if (deadlineVote < currentDate) {
    res.status(422);
    throw new Error('sorry, polling is closed');
  }

  const voteds = poll.voted;

  if (!voteds.length) {
    voteds.push({
      userId: req.auth.userData.id,
      optionId,
      createdAt: new Date,
    });
  } else {
    let userVoted = false;
    for (const item of voteds) {
      if (item.userId === req.auth.userData.id) {
        userVoted = true;
        item.optionId = optionId;
        item.updatedAt = new Date;
      }
    }

    if (!userVoted) {
      voteds.push({
        userId: req.auth.userData.id,
        optionId,
        createdAt: new Date,
      })
    }
  }

  await Poll.updateOne({
    _id: pollId,
  }, {
    $set: {
      voted: voteds,
    }
  });

  res.status(200).json({
    message: 'voted successfully',
  });
});

export const resultPoll = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const poll = await Poll.findById(id);

  if (!poll) {
    res.status(422);
    throw new Error('poll id not found');
  }

  const totalAllVoted = poll.voted.length;
  const options = [];

  for (const option of poll.options) {
    const voted = poll.voted.filter(item => item.optionId === option.optionId);
    const totalVoted = voted.length;
    const percentage = (totalVoted / totalAllVoted) * 100;
    option.totalVoted = totalVoted;
    option.percentage = percentage;
    let usersVoted = [];

    if (totalVoted) {
      const userId = voted.map(({ userId }) => userId);
      usersVoted = await User.find({
        _id: {
          $in: userId,
        }
      }, {
        fullName: 1,
      });
    }
    option.usersVoted = usersVoted;
    delete option.createdAt;
    delete option.createdBy;
    options.push(option);
  }

  res.status(200).json({
    message: 'success',
    data: {
      totalAllVoted,
      options,
    }
  });
});

export const detailPoll = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const poll = await Poll.findById(id);

  if (!poll) {
    res.status(422);
    throw new Error('poll id not found');
  }

  res.status(200).json({
    message: 'success',
    data: poll,
  });
});
