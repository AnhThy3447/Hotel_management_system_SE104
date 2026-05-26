const pool = require('../db');

// ======================================================
// BÁO CÁO DOANH THU
// ======================================================

exports.getRevenueReport = async (req, res) => {

    try {

        const { filterType, value } = req.query;

        let month;
        let year;

        // ==================================================
        // KIỂM TRA INPUT
        // ==================================================

        if (!filterType || !value) {

            return res.status(400).json({

                success: false,

                message: 'Thiếu filterType hoặc value'
            });
        }

        // ==================================================
        // XỬ LÝ THỜI GIAN
        // ==================================================

        if (filterType === 'month') {

            const parts = value.split('-');

            year = parseInt(parts[0]);

            month = parseInt(parts[1]);

        } else {

            year = parseInt(value);
        }

        // ==================================================
        // QUERY
        // ==================================================

        let query = `
            SELECT
                lp.LoaiPhong AS type,

                SUM(ct.DoanhThu) AS revenue,

                SUM(ct.SoLuotThue) AS count

            FROM CTBAOCAODOANHTHU ct

            JOIN BAOCAODOANHTHU bc
                ON ct.MaBaoCao = bc.MaBaoCao

            JOIN LOAIPHONG lp
                ON ct.LoaiPhong = lp.MaLoaiPhong

            WHERE bc.Nam = $1
        `;

        let params = [year];

        if (filterType === 'month') {

            query += ` AND bc.Thang = $2`;

            params.push(month);
        }

        query += `
            GROUP BY lp.LoaiPhong
            ORDER BY revenue DESC
        `;

        const result =
            await pool.query(query, params);

        // ==================================================
        // TÍNH TỔNG
        // ==================================================

        let totalRevenue = 0;
        let totalCount = 0;

        result.rows.forEach(item => {

            totalRevenue += Number(item.revenue || 0);

            totalCount += Number(item.count || 0);
        });

        // ==================================================
        // FORMAT
        // ==================================================

        const data = result.rows.map(item => {

            const revenue =
                Number(item.revenue || 0);

            const count =
                Number(item.count || 0);

            return {

                type: item.type,

                revenue,

                count,

                percent:
                    totalRevenue > 0
                        ? (
                            (revenue / totalRevenue) * 100
                        ).toFixed(1)
                        : 0,

                rentPercent:
                    totalCount > 0
                        ? (
                            (count / totalCount) * 100
                        ).toFixed(1)
                        : 0
            };
        });

        // ==================================================
        // RESPONSE
        // ==================================================

        res.status(200).json({

            success: true,

            totalRevenue,

            totalCount,

            data
        });

    } catch (error) {

        console.error(
            '❌ Revenue Report Error:',
            error
        );

        res.status(500).json({

            success: false,

            message: 'Lỗi server doanh thu',

            error: error.message
        });
    }
};

// ======================================================
// BÁO CÁO KHÁCH
// ======================================================

exports.getGuestReport = async (req, res) => {

    try {

        const { filterType, value } = req.query;

        let month;
        let year;

        // ==================================================
        // VALIDATE
        // ==================================================

        if (!filterType || !value) {

            return res.status(400).json({

                success: false,

                message: 'Thiếu filterType hoặc value'
            });
        }

        // ==================================================
        // XỬ LÝ THỜI GIAN
        // ==================================================

        if (filterType === 'month') {

            const parts = value.split('-');

            year = parseInt(parts[0]);

            month = parseInt(parts[1]);

        } else {

            year = parseInt(value);
        }

        // ==================================================
        // QUERY
        // ==================================================

        let query = `
            SELECT

                bc.Thang,
                bc.Nam,

                lk.LoaiKhach AS type,

                SUM(ct.SoLuongKhach) AS count

            FROM CTBAOCAOKHACH ct

            JOIN BAOCAOKHACH bc
                ON ct.MaBaoCaoKhach = bc.MaBaoCaoKhach

            JOIN LOAIKHACH lk
                ON ct.LoaiKhach = lk.MaLoaiKhach

            WHERE bc.Nam = $1
        `;

        let params = [year];

        if (filterType === 'month') {

            query += ` AND bc.Thang = $2`;

            params.push(month);
        }

        query += `
            GROUP BY
                bc.Thang,
                bc.Nam,
                lk.LoaiKhach

            ORDER BY count DESC
        `;

        const result =
            await pool.query(query, params);

        // ==================================================
        // TOTAL
        // ==================================================

        let total = 0;

        result.rows.forEach(item => {

            total += Number(item.count || 0);
        });

        // ==================================================
        // FORMAT
        // ==================================================

        const data = result.rows.map(item => {

            const count =
                Number(item.count || 0);

            return {

                month:
                    `${item.nam}-${String(item.thang).padStart(2, '0')}`,

                type: item.type,

                count,

                percent:
                    total > 0
                        ? (
                            (count / total) * 100
                        ).toFixed(1)
                        : 0
            };
        });

        // ==================================================
        // RESPONSE
        // ==================================================

        res.status(200).json({

            success: true,

            total,

            data
        });

    } catch (error) {

        console.error(
            '❌ Guest Report Error:',
            error
        );

        res.status(500).json({

            success: false,

            message: 'Lỗi server báo cáo khách',

            error: error.message
        });
    }
};