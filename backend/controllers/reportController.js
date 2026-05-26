const db = require('../db');

exports.testAPI = async (req, res) => {
    res.json({
        success: true,
        message: '✅ Report API working'
    });
};

// ======================================================
// BÁO CÁO DOANH THU (Đã sửa đổi khớp Schema)
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

        // Câu SQL chuẩn hóa theo đúng tên trường viết hoa/thường của Schema bạn tạo
        let sql = `
            SELECT
                lp."LoaiPhong" AS loaiphong,
                SUM(ct."DoanhThu") AS doanhthu,
                SUM(ct."SoLuotThue") AS soluotthue
            FROM "CTBAOCAODOANHTHU" ct
            JOIN "BAOCAODOANHTHU" bc ON ct."MaBaoCao" = bc."MaBaoCao"
            JOIN "LOAIPHONG" lp ON ct."LoaiPhong" = lp."MaLoaiPhong"
            WHERE bc."Nam" = $1
        `;

        const params = [year];

        if (filterType === 'month') {
            sql += ` AND bc."Thang" = $2 `;
            params.push(month);
        }

        sql += `
            GROUP BY lp."LoaiPhong"
            ORDER BY doanhthu DESC
        `;

        const result = await db.query(sql, params);

        let tongDoanhThu = 0;
        let tongLuotThue = 0;

        result.rows.forEach(item => {
            tongDoanhThu += Number(item.doanhthu || 0);
            tongLuotThue += Number(item.soluotthue || 0);
        });

        const data = result.rows.map(item => {
            const doanhThu = Number(item.doanhthu || 0);
            const soLuotThue = Number(item.soluotthue || 0);

            return {
                type: item.loaiphong, // Trả về 'A', 'B', 'C'
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
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ======================================================
// BÁO CÁO KHÁCH (Đã sửa đổi khớp Schema)
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

        let sql = `
            SELECT
                bc."Thang" AS thang,
                bc."Nam" AS nam,
                lk."LoaiKhach" AS loaikhach,
                SUM(ct."SoLuongKhach") AS soluong
            FROM "CTBAOCAOKHACH" ct
            JOIN "BAOCAOKHACH" bc ON ct."MaBaoCaoKhach" = bc."MaBaoCaoKhach"
            JOIN "LOAIKHACH" lk ON ct."LoaiKhach" = lk."MaLoaiKhach"
            WHERE bc."Nam" = $1
        `;

        const params = [year];

        if (filterType === 'month') {
            sql += ` AND bc."Thang" = $2 `;
            params.push(month);
        }

        sql += `
            GROUP BY bc."Thang", bc."Nam", lk."LoaiKhach"
            ORDER BY soluong DESC
        `;

        const result = await db.query(sql, params);
        let tongKhach = 0;

        result.rows.forEach(item => {
            tongKhach += Number(item.soluong || 0);
        });

        const data = result.rows.map(item => {
            const soLuong = Number(item.soluong || 0);
            return {
                month: `${item.thang}/${item.nam}`,
                type: item.loaikhach, // 'Nội địa' hoặc 'Nước ngoài'
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
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};