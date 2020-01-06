import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Post', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to make a post', async () => {
    const user = await factory.attrs('User');

    const SignUpResponse = await request(app)
      .post('/users')
      .send(user);

    const post = await factory.attrs('Post', {
      user_id: SignUpResponse.body.user.id,
    });

    const response = await request(app)
      .post('/posts')
      .send(post)
      .set('Authorization', 'Bearer ' + SignUpResponse.body.token);

    expect(response.body).toHaveProperty('content');
  });
});
