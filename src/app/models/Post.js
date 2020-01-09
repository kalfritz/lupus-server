import Sequelize, { Model } from 'sequelize';

class Post extends Model {
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
    this.belongsToMany(models.User, {
      foreignKey: 'post_id',
      through: 'post_likes',
      as: 'likes',
    });
    this.hasMany(models.Comment, {
      foreignKey: 'post_id',
      as: 'comments',
    });
  }
}

export default Post;
