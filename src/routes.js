import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import PostController from './app/controllers/PostController';
import CommentController from './app/controllers/CommentController';
import PostLikeController from './app/controllers/PostLikeController';
import CommentLikeController from './app/controllers/CommentLikeController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/users/:user_id', UserController.show);
routes.post('/users', UserController.store);
routes.put('/users', authMiddleware, UserController.update);
routes.delete('/users', authMiddleware, UserController.delete);

routes.post('/sessions', SessionController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/posts', authMiddleware, PostController.index);
routes.post('/posts', authMiddleware, PostController.store);
routes.put('/posts/:post_id', authMiddleware, PostController.update);
routes.delete('/posts/:post_id', authMiddleware, PostController.delete);

routes.get('/posts/:post_id/comments', authMiddleware, CommentController.index);
routes.post(
  '/posts/:post_id/comments',
  authMiddleware,
  CommentController.store
);
routes.put(
  '/posts/:post_id/comments/:comment_id',
  authMiddleware,
  CommentController.update
);
routes.delete(
  '/posts/:post_id/comments/:comment_id',
  authMiddleware,
  CommentController.delete
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
