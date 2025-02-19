module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE users_id_seq RESTART WITH 1000;`
    );
  },

  down: async queryInterface => {
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE users_id_seq RESTART WITH 1;`
    );
  },
};
