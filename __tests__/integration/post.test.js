import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Post', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to comment on a post', async () => {
    //it only tests if the user can comment in his own post but
    //I should'nt be a problem
    const user = await factory.attrs('User');

    const signUpResponse = await request(app)
      .post('/users')
      .send(user);

    const post = await factory.attrs('Post', {
      user_id: signUpResponse.body.user.id,
    });

    const storePostResponse = await request(app)
      .post('/posts')
      .send(post)
      .set('Authorization', 'Bearer ' + signUpResponse.body.token);

    const comment = await factory.attrs('Comment', {
      user_id: signUpResponse.body.user.id,
    });

    const storeCommentResponse = await request(app)
      .post(`/posts/${storePostResponse.body.id}/comments`)
      .send(comment)
      .set('Authorization', 'Bearer ' + signUpResponse.body.token);

    expect(storeCommentResponse.status).toBe(200);
  });
  it('should be able to make a post', async () => {
    const user = await factory.attrs('User');

    const signUpResponse = await request(app)
      .post('/users')
      .send(user);

    const post = await factory.attrs('Post', {
      user_id: signUpResponse.body.user.id,
    });

    const response = await request(app)
      .post('/posts')
      .send(post)
      .set('Authorization', 'Bearer ' + signUpResponse.body.token);

    expect(response.status).toBe(200);
  });
});
