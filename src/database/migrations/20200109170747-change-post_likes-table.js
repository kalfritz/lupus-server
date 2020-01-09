'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('post_likes', 'deleted_at', {
      type: Sequelize.DATE,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('post_likes', 'deleted_at');
  },
};
