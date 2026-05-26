const db = require('../db');

// ======================================================
// TEST API
// ======================================================

exports.testAPI = async (req, res) => {
    res.json({
        success: true,
        message: '✅ Room API working'
    });
};

// ======================================================
// XEM DANH SÁCH PHÒNG
// ======================================================

exports.xemDanhSachPhong = async (req, res) => {

    try {

        const sql = `
            SELECT
                p."SoPhong"       AS sophong,
                p."TinhTrang"    AS tinhtrang,
                p."GhiChu"       AS ghichu,

                lp."MaLoaiPhong" AS maloaiphong,
                lp."LoaiPhong"   AS loaiphong,
                lp."DonGia"      AS dongia

            FROM "PHONG" p

            JOIN "LOAIPHONG" lp
            ON p."MaLoaiPhong" = lp."MaLoaiPhong"

            ORDER BY p."SoPhong" ASC
        `;

        const result = await db.query(sql);

        res.json({
            success: true,
            data: result.rows
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
// XEM CHI TIẾT PHÒNG
// ======================================================

exports.xemChiTietPhong = async (req, res) => {

    try {

        const { id } = req.params;

        const sql = `
            SELECT
                p."SoPhong"       AS sophong,
                p."TinhTrang"    AS tinhtrang,
                p."GhiChu"       AS ghichu,

                lp."MaLoaiPhong" AS maloaiphong,
                lp."LoaiPhong"   AS loaiphong,
                lp."DonGia"      AS dongia

            FROM "PHONG" p

            JOIN "LOAIPHONG" lp
            ON p."MaLoaiPhong" = lp."MaLoaiPhong"

            WHERE p."SoPhong" = $1
        `;

        const result = await db.query(sql, [id]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
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
// THÊM PHÒNG
// ======================================================

exports.themPhong = async (req, res) => {

    try {

        const {
            soPhong,
            maLoaiPhong,
            tinhTrang,
            ghiChu
        } = req.body;

        if (!soPhong || !maLoaiPhong) {

            return res.status(400).json({
                success: false,
                message: 'Thiếu dữ liệu'
            });
        }

        // kiểm tra phòng tồn tại
        const check = await db.query(`
            SELECT *
            FROM "PHONG"
            WHERE "SoPhong" = $1
        `, [soPhong]);

        if (check.rows.length > 0) {

            return res.status(400).json({
                success: false,
                message: 'Số phòng đã tồn tại'
            });
        }

        const sql = `
            INSERT INTO "PHONG"
            (
                "SoPhong",
                "MaLoaiPhong",
                "TinhTrang",
                "GhiChu"
            )
            VALUES ($1, $2, $3, $4)

            RETURNING *
        `;

        const result = await db.query(sql, [
            soPhong,
            maLoaiPhong,
            tinhTrang,
            ghiChu
        ]);

        res.status(201).json({
            success: true,
            data: result.rows[0]
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
// CẬP NHẬT PHÒNG
// ======================================================

exports.capNhatPhong = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            maLoaiPhong,
            tinhTrang,
            ghiChu
        } = req.body;

        const sql = `
            UPDATE "PHONG"

            SET
                "MaLoaiPhong" = $1,
                "TinhTrang" = $2,
                "GhiChu" = $3

            WHERE "SoPhong" = $4

            RETURNING *
        `;

        const result = await db.query(sql, [
            maLoaiPhong,
            tinhTrang,
            ghiChu,
            id
        ]);

        res.json({
            success: true,
            data: result.rows[0]
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
// XÓA PHÒNG
// ======================================================

exports.xoaPhong = async (req, res) => {

    try {

        const { id } = req.params;

        await db.query(`
            DELETE FROM "PHONG"
            WHERE "SoPhong" = $1
        `, [id]);

        res.json({
            success: true,
            message: 'Xóa phòng thành công'
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
// XEM LOẠI PHÒNG
// ======================================================

exports.xemLoaiPhong = async (req, res) => {

    try {

        const sql = `
            SELECT
                "MaLoaiPhong" AS maloaiphong,
                "LoaiPhong"   AS loaiphong,
                "DonGia"      AS dongia
            FROM "LOAIPHONG"

            ORDER BY "MaLoaiPhong" ASC
        `;

        const result = await db.query(sql);

        res.json({
            success: true,
            data: result.rows
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
// THÊM LOẠI PHÒNG
// ======================================================

exports.themLoaiPhong = async (req, res) => {

    try {

        const {
            loaiPhong,
            donGia
        } = req.body;

        if (!loaiPhong || !donGia) {

            return res.status(400).json({
                success: false,
                message: 'Thiếu dữ liệu'
            });
        }

        const sql = `
            INSERT INTO "LOAIPHONG"
            (
                "LoaiPhong",
                "DonGia"
            )
            VALUES ($1, $2)

            RETURNING *
        `;

        const result = await db.query(sql, [
            loaiPhong,
            donGia
        ]);

        res.status(201).json({
            success: true,
            data: result.rows[0]
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
// CẬP NHẬT LOẠI PHÒNG
// ======================================================

exports.capNhatLoaiPhong = async (req, res) => {

    try {

        const { id } = req.params;

        const { donGia } = req.body;

        const sql = `
            UPDATE "LOAIPHONG"

            SET
                "DonGia" = $1

            WHERE "MaLoaiPhong" = $2

            RETURNING *
        `;

        const result = await db.query(sql, [
            donGia,
            id
        ]);

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

