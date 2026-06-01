/**
 * Tính tiền thuê phòng theo quy định hiện hành trong DB (QĐ10 — áp dụng ngay khi trả phòng).
 */

function isForeignGuestType(loaiKhach) {
  const t = (loaiKhach || '').toLowerCase();
  return t.includes('nước ngoài') || t === 'nuoc ngoai';
}

const THAM_SO_SO_KHACH_TOI_DA = ['Số khách tối đa trong phòng', 'SoKhachToiDa'];
const THAM_SO_SO_KHACH_MIEN_PHU_THU = ['Số khách không tính phí phụ thu', 'SoKhachKhongTinhPhi'];

function parseThamSoByNames(rows, names, fallback) {
  for (const name of names) {
    const row = rows.find(r => (r.tenthamso || r.TenThamSo) === name);
    if (row && row.giatri != null && row.giatri !== '') {
      const n = parseInt(row.giatri, 10);
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}

async function getSoKhachToiDa(db) {
  const res = await db.query(`SELECT TenThamSo, GiaTri FROM THAMSO`);
  return parseThamSoByNames(res.rows, THAM_SO_SO_KHACH_TOI_DA, 3);
}

async function loadPricingContext(db) {
  const [thamSoRes, phuThuRes, loaiKhachRes] = await Promise.all([
    db.query(`SELECT TenThamSo, GiaTri FROM THAMSO`),
    db.query(`SELECT ThuTuKhach, HeSoPhuThu FROM TILEPHUTHU ORDER BY ThuTuKhach`),
    db.query(`SELECT LoaiKhach, HeSoPhuThu FROM LOAIKHACH`)
  ]);

  const thamSoRows = thamSoRes.rows;
  const khachIncluded = parseThamSoByNames(thamSoRows, THAM_SO_SO_KHACH_MIEN_PHU_THU, 2);

  const tiLePhuThu = phuThuRes.rows.map(r => ({
    thuTuKhach: parseInt(r.thutukhach, 10),
    heSoPhuThu: parseFloat(r.hesophuthu) || 1
  }));

  let foreignExtraRate = 0.5;
  const nn = loaiKhachRes.rows.find(r =>
    (r.loaikhach || '').toLowerCase().includes('nước ngoài')
  );
  if (nn) {
    foreignExtraRate = Math.max(0, (parseFloat(nn.hesophuthu) || 1.5) - 1);
  }

  return { khachIncluded, tiLePhuThu, foreignExtraRate };
}

function calcGuestSurchargeForDay(guestIndex, loaiKhach, donGia, ctx) {
  if (!donGia) return 0;

  const thuTu = guestIndex + 1;
  let surcharge = 0;

  if (isForeignGuestType(loaiKhach)) {
    surcharge += donGia * ctx.foreignExtraRate;
  }

  if (thuTu > ctx.khachIncluded) {
    const pt = ctx.tiLePhuThu.find(t => t.thuTuKhach === thuTu);
    const heSo = pt ? pt.heSoPhuThu : 1.25;
    surcharge += donGia * Math.max(0, heSo - 1);
  }

  return Math.round(surcharge);
}

function calcRoomPricePerDay(guests, donGia, ctx) {
  if (!donGia || !guests?.length) return 0;

  let total = donGia;
  guests.forEach((g, i) => {
    total += calcGuestSurchargeForDay(i, g.loaikhach, donGia, ctx);
  });
  return Math.round(total);
}

/**
 * @param {object} db - pg pool/client
 * @param {number} maThuePhong
 * @param {number} soNgayThue
 */
async function calcThanhTienThuePhong(db, maThuePhong, soNgayThue) {
  const days = parseInt(soNgayThue, 10);
  if (!Number.isFinite(days) || days < 1) {
    throw new Error('Số ngày thuê không hợp lệ');
  }

  const detailRes = await db.query(
    `SELECT ct.ThuTuKhach, lk.LoaiKhach, lp.DonGia
     FROM CTTHUEPHONG ct
     JOIN KHACHHANG kh ON ct.MaKhachHang = kh.MaKhachHang
     JOIN LOAIKHACH lk ON kh.MaLoaiKhach = lk.MaLoaiKhach
     JOIN THUEPHONG tp ON ct.MaThuePhong = tp.MaThuePhong
     JOIN PHONG p ON tp.SoPhong = p.SoPhong
     JOIN LOAIPHONG lp ON p.MaLoaiPhong = lp.MaLoaiPhong
     WHERE ct.MaThuePhong = $1
     ORDER BY ct.ThuTuKhach`,
    [maThuePhong]
  );

  if (detailRes.rows.length === 0) {
    throw new Error('Phiếu thuê không có khách');
  }

  const donGia = parseFloat(detailRes.rows[0].dongia) || 0;
  const guests = detailRes.rows.map(r => ({ loaikhach: r.loaikhach }));

  const ctx = await loadPricingContext(db);
  const tongMotNgay = calcRoomPricePerDay(guests, donGia, ctx);

  return Math.round(tongMotNgay * days);
}

module.exports = {
  getSoKhachToiDa,
  loadPricingContext,
  calcRoomPricePerDay,
  calcThanhTienThuePhong
};
