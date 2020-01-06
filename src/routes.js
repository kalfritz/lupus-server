import { Router } from 'express';

const routes = new Router();

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import PostController from './app/controllers/PostController';

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/posts', PostController.index);
routes.post('/posts', authMiddleware, PostController.store);

export default routes;
