import './bootstrap';

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
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  connections() {
    let connectedUsers;

    this.io.on('connection', async socket => {
      const { user_id } = socket.handshake.query;
      connectedUsers = await IoRedis.connectAnUser({ socket, user_id });
      console.log('connected users:', connectedUsers);

      socket.on('like', async socket => {});

      socket.on('disconnect', async () => {
        console.log(socket.id);
        console.log(':(');
        await IoRedis.disconnectAnUser({ socket });
      });
    });

    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = connectedUsers;

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

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App();
