import './bootstrap';

import helmet from 'helmet';
import redis from 'redis';
import RateLimit from 'express-rate-limit';
import RateLimitRedis from 'rate-limit-redis';
import cors from 'cors';
import Youch from 'youch';
import express from 'express';
import { resolve } from 'path';
import 'express-async-errors';
import socketio from 'socket.io';
import http from 'http';

import IoRedis from './lib/IoRedis';

import routes from './routes';

import './database';

class App {
  constructor() {
    this.app = express();
    this.server = http.Server(this.app);
    this.io = socketio(this.server);

    this.middlewares();
    this.connections();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: [
          `https://www.${process.env.CLIENT_APP_DOMAIN}`,
          `https://${process.env.CLIENT_APP_DOMAIN}`,
          'http://localhost:3000',
        ],
      })
    );
    this.app.use(express.json());
    this.app.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );

    if (process.env.NODE_ENV !== 'development') {
      this.app.use(
        new RateLimit({
          store: new RateLimitRedis({
            client: redis.createClient({
              host: process.env.REDIS_HOST,
              port: process.env.REDIS_PORT,
            }),
          }),
          windowMs: 1000 * 60 * 15,
          max: 500,
        })
      );
    }
  }

  connections() {
    let connectedUsers;
    let socketPassedToReq;

    this.io.origins([
      'http://localhost:3000',
      `https://${process.env.CLIENT_APP_DOMAIN}:443`,
      `https://www.${process.env.CLIENT_APP_DOMAIN}:443`,
    ]);

    this.io.on('connection', async socket => {
      const { user_id } = socket.handshake.query;
      connectedUsers = await IoRedis.connectAnUser({ socket, user_id });
      console.log('connection: ', user_id, 'e', socket.id);

      socket.broadcast.emit('FRIEND_SIGNED_IN', {
        params: {
          friend_id: Number(user_id),
        },
      });

      socket.on('SIGN_OUT', async () => {
        console.log(`${user_id} signed out`);
        await IoRedis.disconnectAnUser({ socket });

        console.log('attempting to emit');

        socket.broadcast.emit('FRIEND_SIGNED_OUT', {
          params: {
            friend_id: user_id,
          },
        });
      });

      socket.on('disconnect', async () => {
        console.log(socket.id);
        console.log(':(');
        console.log('disconnected');

        socket.broadcast.emit('FRIEND_SIGNED_OUT', {
          params: {
            friend_id: Number(user_id),
          },
        });

        await IoRedis.disconnectAnUser({ socket });
      });

      socketPassedToReq = socket;
    });

    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = connectedUsers;
      req.socket = socketPassedToReq;

      return next();
    });
  }

  routes() {
    this.app.use(routes);
  }

  exceptionHandler() {
    this.app.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        console.log(err);
        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App();
