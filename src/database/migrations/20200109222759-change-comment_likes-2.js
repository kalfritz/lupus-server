'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('comment_likes', 'post_id');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('comment_likes', 'post_id', {
      type: Sequelize.INTEGER,
      references: { model: 'posts', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
