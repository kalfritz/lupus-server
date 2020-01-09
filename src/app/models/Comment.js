import Sequelize, { Model } from 'sequelize';

class Comment extends Model {
  static init(sequelize) {
    super.init(
      {
        content: Sequelize.STRING,
      },
      { sequelize, paranoid: true }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
    this.belongsToMany(models.user, {
      foreignKey: 'user_id',
      through: 'comment_likes',
      as: 'likes',
    });
  }
}

export default Comment;
