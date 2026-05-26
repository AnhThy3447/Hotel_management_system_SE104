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

        // Thực hiện câu truy vấn theo đúng cấu trúc bảng Hoa Thường bạn cung cấp
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
        console.error("Lỗi Controller Khách:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};