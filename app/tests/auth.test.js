import app from '../../app.js';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../config/db.js';
import 'dotenv/config';

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

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'password is required,email is required,fullName is required');
  });


  it('should be throw error when email inputed not use mail format', async () => {
    const params = {
      fullName: 'User 1',
      email: 'user1',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(params)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(400);
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

    expect(res.statusCode).toBe(400);
  });

  it('should be throw error when the password and passwordConfirmation not match', async () => {
    const params = {
      fullName: 'User 99',
      email: 'user99@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234'
    }
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(params)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'password does not match');
  });

  it('should be registered successfully', async () => {
    const params = {
      fullName: 'User 101',
      email: 'user101@vote.com',
      password: 'pass1234!',
      passwordConfirmation: 'pass1234!'
    }
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(params)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');
  });
});