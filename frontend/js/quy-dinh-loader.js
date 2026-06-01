/**
 * Nạp quy định tính tiền từ DB — dùng chung cho cài đặt, phiếu thuê, trả phòng, hóa đơn.
 */

// Ưu tiên tên tiếng Việt (màn Cài đặt dùng) trước alias tiếng Anh cũ trong DB
const THAM_SO_SO_KHACH_TOI_DA = [
    'Số khách tối đa trong phòng',
    'SoKhachToiDa'
];

const THAM_SO_SO_KHACH_MIEN_PHU_THU = [
    'Số khách không tính phí phụ thu',
    'SoKhachKhongTinhPhi'
];

function normalizeThamSoRow(r) {
    const name = (r.tenthamso ?? r.TenThamSo ?? '').toString().trim();
    const val = r.giatri ?? r.GiaTri;
    return { tenthamso: name, giatri: val };
}

/** Đọc theo thứ tự ưu tiên tên — tránh lấy nhầm bản ghi alias cũ (vd. SoKhachToiDa=3 trong khi bản tiếng Việt đã =4). */
function parseThamSoInt(rows, names, fallback) {
    const normalized = (rows || []).map(normalizeThamSoRow);
    for (const name of names) {
        const row = normalized.find(r => r.tenthamso === name);
        if (row != null && row.giatri != null && row.giatri !== '') {
            const n = parseInt(row.giatri, 10);
            if (Number.isFinite(n)) return n;
        }
    }
    return fallback;
}

function applySoKhachToiDaToForm(soKhachToiDa) {
    const max = soKhachToiDa || 3;
    ['max-guests-display', 'max-guests', 'max-count', 'max-guests-rule'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = max;
    });
}

/**
 * @param {string} [baseUrl] — mặc định API_QUYDINH_URL
 * @returns {Promise<{
 *   soKhachToiDa: number,
 *   khachIncluded: number,
 *   tiLePhuThu: Array,
 *   foreignExtraRate: number,
 *   loaiKhach: Array,
 *   ruleLines: string[]
 * }>}
 */
async function fetchQuyDinhTinhTien(baseUrl) {
    const quyDinhBase = baseUrl || (typeof API_QUYDINH_URL !== 'undefined' ? API_QUYDINH_URL : '/api/quy-dinh');

    const [resTS, resPT, resLK] = await Promise.all([
        fetch(`${quyDinhBase}/tham-so`),
        fetch(`${quyDinhBase}/phu-thu`),
        fetch(`${quyDinhBase}/loai-khach`)
    ]);

    if (!resTS.ok) {
        throw new Error(`Không tải được tham số quy định (${resTS.status})`);
    }

    const jsonTS = await resTS.json();
    const thamSoRows = jsonTS.data || [];

    const soKhachToiDa = parseThamSoInt(thamSoRows, THAM_SO_SO_KHACH_TOI_DA, 3);
    const khachIncluded = parseThamSoInt(thamSoRows, THAM_SO_SO_KHACH_MIEN_PHI_THU, 2);

    let tiLePhuThu = [];
    if (resPT.ok) {
        const jsonPT = await resPT.json();
        tiLePhuThu = normalizePhuThu(jsonPT.data || []);
    }

    let foreignExtraRate = 0.5;
    let loaiKhach = [];
    if (resLK.ok) {
        const jsonLK = await resLK.json();
        loaiKhach = jsonLK.data || [];
        const nn = loaiKhach.find(l =>
            (l.name || l.LoaiKhach || '').toLowerCase().includes('nước ngoài')
        );
        if (nn) {
            const heSo = parseFloat(nn.surcharge ?? nn.HeSoPhuThu) || 1.5;
            foreignExtraRate = Math.max(0, heSo - 1);
        }
    }

    const ruleLines = buildQuyDinhRuleLines({
        khachIncluded,
        soKhachToiDa,
        tiLePhuThu,
        foreignExtraRate,
        loaiKhach
    });

    return {
        soKhachToiDa,
        khachIncluded,
        tiLePhuThu,
        foreignExtraRate,
        loaiKhach,
        ruleLines
    };
}

function buildQuyDinhRuleLines({ khachIncluded, soKhachToiDa, tiLePhuThu, foreignExtraRate, loaiKhach }) {
    const lines = [
        `Đơn giá phòng áp dụng cho ${khachIncluded} khách đầu (không tính phụ thu theo thứ tự).`,
        `Mỗi phòng tối đa ${soKhachToiDa} khách.`
    ];

    const phuThuTheoThuTu = (tiLePhuThu || [])
        .filter(pt => pt.thuTuKhach > khachIncluded)
        .sort((a, b) => a.thuTuKhach - b.thuTuKhach);

    phuThuTheoThuTu.forEach(pt => {
        const pct = Math.round((pt.heSoPhuThu - 1) * 100);
        if (pct > 0) {
            lines.push(`Khách thứ ${pt.thuTuKhach}: phụ thu thêm ${pct}% đơn giá phòng.`);
        }
    });

    const nn = (loaiKhach || []).find(l =>
        (l.name || l.LoaiKhach || '').toLowerCase().includes('nước ngoài')
    );
    if (nn) {
        const heSo = parseFloat(nn.surcharge ?? nn.HeSoPhuThu) || 1 + foreignExtraRate;
        const pct = Math.round(foreignExtraRate * 100);
        lines.push(`Khách nước ngoài: hệ số ${heSo} (phụ thu thêm ${pct}% đơn giá phòng).`);
    }

    return lines;
}

/** Đồng bộ cache localStorage để các màn hình cũ đọc đúng quy định mới nhất. */
function readSoKhachToiDaFromLocalStorage(fallback) {
    if (typeof getThamSo !== 'function') return fallback;
    const cached = getThamSo();
    const n = parseInt(cached.SoKhachToiDa, 10);
    return Number.isFinite(n) ? n : fallback;
}

function syncQuyDinhToLocalStorage(rules) {
    if (typeof saveThamSo !== 'function') return;

    saveThamSo({
        SoKhachToiDa: rules.soKhachToiDa,
        SoKhachKhongTinhPhuThu: rules.khachIncluded
    });

    if (typeof localStorage !== 'undefined' && rules.loaiKhach?.length) {
        const mapped = rules.loaiKhach.map(lk => ({
            MaLoaiKhach: lk.id,
            LoaiKhach: lk.name || lk.LoaiKhach,
            HeSoPhuThu: parseFloat(lk.surcharge ?? lk.HeSoPhuThu) || 1
        }));
        localStorage.setItem('LOAIKHACH', JSON.stringify(mapped));
    }

    if (rules.tiLePhuThu?.length) {
        const mapped = rules.tiLePhuThu.map(pt => ({
            ThuTuKhach: pt.thuTuKhach,
            HeSoPhuThu: pt.heSoPhuThu
        }));
        localStorage.setItem('TILEPHUTHU', JSON.stringify(mapped));
    }
}

function pricingOptionsFromRules(rules) {
    return {
        khachIncluded: rules.khachIncluded ?? 2,
        foreignExtraRate: rules.foreignExtraRate ?? 0.5
    };
}

function renderQuyDinhRulesList(containerId, ruleLines) {
    const el = document.getElementById(containerId);
    if (!el || !ruleLines?.length) return;
    el.innerHTML = ruleLines.map(line => `<li>${line}</li>`).join('');
}
