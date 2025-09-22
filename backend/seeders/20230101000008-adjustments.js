'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Generate adjustment data
    const adjustments = [];
    const types = ['fuel', 'equipment', 'other'];
    const statuses = ['pending', 'approved', 'rejected'];
    const descriptions = [
      'Fuel quality issue reported',
      'Pump maintenance required',
      'Tank calibration needed',
      'Dispenser accuracy check',
      'Storage tank inspection',
      'Fuel filter replacement',
      'Nozzle repair required',
      'Tank level sensor issue',
      'Emergency shut-off test',
      'Ventilation system check'
    ];
    
    // Generate 40 adjustment records
    for (let i = 0; i < 40; i++) {
      // Random SPBU (1-3)
      const spbuId = Math.floor(Math.random() * 3) + 1;
      
      // Random operator (can be null for admin adjustments)
      const operatorId = Math.random() > 0.4 ? 
        spbuId * 2 + Math.floor(Math.random() * 2) : // Operators 2-3, 4-5, 6-7
        null;
      
      // Random type
      const type = types[Math.floor(Math.random() * types.length)];
      
      // Random description
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      // Random status
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random date in the past 60 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60));
      
      // Random approved_by or rejected_by based on status
      let approvedBy = null;
      let rejectedBy = null;
      
      if (status === 'approved') {
        approvedBy = Math.floor(Math.random() * 3) + 2; // Admins 2-4
      } else if (status === 'rejected') {
        rejectedBy = Math.floor(Math.random() * 3) + 2; // Admins 2-4
      }
      
      adjustments.push({
        spbu_id: spbuId,
        operator_id: operatorId,
        type: type,
        description: description,
        status: status,
        approved_by: approvedBy,
        rejected_by: rejectedBy,
        created_at: date,
        updated_at: new Date()
      });
    }
    
    await queryInterface.bulkInsert('adjustments', adjustments, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('adjustments', null, {});
  }
};