'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Generate sales data for the past 30 days
    const sales = [];
    const fuelTypes = ['Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'];
    
    // Generate 200 sales records
    for (let i = 0; i < 200; i++) {
      // Random SPBU (1-3)
      const spbuId = Math.floor(Math.random() * 3) + 1;
      
      // Random operator from that SPBU
      const operatorId = spbuId * 2 + Math.floor(Math.random() * 2); // Gets operator 2-3 for SPBU 1, 4-5 for SPBU 2, 6-7 for SPBU 3
      
      // Random fuel type
      const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
      
      // Random liters (10-100)
      const liters = Math.floor(Math.random() * 91) + 10;
      
      // Calculate amount based on fuel type (approximate prices)
      let pricePerLiter;
      switch (fuelType) {
        case 'Premium': pricePerLiter = 6500; break;
        case 'Pertamax': pricePerLiter = 12500; break;
        case 'Pertalite': pricePerLiter = 10000; break;
        case 'Solar': pricePerLiter = 6500; break;
        case 'Dexlite': pricePerLiter = 12500; break;
        default: pricePerLiter = 10000;
      }
      const amount = liters * pricePerLiter;
      
      // Random date in the past 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      sales.push({
        spbu_id: spbuId,
        operator_id: operatorId,
        fuel_type: fuelType,
        liters: liters,
        amount: amount,
        transaction_date: date,
        created_at: date,
        updated_at: date
      });
    }
    
    await queryInterface.bulkInsert('sales', sales, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sales', null, {});
  }
};