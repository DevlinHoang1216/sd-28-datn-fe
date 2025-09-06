app.post('/api/invoices/:id/return', (req, res) => {
  const { quantity, reason, productId } = req.body;
  // Logic xử lý trả hàng
  res.status(200).json({ message: 'Yêu cầu trả hàng thành công' });
});

app.post('/api/invoices/:id/refund', (req, res) => {
  const { amount } = req.body;
  // Logic xử lý hoàn tiền
  res.status(200).json({ message: 'Hoàn tiền thành công' });
});