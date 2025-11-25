'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'plan', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('subscriptions', 'stripe_customer_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('subscriptions', 'stripe_subscription_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('subscriptions', 'current_period_end', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('subscriptions', 'status', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('subscriptions', 'plan');
    await queryInterface.removeColumn('subscriptions', 'stripe_customer_id');
    await queryInterface.removeColumn('subscriptions', 'stripe_subscription_id');
    await queryInterface.removeColumn('subscriptions', 'current_period_end');
    await queryInterface.removeColumn('subscriptions', 'status');
  },
};

