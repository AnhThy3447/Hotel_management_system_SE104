const db = require('../db');

exports.taoPhieuThue = async (req, res) => {
  try {
    const { SoPhong, NgayLap, NgayBatDauThue, DanhSachKhach } = req.body;
    const danhSach = Array.isArray(DanhSachKhach) ? DanhSachKhach : [];

    // Kiểm tra phòng có đang được thuê không
    const phongCheck = await db.query(
        `SELECT TinhTrang FROM PHONG WHERE SoPhong = $1`, [SoPhong]
    );
    if (phongCheck.rows[0]?.tinhtrang === 'Đang thuê') {
        return res.status(400).json({ success: false, message: 'Phòng này đang được thuê!' });
    }

    const phieu = await db.query(
      `INSERT INTO THUEPHONG (SoPhong, NgayLap, NgayBatDauThue)
       VALUES ($1, $2, $3) RETURNING *`,
      [SoPhong, NgayLap, NgayBatDauThue]
    );
    const MaThuePhong = phieu.rows[0].mathuephong;
    await db.query(
    `UPDATE PHONG SET TinhTrang = 'Đang thuê' WHERE SoPhong = $1`,
    [SoPhong]
    );

    for (let i = 0; i < danhSach.length; i++) {
      const k = danhSach[i];

      // Tìm khách theo CMND
      let khach = await db.query(
        `SELECT MaKhachHang FROM KHACHHANG WHERE CMND = $1`, [k.idNumber]
      );

      let MaKhachHang;
      if (khach.rows.length > 0) {
        MaKhachHang = khach.rows[0].makhachhang;
      } else {
        // Tạo khách mới nếu chưa có
        const loai = await db.query(
          `SELECT MaLoaiKhach FROM LOAIKHACH WHERE LoaiKhach ILIKE $1`,
          [k.type === 'nước ngoài' ? 'Nước ngoài' : 'Nội địa']
        );
        const MaLoaiKhach = loai.rows[0]?.maloaikhach || 1;

        const newKhach = await db.query(
          `INSERT INTO KHACHHANG (TenKhachHang, MaLoaiKhach, CMND, DiaChi)
           VALUES ($1, $2, $3, $4) RETURNING MaKhachHang`,
          [k.name, MaLoaiKhach, k.idNumber, k.address || '']
        );
        MaKhachHang = newKhach.rows[0].makhachhang;
      }

      await db.query(
        `INSERT INTO CTTHUEPHONG (MaKhachHang, MaThuePhong, ThuTuKhach)
         VALUES ($1, $2, $3)`,
        [MaKhachHang, MaThuePhong, i + 1]
      );
    }

    res.status(201).json({ success: true, data: phieu.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemTatCa = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT tp.MaThuePhong, tp.NgayLap, tp.NgayBatDauThue, tp.NgayTraPhong, tp.SoNgayThue, tp.ThanhTien, tp.SoPhong,
       (SELECT COUNT(*) FROM CTHOADON ct WHERE ct.MaThuePhong = tp.MaThuePhong) > 0 AS DaHoaDon,
       kh.TenKhachHang, kh.CMND, kh.DiaChi, lk.LoaiKhach,
       lp.LoaiPhong, lp.DonGia
      FROM THUEPHONG tp
      LEFT JOIN CTTHUEPHONG ct ON tp.MaThuePhong = ct.MaThuePhong
      LEFT JOIN KHACHHANG kh ON ct.MaKhachHang = kh.MaKhachHang
      LEFT JOIN LOAIKHACH lk ON kh.MaLoaiKhach = lk.MaLoaiKhach
      LEFT JOIN PHONG p ON tp.SoPhong = p.SoPhong
      LEFT JOIN LOAIPHONG lp ON p.MaLoaiPhong = lp.MaLoaiPhong
      ORDER BY tp.NgayLap DESC
    `);
    const grouped = {};
    for (const row of result.rows) {
      const id = row.mathuephong;
      if (!grouped[id]) {
        grouped[id] = {
        mathuephong: id,
        ngaylap: row.ngaylap,
        ngaybatdauthue: row.ngaybatdauthue,
        ngaytrphong: row.ngaytraphong,
        songaythue: row.songaythue,
        thanhtien: row.thanhtien,
        sophong: row.sophong,
        loaiphong: row.loaiphong,
        dongia: row.dongia,
        dahoadon: row.dahoadon,
        guests: []
        };
      }
      if (row.tenkhachhang) {
        grouped[id].guests.push({
          name: row.tenkhachhang,
          type: row.loaikhach || 'Nội địa',
          idNumber: row.cmnd,
          address: row.diachi
        });
      }
    }
    res.json({ success: true, data: Object.values(grouped) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xemChiTiet = async (req, res) => {
  try {
    const { id } = req.params;
    const phieu = await db.query(`
    SELECT tp.*, lp.LoaiPhong, lp.DonGia
    FROM THUEPHONG tp
    LEFT JOIN PHONG p ON tp.SoPhong = p.SoPhong
    LEFT JOIN LOAIPHONG lp ON p.MaLoaiPhong = lp.MaLoaiPhong
    WHERE tp.MaThuePhong = $1
`, [id]);
    const chitiet = await db.query(`
      SELECT ct.*, kh.TenKhachHang, kh.CMND, kh.DiaChi, lk.LoaiKhach
      FROM CTTHUEPHONG ct
      LEFT JOIN KHACHHANG kh ON ct.MaKhachHang = kh.MaKhachHang
      LEFT JOIN LOAIKHACH lk ON kh.MaLoaiKhach = lk.MaLoaiKhach
      WHERE ct.MaThuePhong = $1
    `, [id]);
    res.json({ success: true, data: { phieu: phieu.rows[0], chitiet: chitiet.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.capNhat = async (req, res) => {
  try {
    const { id } = req.params;
    const { SoPhong, NgayLap, NgayBatDauThue } = req.body;
    const result = await db.query(
      `UPDATE THUEPHONG SET SoPhong=$1, NgayLap=$2, NgayBatDauThue=$3
       WHERE MaThuePhong=$4 RETURNING *`,
      [SoPhong, NgayLap, NgayBatDauThue, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.traPhong = async (req, res) => {
  try {
    const { id } = req.params;
    const { NgayTraPhong, SoNgayThue, ThanhTien } = req.body;
    const result = await db.query(
      `UPDATE THUEPHONG SET NgayTraPhong=$1, SoNgayThue=$2, ThanhTien=$3
       WHERE MaThuePhong=$4 RETURNING *`,
      [NgayTraPhong, SoNgayThue, ThanhTien, id]
    );
    await db.query(
      `UPDATE PHONG SET TinhTrang = 'Trống' WHERE SoPhong = (SELECT SoPhong FROM THUEPHONG WHERE MaThuePhong = $1)`,
      [id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.xoaPhieuThue = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM CTTHUEPHONG WHERE MaThuePhong = $1`, [id]);
    await db.query(`DELETE FROM THUEPHONG WHERE MaThuePhong = $1`, [id]);
    res.json({ success: true, message: 'Đã xóa phiếu thuê!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
