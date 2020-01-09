'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('post_likes', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('post_likes', 'updated_at');
  },
};
