'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Generate audit log data
    const auditLogs = [];
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'];
    const resources = ['User', 'SPBU', 'Sale', 'Delivery', 'Deposit', 'Price', 'Attendance', 'Adjustment'];
    
    // Generate 100 audit log records
    for (let i = 0; i < 100; i++) {
      // Random user (1-10)
      const userId = Math.floor(Math.random() * 10) + 1;
      
      // Random action
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      // Random resource
      const resource = resources[Math.floor(Math.random() * resources.length)];
      
      // Random resource_id
      const resourceId = Math.floor(Math.random() * 100) + 1;
      
      // Random date in the past 60 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 60));
      
      // Random details
      const details = {
        ip: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        additionalInfo: `Performed ${action} on ${resource}`
      };
      
      auditLogs.push({
        user_id: userId,
        action: action,
        resource: resource,
        resource_id: resourceId.toString(),
        details: JSON.stringify(details),
        timestamp: date
      });
    }
    
    await queryInterface.bulkInsert('audit_logs', auditLogs, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('audit_logs', null, {});
  }
};