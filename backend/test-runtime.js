// File sederhana untuk mengetes lingkungan runtime Vercel
module.exports = (req, res) => {
  try {
    // Log informasi dasar
    console.log('Function executed at:', new Date().toISOString());
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    // Kirim response sederhana
    res.status(200).json({
      success: true,
      message: 'Vercel runtime is working',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent']
      }
    });
  } catch (error) {
    console.error('Error in function:', error);
    res.status(500).json({
      success: false,
      message: 'Error in function',
      error: error.message
    });
  }
};