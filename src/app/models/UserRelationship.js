import Sequelize, { Model } from 'sequelize';

class UserRelationship extends Model {
  static init(sequelize) {
    super.init(
      {
        user_first_id: Sequelize.INTEGER,
        user_second_id: Sequelize.INTEGER,
        status: Sequelize.ENUM(
          'pending_first_second',
          'pending_second_first',
          'friends',
          'block_first_second',
          'block_second_first',
          'block_both'
        ),
        friendship_time: Sequelize.DATE,
        
      },
      { sequelize}
    );

    return this;
  }
}

export default UserRelationship;
