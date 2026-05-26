const db = require("../db");

// ================= GET ALL ROOMS =================
exports.getRooms = async (req, res) => {
    try {

        const result = await db.query(`
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
        `);

        res.json(result.rows);

    } catch (err) {

        console.error("GET ROOMS ERROR:", err);

        res.status(500).json({
            success: false,
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
        `, [id]);

        res.json(result.rows[0]);

    } catch (err) {

        console.error("GET ROOM DETAIL ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= CREATE ROOM =================
exports.createRoom = async (req, res) => {

    try {

        const {
            soPhong,
            maLoaiPhong,
            tinhTrang,
            ghiChu
        } = req.body;

        const result = await db.query(`
            INSERT INTO "PHONG"
            (
                "SoPhong",
                "MaLoaiPhong",
                "TinhTrang",
                "GhiChu"
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
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

        console.error("CREATE ROOM ERROR:", err);

        res.status(500).json({
            success: false,
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
            UPDATE "PHONG"
            SET
                "MaLoaiPhong" = $1,
                "TinhTrang" = $2,
                "GhiChu" = $3

            WHERE "SoPhong" = $4

            RETURNING *
        `, [
            maLoaiPhong,
            tinhTrang,
            ghiChu,
            id
        ]);

        res.json(result.rows[0]);

    } catch (err) {

        console.error("UPDATE ROOM ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= DELETE ROOM =================
exports.deleteRoom = async (req, res) => {

    try {

        const { id } = req.params;

        await db.query(`
            DELETE FROM "PHONG"
            WHERE "SoPhong" = $1
        `, [id]);

        res.json({
            success: true,
            message: "Xóa phòng thành công"
        });

    } catch (err) {

        console.error("DELETE ROOM ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= GET ROOM TYPES =================
exports.getRoomTypes = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                "MaLoaiPhong" AS maloaiphong,
                "LoaiPhong"   AS loaiphong,
                "DonGia"      AS dongia

            FROM "LOAIPHONG"

            ORDER BY "MaLoaiPhong" ASC
        `);

        res.json(result.rows);

    } catch (err) {

        console.error("GET ROOM TYPES ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= CREATE ROOM TYPE =================
exports.createRoomType = async (req, res) => {

    try {

        const {
            maLoaiPhong,
            loaiPhong,
            donGia
        } = req.body;

        if (!loaiPhong || !donGia) {

            return res.status(400).json({
                success: false,
                message: "Thiếu dữ liệu"
            });
        }

        // CHECK DUPLICATE
        if (maLoaiPhong) {

            const check = await db.query(`
                SELECT *
                FROM "LOAIPHONG"
                WHERE "MaLoaiPhong" = $1
            `, [maLoaiPhong]);

            if (check.rows.length > 0) {

                return res.status(400).json({
                    success: false,
                    message: "Mã loại phòng đã tồn tại"
                });
            }

            const result = await db.query(`
                INSERT INTO "LOAIPHONG"
                (
                    "MaLoaiPhong",
                    "LoaiPhong",
                    "DonGia"
                )
                VALUES ($1, $2, $3)

                RETURNING *
            `, [
                maLoaiPhong,
                loaiPhong,
                donGia
            ]);

            return res.status(201).json({
                success: true,
                data: result.rows[0]
            });
        }

        // AUTO SERIAL
        const result = await db.query(`
            INSERT INTO "LOAIPHONG"
            (
                "LoaiPhong",
                "DonGia"
            )
            VALUES ($1, $2)

            RETURNING *
        `, [
            loaiPhong,
            donGia
        ]);

        return res.status(201).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {

        console.error("CREATE ROOM TYPE ERROR:", err);

        res.status(500).json({
            success: false,
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
            UPDATE "LOAIPHONG"

            SET "DonGia" = $1

            WHERE "MaLoaiPhong" = $2

            RETURNING *
        `, [
            donGia,
            id
        ]);

        res.json(result.rows[0]);

    } catch (err) {

        console.error("UPDATE ROOM TYPE ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ================= DELETE ROOM TYPE =================
exports.deleteRoomType = async (req, res) => {

    try {

        const { id } = req.params;

        await db.query(`
            DELETE FROM "LOAIPHONG"
            WHERE "MaLoaiPhong" = $1
        `, [id]);

        res.json({
            success: true,
            message: "Xóa loại phòng thành công"
        });

    } catch (err) {

        console.error("DELETE ROOM TYPE ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};