const pool = require('../db');

exports.getRooms = async (req, res) => {
    try {
        const query = `
            SELECT p.SoPhong as id, p.TinhTrang as status, p.GhiChu as notes,
                   lp.MaLoaiPhong as type, lp.LoaiPhong as "typeName", lp.DonGia as price
            FROM PHONG p
            JOIN LOAIPHONG lp ON p.MaLoaiPhong = lp.MaLoaiPhong
            ORDER BY p.SoPhong ASC
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách phòng:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách phòng" });
    }
};

exports.createRoom = async (req, res) => {
    // Nhận id (Số phòng) từ người dùng nhập
    const { id, type, status, notes } = req.body; 
    try {
        if (!id) return res.status(400).json({ error: "Vui lòng nhập Số phòng!" });

        const dbStatus = status === 'available' ? 'Trống' : 
                         status === 'occupied' ? 'Đang thuê' : 'Dọn dẹp';

        const query = `
            INSERT INTO PHONG (SoPhong, MaLoaiPhong, TinhTrang, GhiChu)
            VALUES ($1, $2, $3, $4) RETURNING SoPhong as id
        `;
        const result = await pool.query(query, [id, type, dbStatus, notes || '']);
        res.status(201).json({ success: true, message: "Thêm phòng thành công!", id: result.rows[0].id });
    } catch (error) {
        console.error("Lỗi thêm phòng:", error);
        if (error.code === '23505') { 
            return res.status(400).json({ error: "Số phòng này đã tồn tại! Vui lòng nhập số khác." });
        }
        res.status(500).json({ error: "Lỗi hệ thống khi thêm phòng" });
    }
};

exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { type, status, notes } = req.body;
    try {
        const dbStatus = status === 'available' ? 'Trống' : 
                         status === 'occupied' ? 'Đang thuê' : 
                         (status === 'Trống' || status === 'Đang thuê') ? status : 'Dọn dẹp';

        const query = `
            UPDATE PHONG
            SET MaLoaiPhong = $1, TinhTrang = $2, GhiChu = $3
            WHERE SoPhong = $4
        `;
        const result = await pool.query(query, [type, dbStatus, notes || '', id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Không tìm thấy phòng cần cập nhật" });
        }
        res.status(200).json({ success: true, message: "Cập nhật phòng thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật phòng:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi cập nhật phòng" });
    }
};

exports.deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM PHONG WHERE SoPhong = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Không tìm thấy phòng để xóa" });
        }
        res.status(200).json({ success: true, message: "Xóa phòng thành công!" });
    } catch (error) {
        console.error("Lỗi xóa phòng:", error);
        res.status(500).json({ error: "Không thể xóa phòng (Phòng đã có lịch sử thuê/hóa đơn)" });
    }
};

exports.getRoomTypes = async (req, res) => {
    try {
        const query = `
            SELECT MaLoaiPhong as id, LoaiPhong as name, DonGia as price
            FROM LOAIPHONG
            ORDER BY MaLoaiPhong ASC
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách loại phòng:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách loại phòng" });
    }
};

exports.createRoomType = async (req, res) => {
    // Nhận id (Mã loại phòng) từ người dùng nhập
    const { id, name, price } = req.body;
    try {
        if (!id) return res.status(400).json({ error: "Vui lòng nhập Mã loại phòng!" });

        const query = `
            INSERT INTO LOAIPHONG (MaLoaiPhong, LoaiPhong, DonGia)
            VALUES ($1, $2, $3) RETURNING MaLoaiPhong as id
        `;
        const result = await pool.query(query, [id, name, price]);
        res.status(201).json({ success: true, message: "Thêm loại phòng thành công!", id: result.rows[0].id });
    } catch (error) {
        console.error("Lỗi thêm loại phòng:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: "Mã loại phòng này đã tồn tại! Vui lòng nhập mã khác." });
        }
        res.status(500).json({ error: "Lỗi hệ thống khi thêm loại phòng" });
    }
};

exports.updateRoomTypePrice = async (req, res) => {
    const { id } = req.params;
    const { price } = req.body;
    try {
        const query = `UPDATE LOAIPHONG SET DonGia = $1 WHERE MaLoaiPhong = $2`;
        const result = await pool.query(query, [price, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Không tìm thấy loại phòng cần cập nhật" });
        }
        res.status(200).json({ success: true, message: "Cập nhật giá thành công!" });
    } catch (error) {
        console.error("Lỗi cập nhật giá loại phòng:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi chỉnh sửa đơn giá" });
    }
};

exports.deleteRoomType = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM LOAIPHONG WHERE MaLoaiPhong = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Không tìm thấy loại phòng để xóa" });
        }
        res.status(200).json({ success: true, message: "Xóa loại phòng thành công!" });
    } catch (error) {
        console.error("Lỗi xóa loại phòng:", error);
        res.status(500).json({ error: "Không thể xóa loại phòng này vì có phòng thuộc loại này đang tồn tại." });
    }
};