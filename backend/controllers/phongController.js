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
        res.status(500).json({
            message: err.message
        });
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

        res.status(500).json({
            message: err.message
        });

    }
};


// ================= CREATE ROOM =================
exports.createRoom = async (req, res) => {

    try {

        const {
            maLoaiPhong,
            tinhTrang,
            ghiChu
        } = req.body;

        const result = await db.query(`
            INSERT INTO PHONG
            (MaLoaiPhong, TinhTrang, GhiChu)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [
            maLoaiPhong,
            tinhTrang,
            ghiChu
        ]);

        res.status(201).json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};


// ================= UPDATE ROOM =================
exports.updateRoom = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            maLoaiPhong,
            tinhTrang,
            ghiChu
        } = req.body;

        const result = await db.query(`
            UPDATE PHONG
            SET
                MaLoaiPhong = $1,
                TinhTrang = $2,
                GhiChu = $3
            WHERE SoPhong = $4
            RETURNING *
        `, [
            maLoaiPhong,
            tinhTrang,
            ghiChu,
            id
        ]);

        res.json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};


// ================= DELETE ROOM =================
exports.deleteRoom = async (req, res) => {

    try {

        const { id } = req.params;

        await db.query(`
            DELETE FROM PHONG
            WHERE SoPhong = $1
        `, [id]);

        res.json({
            message: "Xóa phòng thành công"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};


// ================= GET ROOM TYPES =================
exports.getRoomTypes = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT *
            FROM LOAIPHONG
            ORDER BY MaLoaiPhong ASC
        `);

        res.json(result.rows);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};


// ================= CREATE ROOM TYPE =================
exports.createRoomType = async (req, res) => {

    try {

        const {
            loaiPhong,
            donGia
        } = req.body;

        const result = await db.query(`
            INSERT INTO LOAIPHONG
            (LoaiPhong, DonGia)
            VALUES ($1, $2)
            RETURNING *
        `, [
            loaiPhong,
            donGia
        ]);

        res.status(201).json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};


// ================= UPDATE ROOM TYPE =================
exports.updateRoomType = async (req, res) => {

    try {

        const { id } = req.params;

        const { donGia } = req.body;

        const result = await db.query(`
            UPDATE LOAIPHONG
            SET DonGia = $1
            WHERE MaLoaiPhong = $2
            RETURNING *
        `, [
            donGia,
            id
        ]);

        res.json(result.rows[0]);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};


// ================= DELETE ROOM TYPE =================
exports.deleteRoomType = async (req, res) => {

    try {

        const { id } = req.params;

        await db.query(`
            DELETE FROM LOAIPHONG
            WHERE MaLoaiPhong = $1
        `, [id]);

        res.json({
            message: "Xóa loại phòng thành công"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};