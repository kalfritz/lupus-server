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
  it('should not be able to store duplicated email', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

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
