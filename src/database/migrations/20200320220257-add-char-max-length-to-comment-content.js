module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('comments', 'content', {
      type: Sequelize.STRING(50000),
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('comments', 'content', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
