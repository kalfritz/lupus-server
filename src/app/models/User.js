import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        username: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        location: Sequelize.STRING,
        bio: Sequelize.STRING,
      },
      {
        sequelize,
        paranoid: true,
        defaultScope: {
          attributes: { exclude: ['password_hash'] },
        },
        scopes: {
          withPassword: {
            attributes: {},
          },
        },
      }
    );
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
    this.hasMany(models.Post, {
      foreignKey: 'user_id',
      as: 'posts',
    });
    this.hasMany(models.Comment, {
      foreignKey: 'user_id',
      as: 'comments',
    });
    this.belongsToMany(models.Post, {
      foreignKey: 'user_id',
      through: 'post_likes',
      as: 'likedPosts',
    });
    this.belongsToMany(models.Comment, {
      foreignKey: 'user_id',
      through: 'comment_likes',
      as: 'likedComments',
    });
    this.belongsToMany(models.User, {
      foreignKey: 'user_first_id',
      through: 'user_relationship',
      as: 'user1',
    });
    this.belongsToMany(models.User, {
      foreignKey: 'user_second_id',
      through: 'user_relationship',
      as: 'user2',
    });
  }
  static signToken(payload) {
    return promisify(jwt.sign)(payload, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });
  }
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
