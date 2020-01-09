import faker from 'faker';
import { factory } from 'factory-girl';

import User from '../src/app/models/User';
import Post from '../src/app/models/Post';
import Comment from '../src/app/models/Comment';

factory.define('User', User, {
  name: faker.name.findName(),
  username: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

factory.define('Post', Post, {
  content: faker.random.words(),
  user_id: null,
});

factory.define('Comment', Comment, {
  content: faker.random.words(),
  user_id: null,
  post_id: null,
});
export default factory;
