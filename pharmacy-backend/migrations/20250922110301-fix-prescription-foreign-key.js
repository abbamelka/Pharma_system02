// migrations/xxxxxx-fix-prescription-foreign-key.js
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old broken constraint
    await queryInterface.removeConstraint('Orders', 'Orders_prescriptionId_fkey');
    // Or try common naming: 'Orders_ibfk_2'

    // Recreate with correct case
    await queryInterface.addConstraint('Orders', {
      fields: ['prescription_id'],
      type: 'foreign key',
      name: 'Orders_prescriptionId_fkey',
      references: {
        table: 'prescriptions', // lowercase!
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Orders', 'Orders_prescriptionId_fkey');

    await queryInterface.addConstraint('Orders', {
      fields: ['prescription_id'],
      type: 'foreign key',
      references: {
        table: 'Prescriptions', // revert to old (incorrect) name
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
};