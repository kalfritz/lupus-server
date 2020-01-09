import { Router } from 'express';

const routes = new Router();

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import PostController from './app/controllers/PostController';
import CommentController from './app/controllers/CommentController';
import PostLikeController from './app/controllers/PostLikeController';
import CommentLikeController from './app/controllers/CommentLikeController';

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

routes.get('/posts/:post_id/likes', authMiddleware, PostLikeController.index);
routes.post('/posts/:post_id/likes', authMiddleware, PostLikeController.store);

routes.get(
  '/posts/:post_id/comments/:comment_id/likes',
  authMiddleware,
  CommentLikeController.index
);
routes.post(
  '/posts/:post_id/comments/:comment_id/likes',
  authMiddleware,
  CommentLikeController.store
);

export default routes;
