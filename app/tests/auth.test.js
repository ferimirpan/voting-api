import app from '../../app.js';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../config/db.js';
import 'dotenv/config';
import Token from '../models/token.model.js';
import User from '../models/user.model.js';

let mongoServer;


beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = process.env.DATABASE;
  await connectDB(mongoURI);
});

afterAll(async () => {
  await disconnectDB();
  await mongoServer.stop();
});

describe('registerUser', () => {
  it('should be throw error when fullName, email and password is null', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send()
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'password is required,email is required,fullName is required');
  });


  it('should be throw error when email inputed not use mail format', async () => {
    const params = {
      fullName: 'User 101',
      email: 'user101',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(params)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'input must be in email format');
  });

  it('should be throw error when the email has registered', async () => {
    const params = {
      fullName: 'User 1',
      email: 'user1@vote.com', // user1@vote.com
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(params)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(422);
  });

  it('should be throw error when the password and passwordConfirmation not match', async () => {
    const params = {
      fullName: 'User 101',
      email: 'user101@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234'
    }
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(params)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'password does not match');
  });

  it('registered successfully', async () => {
    const params = {
      fullName: 'User 100',
      email: 'user100@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(params)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');

    await User.deleteOne({
      _id: res.body.data._id,
    });
  });
});

describe('login', () => {
  it('should be throw error when email and password is null', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send()
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'email and password required');
  });

  it('should be throw error when email invalid', async () => {
    const params = {
      email: 'user0@vote.com',
      password: 'pass1234!',
    }

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(params)
      .set('Accept', 'application/json')
      .set('decryptedPass', 'true');

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'email or password invalid');
  });

  it('should be throw error when password incorrect', async () => {
    const params = {
      email: 'user101@vote.com',
      password: 'pass1234',
    }

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(params)
      .set('Accept', 'application/json')
      .set('decryptedPass', 'true');

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message', 'email or password invalid');
  });

  it('login successfully', async () => {
    const params = {
      email: 'user101@vote.com',
      password: 'pass1234!',
    }

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send(params)
      .set('Accept', 'application/json')
      .set('decryptedPass', 'true');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});

describe('loginData', () => {
  it('get login data failed', async () => {
    const getToken = await Token.findOne().sort({
      createdAt: -1
    });

    const res = await request(app)
      .get('/api/v1/auth/loginData')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', getToken.token + '123456789');

    expect(res.statusCode).toBe(401);
  });

  it('get login data successfully', async () => {
    const getToken = await Token.findOne().sort({
      createdAt: -1
    });

    const res = await request(app)
      .get('/api/v1/auth/loginData')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', getToken.token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});

describe('logout', () => {
  it('logout failed', async () => {
    const getToken = await Token.findOne().sort({
      createdAt: -1
    });

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', getToken.token + '123456789');

    expect(res.statusCode).toBe(401);
  });

  it('logout successfully', async () => {
    const getToken = await Token.findOne().sort({
      createdAt: -1
    });

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', getToken.token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'logout successfully');
  });
});
