module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First remove the existing foreign key
    await queryInterface.removeConstraint(
      'Tasks',
      'Tasks_parentTaskId_fkey' // This is the default constraint name, might be different in your DB
    );

    // Add the foreign key again with CASCADE delete
    await queryInterface.addConstraint('Tasks', {
      fields: ['parentTaskId'],
      type: 'foreign key',
      name: 'Tasks_parentTaskId_fkey',
      references: {
        table: 'Tasks',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the CASCADE constraint
    await queryInterface.removeConstraint(
      'Tasks',
      'Tasks_parentTaskId_fkey'
    );

    // Add back the original foreign key without CASCADE
    await queryInterface.addConstraint('Tasks', {
      fields: ['parentTaskId'],
      type: 'foreign key',
      name: 'Tasks_parentTaskId_fkey',
      references: {
        table: 'Tasks',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
}; 