'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('comment_likes', 'comment_id', {
      type: Sequelize.INTEGER,
      references: { model: 'comments', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('comment_likes', 'comment_id', {
      type: Sequelize.INTEGER,
      references: { model: 'comments', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: false,
    });
  },
};
