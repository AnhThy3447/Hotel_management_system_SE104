
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

// ... Các đoạn app.use của bạn ở trên giữ nguyên hoàn toàn ...

app.get('/', (req, res) => {
  res.json({ message: 'Backend QLKS đang chạy!' });
});

const PORT = process.env.PORT || 3000;

// ==============================================================
// ĐOẠN CODE QUÉT API MỚI (AN TOÀN - KHÔNG LO SẬP SERVER)
// ==============================================================
function printRoutes(app) {
    console.log('\n=== DANH SÁCH CÁC API ĐANG CÓ TRÊN SERVER ===');
    const routes = [];
    
    // Sử dụng cơ chế duyệt stack an toàn hơn bằng cách check điều kiện
    const stack = app._router ? app._router.stack : (app.router ? app.router.stack : []);
    
    stack.forEach((middleware) => {
        if (middleware.route) {
            const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
            routes.push({ Method: methods, URL: middleware.route.path });
        } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
            let prefix = '';
            if (middleware.regexp) {
                // Biến đổi regexp thành chuỗi text url sạch sẽ
                prefix = middleware.regexp.source
                    .replace('^\\', '')
                    .replace('\\/?(?=\\/|$)', '')
                    .replace('\\', '')
                    .replace('(?=\\/|$)', '');
            }
                
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
                    const fullPath = ('/' + prefix + '/' + handler.route.path).replace(/\/+/g, '/');
                    routes.push({ Method: methods, URL: fullPath });
                }
            });
        }
    });

    if (routes.length === 0) {
        console.log('Chưa quét được API nào. Bạn hãy thử gọi 1 request bất kỳ từ trình duyệt để kích hoạt router nhé!');
    } else {
        console.table(routes);
    }
    console.log('=============================================\n');
}

// Chạy server
const server = app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
    
    // Đặt trong setTimeout 200ms để đảm bảo Express đã nạp xong toàn bộ router vào bộ nhớ
    setTimeout(() => {
        try {
            printRoutes(app);
        } catch (e) {
            console.log("Không thể in bảng API tự động, nhưng server vẫn đang chạy bình thường nha bạn!");
        }
    }, 200);
});