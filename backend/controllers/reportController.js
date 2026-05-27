const db = require('../db');

exports.testAPI = async (req, res) => {
    res.json({
        success: true,
        message: '✅ Report API working dynamically'
    });
};

// ======================================================
// BÁO CÁO DOANH THU (Tính trực tiếp từ HÓA ĐƠN)
// ======================================================
exports.xemBaoCaoDoanhThu = async (req, res) => {
    try {
        const { filterType, value } = req.query;
        let year;
        let month;

        if (filterType === 'month') {
            const parts = value.split('-');
            year = parseInt(parts[0]);
            month = parseInt(parts[1]);
        } else {
            year = parseInt(value);
        }

        // Truy vấn tính tổng doanh thu và lượt thuê từ hóa đơn đã thanh toán
        let sql = `
            SELECT
                lp.LoaiPhong AS loaiphong,
                SUM(cthd.TriGia)::INTEGER AS doanhthu,
                COUNT(DISTINCT tp.MaThuePhong)::INTEGER AS soluotthue
            FROM CTHOADON cthd
            JOIN HOADON hd ON cthd.MaHoaDon = hd.MaHoaDon
            JOIN THUEPHONG tp ON cthd.MaThuePhong = tp.MaThuePhong
            JOIN PHONG p ON tp.SoPhong = p.SoPhong
            JOIN LOAIPHONG lp ON p.MaLoaiPhong = lp.MaLoaiPhong
            WHERE EXTRACT(YEAR FROM hd.NgayThanhToan) = $1
        `;

        const params = [year];

        if (filterType === 'month') {
            sql += ` AND EXTRACT(MONTH FROM hd.NgayThanhToan) = $2 `;
            params.push(month);
        }

        sql += `
            GROUP BY lp.LoaiPhong
            ORDER BY doanhthu DESC
        `;

        const result = await db.query(sql, params);

        let tongDoanhThu = 0;
        let tongLuotThue = 0;

        // Tính tổng toàn bộ trước để làm mẫu số chia tỷ lệ (%)
        result.rows.forEach(item => {
            tongDoanhThu += Number(item.doanhthu || 0);
            tongLuotThue += Number(item.soluotthue || 0);
        });

        // Map dữ liệu chuẩn format cho report.js (Frontend)
        const data = result.rows.map(item => {
            const doanhThu = Number(item.doanhthu || 0);
            const soLuotThue = Number(item.soluotthue || 0);

            return {
                type: item.loaiphong,
                revenue: doanhThu,
                count: soLuotThue,
                percent: tongDoanhThu > 0 ? ((doanhThu / tongDoanhThu) * 100).toFixed(1) : 0,
                rentPercent: tongLuotThue > 0 ? ((soLuotThue / tongLuotThue) * 100).toFixed(1) : 0
            };
        });

        res.json({
            success: true,
            totalRevenue: tongDoanhThu,
            totalCount: tongLuotThue,
            data
        });

    } catch (err) {
        console.error("Lỗi API Báo cáo doanh thu:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ======================================================
// BÁO CÁO KHÁCH (Tính trực tiếp từ CHI TIẾT THUÊ PHÒNG)
// ======================================================
exports.xemBaoCaoKhach = async (req, res) => {
    try {
        const { filterType, value } = req.query;
        let year;
        let month;

        if (filterType === 'month') {
            const parts = value.split('-');
            year = parseInt(parts[0]);
            month = parseInt(parts[1]);
        } else {
            year = parseInt(value);
        }

        // Truy vấn đếm số lượng khách thực tế từ phiếu thuê phòng
        let sql = `
            SELECT
                EXTRACT(MONTH FROM tp.NgayBatDauThue)::INTEGER AS thang,
                EXTRACT(YEAR FROM tp.NgayBatDauThue)::INTEGER AS nam,
                lk.LoaiKhach AS loaikhach,
                COUNT(cttp.MaKhachHang)::INTEGER AS soluong
            FROM CTTHUEPHONG cttp
            JOIN THUEPHONG tp ON cttp.MaThuePhong = tp.MaThuePhong
            JOIN KHACHHANG kh ON cttp.MaKhachHang = kh.MaKhachHang
            JOIN LOAIKHACH lk ON kh.MaLoaiKhach = lk.MaLoaiKhach
            WHERE EXTRACT(YEAR FROM tp.NgayBatDauThue) = $1
        `;

        const params = [year];

        if (filterType === 'month') {
            sql += ` AND EXTRACT(MONTH FROM tp.NgayBatDauThue) = $2 `;
            params.push(month);
        }

        sql += `
            GROUP BY EXTRACT(MONTH FROM tp.NgayBatDauThue), EXTRACT(YEAR FROM tp.NgayBatDauThue), lk.LoaiKhach
            ORDER BY soluong DESC
        `;

        const result = await db.query(sql, params);
        let tongKhach = 0;

        // Tính tổng số khách
        result.rows.forEach(item => {
            tongKhach += Number(item.soluong || 0);
        });

        // Map dữ liệu chuẩn format cho report.js (Frontend)
        const data = result.rows.map(item => {
            const soLuong = Number(item.soluong || 0);
            return {
                month: `${item.thang}/${item.nam}`,
                type: item.loaikhach,
                count: soLuong,
                percent: tongKhach > 0 ? ((soLuong / tongKhach) * 100).toFixed(1) : 0
            };
        });

        res.json({
            success: true,
            total: tongKhach,
            data
        });

    } catch (err) {
        console.error("Lỗi API Báo cáo khách:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};