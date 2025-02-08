'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('task_audits', 'assigneeId', 'assignedUserId');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('task_audits', 'assignedUserId', 'assigneeId');
  }
}; 