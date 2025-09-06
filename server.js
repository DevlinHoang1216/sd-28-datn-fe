const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
// Hoặc cho phép tất cả: app.use(cors());

// Các route khác...
app.listen(3000, () => console.log('Server running on port 3000'));