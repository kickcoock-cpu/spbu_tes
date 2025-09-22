'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Generate deposit data
    const deposits = [];
    const paymentMethods = ['cash', 'transfer', 'check'];
    const statuses = ['pending', 'approved', 'rejected'];
    
    // Generate 80 deposit records
    for (let i = 0; i < 80; i++) {
      // Random SPBU (1-3)
      const spbuId = Math.floor(Math.random() * 3) + 1;
      
      // Random operator (can be null for admin deposits)
      const operatorId = Math.random() > 0.3 ? 
        spbuId * 2 + Math.floor(Math.random() * 2) : // Operators 2-3, 4-5, 6-7
        null;
      
      // Random amount (100000-5000000)
      const amount = Math.floor(Math.random() * 4900001) + 100000;
      
      // Random payment method
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
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
      
      deposits.push({
        spbu_id: spbuId,
        operator_id: operatorId,
        amount: amount,
        payment_method: paymentMethod,
        status: status,
        approved_by: approvedBy,
        rejected_by: rejectedBy,
        deposit_date: date,
        created_at: date,
        updated_at: new Date()
      });
    }
    
    await queryInterface.bulkInsert('deposits', deposits, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('deposits', null, {});
  }
};