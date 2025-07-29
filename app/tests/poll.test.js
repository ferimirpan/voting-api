import app from '../../app.js';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../config/db.js';
import 'dotenv/config';
import Token from '../models/token.model.js';
import Poll from '../models/poll.model.js';

let mongoServer;
let adminToken;
let userToken;
let poll;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = process.env.DATABASE;
  await connectDB(mongoURI);
});

afterAll(async () => {
  await disconnectDB();
  await mongoServer.stop();
});

const generateUserToken = async () => {
  if (!userToken) {
    const params = {
      email: 'user1@vote.com',
      password: 'pass1234!',
    }

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(params)
      .set('Accept', 'application/json')
      .set('decryptedPass', 'true');

    userToken = res.body.token;
  }

  return userToken;
};

const generateAdminToken = async () => {
  if (!adminToken) {
    const params = {
      email: 'admin@vote.com',
      password: 'pass1234!',
    }

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(params)
      .set('Accept', 'application/json')
      .set('decryptedPass', 'true');

    adminToken = res.body.token;
  }

  return adminToken;
};

const getSamplePoll = async () => {
  if (!poll) {

    const getPoll = await Poll.findOne({ isActived: true }).sort({
      createdAt: -1
    });

    poll = getPoll;
  }

  return poll;
};


describe('addPoll', () => {
  it('should be throw error when name, question, deadlineVote and options is null', async () => {
    const token = await generateAdminToken();
    const res = await request(app)
      .post('/api/v1/poll')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'params is required');
  });

  it('should be throw error when options is empty', async () => {
    const token = await generateAdminToken();
    const params = {
      name: 'Test Polling',
      question: 'Whats Your Favorite Food?',
      deadlineVote: '2025-08-31 23:59:59',
      options: []
    }
    const res = await request(app)
      .post('/api/v1/poll')
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'options is required');
  });

  it('should be throw error when options less than 2 options', async () => {
    const token = await generateAdminToken();
    const params = {
      name: 'Test Polling',
      question: 'Whats Your Favorite Food?',
      deadlineVote: '2025-08-31 23:59:59',
      options: [{
        name: 'Grilled Chicken',
      }]
    };
    const res = await request(app)
      .post('/api/v1/poll')
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'there must be at least 2 options');
  });

  it('add poll will saved successfully', async () => {
    const token = await generateAdminToken();
    const params = {
      name: 'Test Polling',
      question: 'Whats Your Favorite Food?',
      deadlineVote: '2025-08-31 23:59:59',
      options: [
        {
          name: 'Grilled Chicken',
        },
        {
          name: 'Grilled Fish',
        }
      ]
    };

    const res = await request(app)
      .post('/api/v1/poll')
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'saved successfully');
  });

  it('should be throw error when access by role user', async () => {
    const token = await generateUserToken();
    const params = {
      name: 'Test Polling',
      question: 'Whats Your Favorite Food?',
      deadlineVote: '2025-08-31 23:59:59',
      options: [
        {
          name: 'Grilled Chicken',
        },
        {
          name: 'Grilled Fish',
        }
      ]
    };

    const res = await request(app)
      .post('/api/v1/poll')
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Authorization not as Admin');
  });
});

describe('addOption', () => {
  it('should be throw error when name null', async () => {
    const token = await generateAdminToken();
    const poll = await getSamplePoll();
    const res = await request(app)
      .patch('/api/v1/poll/addOption/' + poll._id)
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'name option is required');
  });

  it('should be success', async () => {
    const token = await generateAdminToken();
    const poll = await getSamplePoll();

    const res = await request(app)
      .patch('/api/v1/poll/addOption/' + poll._id)
      .send({
        name: 'Steak',
      })
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'updated successfully');
  });
});

describe('pollList', () => {
  it('should be success', async () => {
    const token = await generateAdminToken();
    const res = await request(app)
      .get('/api/v1/poll')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'success');
  });
});

describe('detailPoll', () => {
  it('should be throw error when params id incorrect', async () => {
    const token = await generateAdminToken();
    const res = await request(app)
      .get('/api/v1/poll/detail/688781174dd862beaf1df0f4')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'poll id not found');
  });

  it('should be success', async () => {
    const token = await generateAdminToken();
    const poll = await getSamplePoll();
    const res = await request(app)
      .get('/api/v1/poll/detail/' + poll._id)
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'success');
  });
});

describe('deletePoll', () => {
  it('should be throw error when params id incorrect', async () => {
    const token = await generateAdminToken();
    const res = await request(app)
      .delete('/api/v1/poll/688781174dd862beaf1df0f4')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'poll id not found');
  });

  it('should be success', async () => {
    const token = await generateAdminToken();
    const poll = await getSamplePoll();
    const res = await request(app)
      .delete('/api/v1/poll/' + poll._id)
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'deleted successfully');

    // rollback data
    await Poll.updateOne({
      _id: poll._id,
    }, {
      $set: {
        isActived: true,
      }
    });
  });

  it('should be throw error when access by role user', async () => {
    const token = await generateUserToken();
    const poll = await getSamplePoll();
    const res = await request(app)
      .delete('/api/v1/poll/' + poll._id)
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Authorization not as Admin');
  });
});

describe('voted', () => {
  it('should be throw error when pollId incorrect', async () => {
    const token = await generateUserToken();
    const res = await request(app)
      .post('/api/v1/poll/voted')
      .send({
        pollId: '688781174dd862beaf1df0f4',
        optionId: 2
      })
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'poll id not found');
  });

  it('should be throw error when optionId incorrect', async () => {
    const token = await generateUserToken();
    const poll = await getSamplePoll();
    const res = await request(app)
      .post('/api/v1/poll/voted')
      .send({
        pollId: poll._id,
        optionId: 99
      })
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'option id not found');
  });

  it('should be throw error when polling has closed', async () => {
    const token = await generateUserToken();
    const poll = await getSamplePoll();
    // set expired
    await Poll.updateOne({
      _id: poll._id,
    }, {
      $set: {
        deadlineVote: new Date('2025-07-20 23:59:59'),
      }
    });

    const res = await request(app)
      .post('/api/v1/poll/voted')
      .send({
        pollId: poll._id,
        optionId: 2
      })
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'sorry, polling is closed');

    // rollback
    await Poll.updateOne({
      _id: poll._id,
    }, {
      $set: {
        deadlineVote: poll.deadlineVote,
      }
    });
  });

  it('should be success', async () => {
    const token = await generateUserToken();
    const poll = await getSamplePoll();
    const res = await request(app)
      .post('/api/v1/poll/voted')
      .send({
        pollId: poll._id,
        optionId: 1
      })
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'voted successfully');
  });
});

describe('result', () => {
  it('should be throw error when params id incorrect', async () => {
    const token = await generateAdminToken();
    const res = await request(app)
      .get('/api/v1/poll/result/688781174dd862beaf1df0f4')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'poll id not found');
  });

  it('should be success', async () => {
    const token = await generateAdminToken();
    const poll = await getSamplePoll();
    const res = await request(app)
      .get('/api/v1/poll/result/' + poll._id)
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'success');

    await Poll.deleteOne({
      _id: poll._id,
    });
  });
});
