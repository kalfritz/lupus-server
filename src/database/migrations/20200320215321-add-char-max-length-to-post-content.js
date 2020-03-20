'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('posts', 'content', {
      type: Sequelize.STRING(100000),
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('posts', 'content', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
