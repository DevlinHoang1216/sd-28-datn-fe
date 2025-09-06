module.exports = (req, res, next) => {
  if (req.url.startsWith('/dashboard') && req.method === 'GET') {
    const { fromDate, toDate, category } = req.query;
    let data = require('./db.json').dashboard;

    if (fromDate && toDate) {
      data = {
        ...data,
        revenueData: data.revenueData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
        })
      };
    }
    // Thêm logic lọc category nếu cần (tùy thuộc vào cách dữ liệu được cấu trúc)
    res.json(data);
  } else {
    next();
  }
};