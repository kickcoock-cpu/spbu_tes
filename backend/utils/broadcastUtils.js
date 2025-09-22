// utils/broadcastUtils.js
const { connectedClients } = require('../socket');

// Function to broadcast dashboard updates to all connected clients
const broadcastDashboardUpdate = async (userId = null, spbuId = null, userRole = null) => {
  // If specific user data is provided, only broadcast to that user's SPBU
  // Otherwise, broadcast to all connected clients with appropriate filtering
  
  if (connectedClients && connectedClients.size > 0) {
    try {
      // Import dashboard controller function
      const { getDashboard } = require('../controllers/dashboardController');
      
      // Broadcast to each connected client with their specific data
      for (const [clientId, socket] of connectedClients) {
        try {
          // Create a mock request object with user context
          const mockReq = {
            user: {
              Role: { name: 'Super Admin' }, // Default to Super Admin
              id: 1,
              spbu_id: null
            }
          };
          
          // If we have user info, use it
          if (userId && spbuId && userRole) {
            mockReq.user = {
              Role: { name: userRole },
              id: userId,
              spbu_id: userRole === 'Super Admin' ? null : spbuId
            };
          }
          
          // Create a mock response object
          const mockRes = {
            status: function(code) {
              this.statusCode = code;
              return this;
            },
            json: function(data) {
              // Send data to the specific client
              socket.emit('dashboardDataUpdate', data);
            }
          };
          
          // Call the dashboard controller
          await getDashboard(mockReq, mockRes);
        } catch (clientError) {
          console.error('Error sending dashboard data to client:', clientId, clientError);
        }
      }
    } catch (error) {
      console.error('Error broadcasting dashboard data:', error);
      // Send error to all clients
      if (connectedClients) {
        for (const [clientId, socket] of connectedClients) {
          socket.emit('dashboardDataError', { message: 'Failed to fetch dashboard data' });
        }
      }
    }
  }
};

module.exports = { broadcastDashboardUpdate };