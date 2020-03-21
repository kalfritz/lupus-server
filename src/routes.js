import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import PostController from './app/controllers/PostController';
import TimelineController from './app/controllers/TimelineController';
import CommentController from './app/controllers/CommentController';
import PostLikeController from './app/controllers/PostLikeController';
import CommentLikeController from './app/controllers/CommentLikeController';
import FriendshipController from './app/controllers/FriendshipController';
import FriendController from './app/controllers/FriendController';
import SentFriendRequestController from './app/controllers/SentFriendRequestController';
import ReceivedFriendRequestController from './app/controllers/ReceivedFriendRequestController';
import BlockController from './app/controllers/BlockController';
import NotificationController from './app/controllers/NotificationController';
import FriendListController from './app/controllers/FriendListController';
import PhotoController from './app/controllers/PhotoController';
import MutualFriendController from './app/controllers/MutualFriendController';

import authMiddleware from './app/middlewares/auth';
import friendsMiddleware from './app/middlewares/friends';
import blocksMiddleware from './app/middlewares/blocks';

const routes = new Router();
const upload = multer(multerConfig);

const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const bruteForce = new Brute(bruteStore);

routes.get('/', (req, res) => res.send('Luppus API'));

routes.get('/users', authMiddleware, blocksMiddleware, UserController.index);
routes.get('/users/:username', UserController.show);
routes.post('/users', UserController.store);
routes.put('/users', authMiddleware, UserController.update);
routes.delete('/users', authMiddleware, UserController.delete);

//routes.post('/sessions', bruteForce.prevent, SessionController.store);
routes.post('/sessions', SessionController.store);

try {
  routes.post('/files', upload.single('file'), FileController.store);
} catch (err) {
  console.log(err);
}

routes.get('/notifications', authMiddleware, NotificationController.index);
routes.put('/notifications', authMiddleware, NotificationController.updateAll);
routes.put(
  '/notifications/:notif_id',
  authMiddleware,
  NotificationController.update
);
routes.delete(
  '/notifications/:notif_id',
  authMiddleware,
  NotificationController.delete
);

routes.get(
  '/timeline/:person_id',
  authMiddleware,
  blocksMiddleware,
  TimelineController.index
);

routes.get(
  '/posts',
  authMiddleware,
  friendsMiddleware,
  blocksMiddleware,
  PostController.index
);
routes.get(
  '/posts/:post_id',
  authMiddleware,
  blocksMiddleware,
  PostController.show
);
routes.post('/posts', authMiddleware, friendsMiddleware, PostController.store);
routes.put(
  '/posts/:post_id',
  authMiddleware,
  friendsMiddleware,
  PostController.update
);
routes.delete(
  '/posts/:post_id',
  authMiddleware,
  friendsMiddleware,
  PostController.delete
);

routes.get('/friendships', authMiddleware, FriendshipController.index);
routes.get(
  '/friendships/:person_id',
  authMiddleware,
  FriendshipController.show
);
routes.post(
  '/friendships/:person_id',
  authMiddleware,
  FriendshipController.store
);
routes.delete(
  '/friendships/:person_id',
  authMiddleware,
  FriendshipController.delete
);

routes.get(
  '/friends/:user_id',
  authMiddleware,
  friendsMiddleware,
  blocksMiddleware,
  FriendController.index
);

routes.get(
  '/mutualfriends/:person_id',
  authMiddleware,
  friendsMiddleware,
  MutualFriendController.show
);

routes.get(
  '/sentfriendrequests',
  authMiddleware,
  SentFriendRequestController.index
);
routes.get(
  '/receivedfriendrequests',
  authMiddleware,
  ReceivedFriendRequestController.index
);

routes.get('/blockedusers', authMiddleware, BlockController.index);
routes.post('/blockedusers/:person_id', authMiddleware, BlockController.store);

routes.get(
  '/posts/:post_id/comments',
  authMiddleware,
  blocksMiddleware,
  CommentController.index
);
routes.post(
  '/posts/:post_id/op/:op_id/comments',
  authMiddleware,
  blocksMiddleware,
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

routes.get(
  '/posts/:post_id/likes',
  authMiddleware,
  blocksMiddleware,
  PostLikeController.index
);
routes.post(
  '/posts/:post_id/op/:op_id/likes',
  authMiddleware,
  blocksMiddleware,
  PostLikeController.store
);

routes.get(
  '/posts/:post_id/comments/:comment_id/likes',
  authMiddleware,
  blocksMiddleware,
  CommentLikeController.index
);
routes.post(
  '/posts/:post_id/op/:op_id/comments/:comment_id/likes',
  authMiddleware,
  blocksMiddleware,
  CommentLikeController.store
);

routes.get(
  '/friendlist',
  authMiddleware,
  friendsMiddleware,
  FriendListController.index
);

routes.get(
  '/photos/:person_id',
  authMiddleware,
  blocksMiddleware,
  PhotoController.index
);

export default routes;
