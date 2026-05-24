const db = require('../db');
exports.getRevenueReport = async (req, res) => {
    const { filterType, value } = req.query; // filterType: "month" hoặc "year"
    try {
        let condition = '';
        let params = [value];

        // Chuẩn hóa điều kiện lọc theo đúng tên cột chữ thường trong database thực tế
        if (filterType === 'month') {
            condition = `TO_CHAR(hd.ngaythanhtoan, 'YYYY-MM') = $1`;
        } else {
            condition = `EXTRACT(YEAR FROM hd.ngaythanhtoan) = $1`;
        }
        const query = `
            SELECT 
                lp.loaiphong AS "type",
                COALESCE(SUM(cthd.trigia), 0)::INTEGER AS "revenue",
                COUNT(DISTINCT tp.mathuephong)::INTEGER AS "count"
            FROM loaiphong lp
            LEFT JOIN phong p ON lp.maloaiphong = p.maloaiphong
            LEFT JOIN thuephong tp ON p.sophong = tp.sophong
            LEFT JOIN cthoadon cthd ON tp.mathuephong = cthd.mathuephong
            LEFT JOIN hoadon hd ON cthd.mahoadon = hd.mahoadon
            WHERE ${condition}
            GROUP BY lp.loaiphong;
        `;


        const result = await db.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Lỗi backend lấy báo cáo doanh thu: " + error.message });
    }
};

exports.getGuestReport = async (req, res) => {
    const { filterType, value } = req.query; // filterType: "month" hoặc "year"
    try {
        let condition = '';
        let params = [value];

        // Chuẩn hóa điều kiện lọc thời gian theo cột ngày bắt đầu thuê
        if (filterType === 'month') {
            condition = `TO_CHAR(tp.ngaybatdauthue, 'YYYY-MM') = $1`;
        } else {
            condition = `EXTRACT(YEAR FROM tp.ngaybatdauthue) = $1`;
        }

        // Câu lệnh SQL truy vấn đếm lượng khách lưu trú theo phân loại khách
        const query = `
            SELECT 
                TO_CHAR(tp.ngaybatdauthue, 'YYYY-MM') AS "month",
                lk.loaikhach AS "type",
                COUNT(cttp.makhachhang)::INTEGER AS "count"
            FROM loaikhach lk
            LEFT JOIN khachhang kh ON lk.maloaikhach = kh.maloaikhach
            LEFT JOIN ctthuephong cttp ON kh.makhachhang = cttp.makhachhang
            LEFT JOIN thuephong tp ON cttp.mathuephong = tp.mathuephong
            WHERE ${condition}
            GROUP BY TO_CHAR(tp.ngaybatdauthue, 'YYYY-MM'), lk.loaikhach
            ORDER BY "month" ASC, lk.loaikhach ASC;
        `;

        // Thực hiện gọi hàm truy vấn trực tiếp từ pool (db)
        const result = await db.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Lỗi backend lấy báo cáo khách: " + error.message });
    }
};