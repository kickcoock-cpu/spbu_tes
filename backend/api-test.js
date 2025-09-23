// Fungsi API sederhana untuk testing
module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API test function is working',
    timestamp: new Date().toISOString(),
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers
    }
  });
};