/**
 * Tính tiền thuê phòng:
 * - Giá phòng/ngày áp dụng cho khachIncluded khách đầu (mặc định 2).
 * - Khách thứ > khachIncluded: phụ thu theo TILEPHUTHU (phần (hệ số - 1) × đơn giá, VD khách 3 +25%).
 * - Khách nước ngoài: phụ thu thêm (hệ số loại khách - 1) × đơn giá.
 */

function normalizePhuThu(rows) {
    return (rows || []).map(r => ({
        thuTuKhach: r.thutukhach ?? r.ThuTuKhach,
        heSoPhuThu: parseFloat(r.hesophuthu ?? r.HeSoPhuThu) || 1
    }));
}

function isForeignGuest(guest) {
    const t = (guest.type || guest.loaikhach || '').toLowerCase();
    return t.includes('nước ngoài') || t === 'nuoc ngoai';
}

/**
 * Phụ thu/ngày của một khách (0 nếu không phát sinh).
 */
function calcGuestSurchargeForDay(guestIndex, guest, roomPrice, tiLePhuThu, options = {}) {
    const donGia = roomPrice || 0;
    if (!donGia) return 0;

    const khachIncluded = options.khachIncluded ?? 2;
    const foreignExtra = options.foreignExtraRate ?? 0.5;
    const thuTu = guestIndex + 1;
    let surcharge = 0;

    if (isForeignGuest(guest)) {
        surcharge += donGia * foreignExtra;
    }

    if (thuTu > khachIncluded) {
        const pt = tiLePhuThu.find(t => t.thuTuKhach === thuTu);
        const heSo = pt ? pt.heSoPhuThu : 1.25;
        surcharge += donGia * Math.max(0, heSo - 1);
    }

    return Math.round(surcharge);
}

/**
 * Tổng tiền/ngày = đơn giá phòng + tổng phụ thu từng khách.
 */
function calcRoomPricePerDay(guests, roomPrice, tiLePhuThu, options = {}) {
    const donGia = roomPrice || 0;
    if (!donGia || !guests?.length) return 0;

    let total = donGia;
    guests.forEach((g, i) => {
        total += calcGuestSurchargeForDay(i, g, donGia, tiLePhuThu, options);
    });
    return Math.round(total);
}

function formatGuestSurchargeCell(surcharge, formatCurrency) {
    return formatCurrency(surcharge || 0) + ' VNĐ';
}
