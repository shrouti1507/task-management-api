'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First update existing records where version is 0
    await queryInterface.sequelize.query(
      'UPDATE tasks SET version = 1 WHERE version = 0'
    );

    // Then alter the column default
    await queryInterface.changeColumn('tasks', 'version', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('tasks', 'version', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  }
}; 