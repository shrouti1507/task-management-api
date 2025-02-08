 'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // First, find and handle duplicate emails
      const [results] = await queryInterface.sequelize.query(`
        SELECT email, COUNT(*)
        FROM "Users"
        GROUP BY email
        HAVING COUNT(*) > 1;
      `);

      // If duplicates exist, either update or remove them
      for (const duplicate of results) {
        await queryInterface.sequelize.query(`
          WITH duplicates AS (
            SELECT id, email,
            ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) as rnum
            FROM "Users"
            WHERE email = '${duplicate.email}'
          )
          DELETE FROM "Users"
          WHERE id IN (
            SELECT id FROM duplicates WHERE rnum > 1
          );
        `);
      }

      // Now add the unique constraint
      await queryInterface.addConstraint('Users', {
        fields: ['email'],
        type: 'unique',
        name: 'users_email_unique'
      });
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Users', 'users_email_unique');
  }
};