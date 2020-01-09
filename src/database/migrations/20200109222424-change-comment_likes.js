'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('comment_likes', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('comment_likes', 'updated_at');
  },
};
