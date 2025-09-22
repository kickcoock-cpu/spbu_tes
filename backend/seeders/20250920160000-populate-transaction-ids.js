// This seeder populates transaction_id for existing sales records
const { Sale } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get all sales that don't have a transaction_id yet
      const sales = await Sale.findAll({
        where: {
          transaction_id: null
        }
      });

      console.log(`Found ${sales.length} sales without transaction_id`);

      // Update each sale with a generated transaction_id
      for (const sale of sales) {
        // Generate transaction ID (ID-xxxxxx format)
        const generateTransactionId = () => {
          const timestamp = Date.now().toString().slice(-6); // Get last 6 digits of timestamp
          const random = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
          const spbuCode = sale.spbu_id.toString().padStart(2, '0'); // SPBU ID as 2-digit code
          return `ID-${spbuCode}${timestamp}${random.toString().slice(-6)}`;
        };

        await sale.update({
          transaction_id: generateTransactionId()
        });

        console.log(`Updated sale ${sale.id} with transaction_id: ${sale.transaction_id}`);
      }

      console.log('Successfully updated all sales with transaction_id');
    } catch (error) {
      console.error('Error updating sales with transaction_id:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove transaction_id from all sales
    await queryInterface.bulkUpdate('sales', {
      transaction_id: null
    }, {});
  }
};