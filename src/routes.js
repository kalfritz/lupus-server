import { Router } from 'express';

const routes = new Router();

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import PostController from './app/controllers/PostController';
import CommentController from './app/controllers/CommentController';

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/posts', authMiddleware, PostController.index);
routes.post('/posts', authMiddleware, PostController.store);

routes.get('/posts/:post_id/comments', authMiddleware, CommentController.index);
routes.post(
  '/posts/:post_id/comments',
  authMiddleware,
  CommentController.store
);

export default routes;
