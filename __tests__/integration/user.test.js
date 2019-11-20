import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('user', () => {
  beforeEach(async () => {
    await truncate();
  });
});
