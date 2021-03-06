import request from 'supertest';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to register', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body.user).toHaveProperty('id');
  });
  it('should not be able to store duplicated username', async () => {
    await factory.create('User', {
      username: 'this is my username',
      email: 'email1', //I dont like doing it but for some reason when I try to create
      //below another random user with random fields expect the username (so it get
      //duplicated), it ends up receiving the same values for other fields as well)
    });

    const user = await factory.attrs('User', {
      username: 'this is my username',
      email: 'email2', //sad.
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });
  it('should not be able to store duplicated email', async () => {
    const a = await factory.create('User', {
      email: 'thatismyemail@gmail.com',
      username: 'username1', //see the reason above
    });

    const user = await factory.attrs('User', {
      email: 'thatismyemail@gmail.com',
      username: 'username2', //.
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });
  it('should encrypt password when new user is created', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });

    const compareHash = await bcrypt.compare('123456', user.password_hash);

    expect(compareHash).toBe(true);
  });
  it('should return jwt when registering', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    const decoded = await promisify(jwt.verify)(
      response.body.token,
      process.env.APP_SECRET
    );

    expect(decoded.id).toBe(response.body.user.id);
  });
});
