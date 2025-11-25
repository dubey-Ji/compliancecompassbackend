/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("controls", "why_it_matters", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  /** @type {import('sequelize-cli').Migration} */
  async down(queryInterface) {
    await queryInterface.removeColumn("controls", "why_it_matters");
  },
};

