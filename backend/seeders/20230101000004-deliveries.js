'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Generate delivery data
    const deliveries = [];
    const fuelTypes = ['Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'];
    const suppliers = [
      'PT Pertamina (Persero)',
      'Shell Indonesia',
      'TotalEnergies Indonesia',
      'Chevron Indonesia',
      'BP Indonesia'
    ];
    const statuses = ['pending', 'confirmed', 'approved'];
    
    // Generate 50 delivery records
    for (let i = 0; i < 50; i++) {
      // Random SPBU (1-3)
      const spbuId = Math.floor(Math.random() * 3) + 1;
      
      // Random supplier
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      // Random fuel type
      const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
      
      // Random planned liters (1000-10000)
      const plannedLiters = Math.floor(Math.random() * 9001) + 1000;
      
      // Random actual liters (might be null for pending, or slightly different for confirmed/approved)
      let actualLiters = null;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      if (status === 'confirmed' || status === 'approved') {
        // Actual liters might be slightly different from planned (95-105% of planned)
        actualLiters = Math.floor(plannedLiters * (0.95 + Math.random() * 0.1));
      }
      
      // Random date in the past 60 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60));
      
      // Random confirmed_by and approved_by (admin or null)
      const confirmedBy = status !== 'pending' ? Math.floor(Math.random() * 3) + 2 : null; // Admins 2-4
      const approvedBy = status === 'approved' ? Math.floor(Math.random() * 3) + 2 : null; // Admins 2-4
      
      deliveries.push({
        spbu_id: spbuId,
        supplier: supplier,
        fuel_type: fuelType,
        planned_liters: plannedLiters,
        actual_liters: actualLiters,
        delivery_date: date,
        status: status,
        confirmed_by: confirmedBy,
        approved_by: approvedBy,
        created_at: date,
        updated_at: new Date()
      });
    }
    
    await queryInterface.bulkInsert('deliveries', deliveries, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('deliveries', null, {});
  }
};