import request from 'supertest';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Session', () => {
  beforeEach(async () => {
    await truncate();
  });
  it('should be able to login', async () => {
    const user = await factory.attrs('User');

    const signedUpUser = await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/sessions')
      .send(user);

    expect(response.body.user.id).toBe(signedUpUser.body.user.id);
  });
  it('should return jwt when logging in', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/sessions')
      .send(user);

    const decoded = await promisify(jwt.verify)(
      response.body.token,
      process.env.APP_SECRET
    );

    expect(decoded.id).toBe(response.body.user.id);
  });
  it('should return 401 error if there is no user with given email', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/sessions')
      .send(user);

    expect(response.status).toBe(401);
  });
  it('should return 401 error if password do not match given a related email', async () => {
    await factory.create('User', {
      email: 'teste@gmail.com',
      password: '123456',
    });

    const user = await factory.attrs('User', {
      email: 'teste@gmail.com',
      password: 'this is a wrong password',
    });

    const response = await request(app)
      .post('/sessions')
      .send(user);

    expect(response.status).toBe(401);
  });
  it('should return the profile picture link when logging in', async () => {});
});
