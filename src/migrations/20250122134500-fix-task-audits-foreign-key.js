'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First drop the existing foreign key if it exists
    try {
      await queryInterface.removeConstraint('task_audits', 'task_audits_taskId_fkey');
    } catch (error) {
      // Constraint might not exist, continue
    }

    // Add the foreign key with proper ON DELETE CASCADE
    await queryInterface.addConstraint('task_audits', {
      fields: ['taskId'],
      type: 'foreign key',
      name: 'task_audits_taskId_fkey',
      references: {
        table: 'tasks',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('task_audits', 'task_audits_taskId_fkey');
  }
}; 