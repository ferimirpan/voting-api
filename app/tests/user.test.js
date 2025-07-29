import app from '../../app.js';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../config/db.js';
import 'dotenv/config';
import User from '../models/user.model.js';

let mongoServer;
let adminToken;
let userToken;
let user;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = process.env.DATABASE;
  await connectDB(mongoURI);
});

afterAll(async () => {
  await User.deleteOne({
    _id: user._id,
  });
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

const getSampleUser = async () => {
  if (!user) {
    const getPoll = await User.findOne({ email: 'user100@vote.com' });
    user = getPoll;
  }

  return user;
};

describe('userList', () => {
  it('should be throw error when access by role user', async () => {
    const token = await generateUserToken();
    const res = await request(app)
      .get('/api/v1/user')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Authorization not as Admin');
  });

  it('should be success', async () => {
    const token = await generateAdminToken();
    const res = await request(app)
      .get('/api/v1/user')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'success');
  });
});

describe('registerUser', () => {
  it('should be throw error when access by role user', async () => {
    const token = await generateUserToken();
    const params = {
      fullName: 'User 100',
      email: 'user100@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .post('/api/v1/user')
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Authorization not as Admin');
  });

  it('registered successfully', async () => {
    const token = await generateAdminToken();
    const params = {
      fullName: 'User 100',
      email: 'user100@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .post('/api/v1/user')
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');
  });
});

describe('updateUser', () => {
  it('should be throw error when params id incorrect', async () => {
    const token = await generateAdminToken();
    const params = {
      fullName: 'User 100',
      email: 'user100@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .put('/api/v1/user/688781174dd862beaf1df0f4')
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'user id not found');
  });

  it('should be throw error when fullName, email and password is null', async () => {
    const token = await generateAdminToken();
    const user = await getSampleUser();
    const params = {
      fullName: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    }
    const res = await request(app)
      .put('/api/v1/user/' + user._id)
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'fullName is required,email is required');
  });

  it('should be throw error when password not match with passwordConfirmation', async () => {
    const token = await generateAdminToken();
    const user = await getSampleUser();
    const params = {
      fullName: 'User 100',
      email: 'user100@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234'
    }
    const res = await request(app)
      .put('/api/v1/user/' + user._id)
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'password does not match');
  });

  it('should be throw error when access by role user', async () => {
    const token = await generateUserToken();
    const user = await getSampleUser();
    const params = {
      fullName: 'User 100',
      email: 'user100@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .put('/api/v1/user/' + user._id)
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Authorization not as Admin');
  });

  it('should be success', async () => {
    const user = await getSampleUser();
    const token = await generateAdminToken();
    const params = {
      fullName: 'User 100',
      email: 'user100@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .put('/api/v1/user/' + user._id)
      .send(params)
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'updated successfully');
  });
});

describe('deleteUser', () => {
  it('should be throw error when params id incorrect', async () => {
    const token = await generateAdminToken();
    const res = await request(app)
      .delete('/api/v1/user/688781174dd862beaf1df0f4')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'user id not found');
  });

  it('should be throw error when access by role user', async () => {
    const token = await generateUserToken();
    const user = await getSampleUser();
    const res = await request(app)
      .delete('/api/v1/user/' + user._id)
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Authorization not as Admin');
  });

  it('should be throw error when access by role user', async () => {
    const token = await generateAdminToken();
    const user = await getSampleUser();
    const res = await request(app)
      .delete('/api/v1/user/' + user._id)
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'deleted successfully');
  });
});