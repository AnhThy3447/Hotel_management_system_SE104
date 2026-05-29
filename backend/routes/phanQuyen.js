const express = require('express');
const router = express.Router();
const phanQuyenController = require('../controllers/phanQuyenController');

// TÀI KHOẢN NGƯỜI DÙNG
router.post('/taikhoan/dangnhap', phanQuyenController.dangNhap);
router.get('/taikhoan/nhanvien', phanQuyenController.layDanhSachNhanVien);
router.post('/taikhoan/nhanvien/them', phanQuyenController.themNhanVien);
router.put('/taikhoan/nhanvien/capnhat/:id', phanQuyenController.capNhatQuyenNhanVien);
router.delete('/taikhoan/nhanvien/xoa/:id', phanQuyenController.xoaNhanVien);
router.put('/taikhoan/doimatkhau', phanQuyenController.doiMatKhau);

// NHÓM NGƯỜI DÙNG & PHÂN QUYỀN
router.get('/nhomquyen', phanQuyenController.layDanhSachNhomQuyen);
router.get('/danh-muc-chuc-nang', phanQuyenController.layTatCaChucNangHeThong);
router.post('/nhomquyen/them', phanQuyenController.themNhomQuyen);
router.put('/nhomquyen/doiten', phanQuyenController.capNhatNhomQuyen);
router.post('/nhomquyen/chucnang/them', phanQuyenController.themChucNangVaoNhom);
router.post('/nhomquyen/chucnang/xoa', phanQuyenController.xoaChucNangKhoiNhom);
router.delete('/nhomquyen/xoa/:tenNhom', phanQuyenController.xoaNhomQuyen);

module.exports = router;