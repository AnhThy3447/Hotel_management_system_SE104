const db = require("../db");

// ================= GET ALL ROOMS =================
exports.getRooms = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                p.SoPhong,
                p.TinhTrang,
                p.GhiChu,
                lp.MaLoaiPhong,
                lp.LoaiPhong,
                lp.DonGia
            FROM PHONG p
            JOIN LOAIPHONG lp
            ON p.MaLoaiPhong = lp.MaLoaiPhong
            ORDER BY p.SoPhong ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= GET ROOM DETAIL =================
exports.getRoomDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT
                p.SoPhong,
                p.TinhTrang,
                p.GhiChu,
                lp.MaLoaiPhong,
                lp.LoaiPhong,
                lp.DonGia
            FROM PHONG p
            JOIN LOAIPHONG lp
            ON p.MaLoaiPhong = lp.MaLoaiPhong
            WHERE p.SoPhong = $1
        `, [id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= CREATE ROOM =================
exports.createRoom = async (req, res) => {
    try {
        const { soPhong, maLoaiPhong, tinhTrang, ghiChu } = req.body;
        const result = await db.query(`
            INSERT INTO PHONG (SoPhong, MaLoaiPhong, TinhTrang, GhiChu)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [soPhong, maLoaiPhong, tinhTrang, ghiChu]);

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.error("CREATE ROOM ERROR:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ================= UPDATE ROOM =================
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { maLoaiPhong, tinhTrang, ghiChu } = req.body;
        const result = await db.query(`
            UPDATE PHONG
            SET MaLoaiPhong = $1, TinhTrang = $2, GhiChu = $3
            WHERE SoPhong = $4
            RETURNING *
        `, [maLoaiPhong, tinhTrang, ghiChu, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= DELETE ROOM =================
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM PHONG WHERE SoPhong = $1`, [id]);
        res.json({ message: "Xóa phòng thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= GET ROOM TYPES =================
exports.getRoomTypes = async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM LOAIPHONG ORDER BY MaLoaiPhong ASC`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createRoomType = async (req, res) => {
    try {
        // Front-end gửi lên maLoaiPhong, loaiPhong, donGia
        const { maLoaiPhong, loaiPhong, donGia } = req.body;

        if (!maLoaiPhong || !loaiPhong || !donGia) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc (Mã loại phòng, Tên loại phòng, Đơn giá)"
            });
        }
        const checkExist = await db.query(
            `SELECT * FROM LOAIPHONG WHERE MaLoaiPhong = $1`,
            [maLoaiPhong]
        );

        if (checkExist.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Mã loại phòng số ${maLoaiPhong} đã tồn tại trong hệ thống!`
            });
        }

        // 2. Thực hiện chèn dữ liệu số nguyên thủ công vào cột MaLoaiPhong
        const result = await db.query(`
            INSERT INTO LOAIPHONG (MaLoaiPhong, LoaiPhong, DonGia)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [maLoaiPhong, loaiPhong, donGia]);

        // Trả về JSON thành công chuẩn chỉnh
        return res.status(201).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {
        console.error("❌ LỖI TẠI CREATE_ROOM_TYPE_CONTROLLER:", err.message);
            return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống cơ sở dữ liệu: " + err.message
        });
    }
};
// ================= UPDATE ROOM TYPE =================
exports.updateRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        const { donGia } = req.body;
        const result = await db.query(`
            UPDATE LOAIPHONG SET DonGia = $1 WHERE MaLoaiPhong = $2 RETURNING *
        `, [donGia, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= DELETE ROOM TYPE =================
exports.deleteRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM LOAIPHONG WHERE MaLoaiPhong = $1`, [id]);
        res.json({ message: "Xóa loại phòng thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};