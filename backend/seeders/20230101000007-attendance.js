'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Generate attendance data for the past 30 days
    const attendance = [];
    
    // Generate attendance records for operators
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // For each SPBU (1-3)
      for (let spbuId = 1; spbuId <= 3; spbuId++) {
        // For each operator in this SPBU
        for (let operatorOffset = 0; operatorOffset < 2; operatorOffset++) {
          const operatorId = spbuId * 2 + operatorOffset;
          
          // Random check-in time (between 6:00 AM and 10:00 AM)
          const checkInHour = Math.floor(Math.random() * 4) + 6;
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkInDate = new Date(date);
          checkInDate.setHours(checkInHour, checkInMinute, 0, 0);
          
          // Random check-out time (between 2:00 PM and 8:00 PM)
          const checkOutHour = Math.floor(Math.random() * 6) + 14;
          const checkOutMinute = Math.floor(Math.random() * 60);
          const checkOutDate = new Date(date);
          checkOutDate.setHours(checkOutHour, checkOutMinute, 0, 0);
          
          // Skip some days randomly (10% chance of absence)
          if (Math.random() > 0.1) {
            attendance.push({
              user_id: operatorId,
              spbu_id: spbuId,
              check_in: checkInDate,
              check_out: checkOutDate,
              date: date,
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        }
      }
    }
    
    await queryInterface.bulkInsert('attendance', attendance, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('attendance', null, {});
  }
};