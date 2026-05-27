const db = require('../db');

exports.testAPI = async (req, res) => {
    res.json({
        success: true,
        message: '✅ Report API working'
    });
};

// ======================================================
// BÁO CÁO DOANH THU
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

        let sql = `
            SELECT
                lp.loaiphong AS loaiphong,
                SUM(ct.doanhthu) AS doanhthu,
                SUM(ct.soluotthue) AS soluotthue
            FROM ctbaocaodoanhthu ct
            JOIN baocaodoanhthu bc ON ct.mabaocao = bc.mabaocao
            JOIN loaiphong lp ON ct.loaiphong = lp.maloaiphong
            WHERE bc.nam = $1
        `;

        const params = [year];

        if (filterType === 'month') {
            sql += ` AND bc.thang = $2 `;
            params.push(month);
        }

        sql += `
            GROUP BY lp.loaiphong
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
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ======================================================
// BÁO CÁO KHÁCH
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
                bc.thang AS thang,
                bc.nam AS nam,
                lk.loaikhach AS loaikhach,
                SUM(ct.soluongkhach) AS soluong
            FROM ctbaocaokhach ct
            JOIN baocaokhach bc ON ct.mabaocaokhach = bc.mabaocaokhach
            JOIN loaikhach lk ON ct.loaikhach = lk.maloaikhach
            WHERE bc.nam = $1
        `;

        const params = [year];

        if (filterType === 'month') {
            sql += ` AND bc.thang = $2 `;
            params.push(month);
        }

        sql += `
            GROUP BY bc.thang, bc.nam, lk.loaikhach
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
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};