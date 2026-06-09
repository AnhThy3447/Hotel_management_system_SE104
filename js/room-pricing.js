/**
 * Tính tiền thuê phòng:
 * - Giá phòng/ngày áp dụng cho khachIncluded khách đầu (mặc định 2).
 * - Khách thứ > khachIncluded: phụ thu theo TILEPHUTHU (hệ số - 1) × đơn giá.
 * - Loại khách có phụ thu (vd nước ngoài, VIP): (hệ số - 1) × đơn giá.
 *   Hệ số lấy từ options.guestTypeRates[guest.type], hoặc fallback về foreignExtraRate.
 */

function normalizePhuThu(rows) {
    return (rows || []).map(r => ({
        thuTuKhach: r.thutukhach ?? r.ThuTuKhach ?? r.thuTuKhach,
        heSoPhuThu: parseFloat(r.hesophuthu ?? r.HeSoPhuThu ?? r.heSoPhuThu) || 1
    }));
}

/**
 * Lấy extra rate (phần vượt = heSo - 1) theo loại khách.
 * Ưu tiên: guestTypeRates map → fallback foreignExtraRate cho nước ngoài → 0.
 */
function getGuestTypeExtraRate(guest, options) {
    const guestType = (guest.type || guest.loaikhach || '').toLowerCase().trim();
    const guestTypeRates = options.guestTypeRates || {};

    if (guestType in guestTypeRates) {
        return guestTypeRates[guestType];
    }

    // Fallback: nếu là nước ngoài dùng foreignExtraRate
    if (guestType.includes('nước ngoài') || guestType === 'nuoc ngoai' || guestType.includes('foreign')) {
        return options.foreignExtraRate ?? 0.5;
    }

    return 0;
}

/**
 * Phụ thu/ngày của một khách (0 nếu không phát sinh).
 * @param {number}   guestIndex  - vị trí khách (0-based)
 * @param {object}   guest       - { type, ... }
 * @param {number}   roomPrice   - đơn giá phòng/ngày
 * @param {Array}    tiLePhuThu  - đã qua normalizePhuThu()
 * @param {object}   options     - { khachIncluded, foreignExtraRate, guestTypeRates }
 */
function calcGuestSurchargeForDay(guestIndex, guest, roomPrice, tiLePhuThu, options = {}) {
    const donGia = roomPrice || 0;
    if (!donGia) return 0;

    const khachIncluded = options.khachIncluded ?? 2;
    const thuTu = guestIndex + 1;
    let surcharge = 0;

    // 1. Phụ thu theo loại khách (hỗ trợ mọi loại, không chỉ nước ngoài)
    const typeExtra = getGuestTypeExtraRate(guest, options);
    surcharge += donGia * typeExtra;

    // 2. Phụ thu theo vị trí (khách thứ > khachIncluded)
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
