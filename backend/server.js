
const express = require('express');

const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/thue-phong',  require('./routes/thuePhong'));

app.use('/api/hoa-don',     require('./routes/hoaDon'));

app.use('/api/khach-hang',  require('./routes/khachHang'));

app.use('/api/quy-dinh',    require('./routes/quyDinh'));

app.use('/api/co-quan',     require('./routes/coQuan'));

const reportRoutes = require('./routes/report');
app.use('/api/bao-cao', reportRoutes);

const phongRoutes = require('./routes/phongRoutes');
app.use('/api/phong', phongRoutes);

const phanQuyenRoutes = require('./routes/phanQuyen');
app.use('/api/phan-quyen', phanQuyenRoutes);

app.get('/', (req, res) => {

  res.json({ message: 'Backend QLKS đang chạy!' });

});

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {

  console.log('Server chạy tại http://localhost:3000');

});

