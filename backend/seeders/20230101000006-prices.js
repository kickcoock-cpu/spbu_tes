'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Generate price data
    const prices = [];
    const fuelTypes = ['Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'];
    
    // Generate initial global prices (no SPBU)
    for (let i = 0; i < fuelTypes.length; i++) {
      const fuelType = fuelTypes[i];
      
      // Base prices
      let basePrice;
      switch (fuelType) {
        case 'Premium': basePrice = 6500; break;
        case 'Pertamax': basePrice = 12500; break;
        case 'Pertalite': basePrice = 10000; break;
        case 'Solar': basePrice = 6500; break;
        case 'Dexlite': basePrice = 12500; break;
        default: basePrice = 10000;
      }
      
      prices.push({
        spbu_id: null, // Global price
        fuel_type: fuelType,
        price: basePrice,
        effective_date: new Date(),
        updated_by: 1, // Super Admin
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // Generate SPBU-specific prices
    for (let spbuId = 1; spbuId <= 3; spbuId++) {
      for (let i = 0; i < fuelTypes.length; i++) {
        const fuelType = fuelTypes[i];
        
        // Base prices with small variations per SPBU
        let basePrice;
        switch (fuelType) {
          case 'Premium': basePrice = 6500; break;
          case 'Pertamax': basePrice = 12500; break;
          case 'Pertalite': basePrice = 10000; break;
          case 'Solar': basePrice = 6500; break;
          case 'Dexlite': basePrice = 12500; break;
          default: basePrice = 10000;
        }
        
        // Add small variation based on SPBU
        const variation = (spbuId - 2) * 50; // -50, 0, +50
        const price = basePrice + variation;
        
        prices.push({
          spbu_id: spbuId,
          fuel_type: fuelType,
          price: price,
          effective_date: new Date(),
          updated_by: spbuId + 1, // Admin for this SPBU
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
    
    await queryInterface.bulkInsert('prices', prices, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('prices', null, {});
  }
};