const API_URL = "https://hotel-management-system-se104.onrender.com/api";
let currentBooking = null;
let guests = [];
let isViewMode = false;
let allRooms = [];
let thamSo = { soKhachToiDa: 3, khachIncluded: 2 };
let tiLePhuThu = [];
let foreignExtraRate = 0.5;
// Danh sách loại khách load từ DB (fallback = 2 loại cơ bản)
let loaiKhachList = [
  { value: "nội địa",   label: "Nội địa",    heSo: 1.0 },
  { value: "nước ngoài", label: "Nước ngoài", heSo: 1.5 },
];

async function isCMNDExists(cmnd) {
  if (!cmnd?.trim()) return false;

  try {
    const res = await fetch(`${API_URL}/khach-hang`);
    const json = await res.json();

    if (!json.success) return false;

    return (json.data || []).some(
      (kh) => String(kh.cmnd || "").trim() === cmnd.trim(),
    );
  } catch (err) {
    console.error("Lỗi kiểm tra CMND:", err);
    return false;
  }
}

async function validateGuestCMND(index, input) {

    const errorEl =
        document.getElementById(`cmnd-error-${index}`);

    const cmnd = input.value.trim();

    errorEl.textContent = '';
    input.classList.remove('input-error');

    if (!cmnd) {
        guests[index].idNumber = '';
        return;
    }

    const duplicated = await isCMNDExists(cmnd);

    if (duplicated) {

        errorEl.textContent =
            'CMND này đã tồn tại trong hệ thống';

        input.classList.add('input-error');

        guests[index].idNumber = '';

        return;
    }

    guests[index].idNumber = cmnd;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadRooms();
  await loadThamSo();

  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("id");
  const mode = urlParams.get("mode");
  isViewMode = mode === "view";

  if (bookingId) {
    loadBooking(parseInt(bookingId));
  } else {
    initNewBookingForm();
  }
});

const MAX_START_DAYS_FROM_FORM = 30;

function initNewBookingForm() {
    const formDateInput = document.getElementById("form-date");
    const startDateInput = document.getElementById("start-date");
    const startDatePicker = document.getElementById("start-date-picker");

    // Ngày lập = hôm nay
    setDateValue(formDateInput, getTodayISO());
    lockFormDateToToday(formDateInput);

    updateStartDateLimits();

    // Ngày bắt đầu thuê mặc định = hôm nay
    setDateValue(startDateInput, getTodayISO());

    // Đồng bộ date picker
    if (startDatePicker) {
        startDatePicker.value = getTodayISO();

        startDatePicker.addEventListener("change", function () {

            // cập nhật ô dd/mm/yyyy
            setDateValue(startDateInput, this.value);

            // lưu ngày hợp lệ cuối cùng
            startDateInput.dataset.lastValidDate = this.value;
        });
    }

    startDateInput.dataset.lastValidDate = getTodayISO();

    startDateInput.addEventListener(
        "blur",
        validateStartDateOnBlur
    );

    addGuest();
}

function formatIsoToVN(iso) {
  if (!iso) return "";
  const p = iso.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
}

function lockFormDateToToday(input) {
  input.readOnly = true;
  input.title = "Ngày lập luôn là ngày hôm nay";
  input.addEventListener("keydown", (e) => e.preventDefault());
  input.addEventListener("paste", (e) => e.preventDefault());
  input.addEventListener("input", () => setDateValue(input, getTodayISO()));
}

function addDaysToISO(isoDate, days) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function updateStartDateLimits() {
  const formDateInput = document.getElementById("form-date");
  const startDateInput = document.getElementById("start-date");
  let formIso = getISODate(formDateInput);

  if (!currentBooking) {
    setDateValue(formDateInput, getTodayISO());
    formIso = getTodayISO();
  } else if (!formIso && formDateInput.value) {
    validateAndConvertDate(formDateInput);
    formIso = getISODate(formDateInput);
  }
  if (!formIso) {
    formIso = getTodayISO();
    setDateValue(formDateInput, formIso);
  }

  const maxIso = addDaysToISO(formIso, MAX_START_DAYS_FROM_FORM);
  startDateInput.dataset.minDate = formIso;
  startDateInput.dataset.maxDate = maxIso;

  const currentIso =
    getISODate(startDateInput) || convertToISO(startDateInput.value);
  if (currentIso && currentIso >= formIso && currentIso <= maxIso) {
    startDateInput.dataset.lastValidDate = currentIso;
  }
}

function isStartDateInRange(startIso, minIso, maxIso) {
  return (
    startIso && minIso && maxIso && startIso >= minIso && startIso <= maxIso
  );
}

function getStartDateRangeMessage(minIso, maxIso) {
  return `Chỉ được chọn từ ${formatIsoToVN(minIso)} đến ${formatIsoToVN(maxIso)} (tối đa ${MAX_START_DAYS_FROM_FORM} ngày kể từ ngày lập).`;
}

function validateStartDateOnBlur() {
  const startDateInput = document.getElementById("start-date");
  const minIso = startDateInput.dataset.minDate;
  const maxIso = startDateInput.dataset.maxDate;
  if (!minIso || !maxIso || !startDateInput.value.trim()) return;

  validateAndConvertDate(startDateInput);
  const startIso = getISODate(startDateInput);
  if (!startIso) return;

  if (isStartDateInRange(startIso, minIso, maxIso)) {
    startDateInput.dataset.lastValidDate = startIso;
    return;
  }

  alert(
    `Ngày bắt đầu thuê không hợp lệ. ${getStartDateRangeMessage(minIso, maxIso)}`,
  );

  const lastValid = startDateInput.dataset.lastValidDate;
  if (lastValid) {
    setDateValue(startDateInput, lastValid);
  } else {
    startDateInput.value = "";
    startDateInput.removeAttribute("data-iso-date");
  }
}

function validateStartDateRange() {
  const startDateInput = document.getElementById("start-date");
  const minIso = startDateInput.dataset.minDate;
  const maxIso = startDateInput.dataset.maxDate;
  const startIso =
    getISODate(startDateInput) || convertToISO(startDateInput.value);

  if (!startIso || !minIso || !maxIso) {
    alert("Vui lòng chọn ngày bắt đầu thuê hợp lệ!");
    return false;
  }
  if (!isStartDateInRange(startIso, minIso, maxIso)) {
    alert(
      `Ngày bắt đầu thuê không hợp lệ. ${getStartDateRangeMessage(minIso, maxIso)}`,
    );
    startDateInput.focus();
    return false;
  }
  return true;
}

function normalizeRoomFields(room) {
  return {
    id: room.id ?? room.sophong ?? room.SoPhong,
    typeName: room.typeName || room.typename || room.loaiphong || "N/A",
    price: Number(room.price ?? room.dongia ?? 0),
    status: room.status || room.tinhtrang || "",
  };
}

function formatRoomOptionText(room) {
  const r = normalizeRoomFields(room);
  return `Phòng ${r.id} — ${r.typeName} — ${formatCurrency(r.price)} VNĐ/ngày`;
}

function buildRoomSelectOptions(rooms, placeholder) {
  return (
    `<option value="">${placeholder}</option>` +
    rooms
      .map((room) => {
        const r = normalizeRoomFields(room);
        return `<option value="${r.id}">${formatRoomOptionText(room)}</option>`;
      })
      .join("")
  );
}

async function loadRooms() {
  try {
    const res = await fetch(`${API_URL}/phong`);
    if (!res.ok) throw new Error("Không thể tải danh sách phòng");

    const data = await res.json();
    const select = document.getElementById("room-select");
    if (!select) return;

    const rawRooms = Array.isArray(data) ? data : data.data || [];
    allRooms = rawRooms.map((r) => ({ ...r, ...normalizeRoomFields(r) }));

    const availableRooms = allRooms.filter(
      (room) => (room.status || "").trim().toLowerCase() === "trống",
    );

    select.innerHTML = buildRoomSelectOptions(
      availableRooms,
      "-- Chọn phòng trống --",
    );
  } catch (err) {
    console.error("Lỗi load phòng:", err);
    alert("Không thể tải danh sách phòng. Vui lòng kiểm tra console (F12).");
  }
}

async function loadThamSo() {
  try {
    // Thử lần lượt các endpoint có thể có trên backend
    const candidates = [
      `${API_URL}/quy-dinh/thamso`,
      `${API_URL}/quy-dinh/tham-so`,
    ];
    let data = [];
    for (const url of candidates) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const j = await r.json();
        const rows = j.data || j || [];
        if (Array.isArray(rows) && rows.length > 0) { data = rows; break; }
      } catch (_) {}
    }
    const json = { data }; // compat
    // Hỗ trợ cả tên tiếng Anh lẫn tiếng Việt được lưu trong DB
    const soKhach = data.find((t) =>
      t.tenthamso === "SoKhachToiDa" ||
      t.tenthamso === "Số khách tối đa trong phòng" ||
      t.tenthamso === "Số khách tối đa"
    );
    if (soKhach) thamSo.soKhachToiDa = parseInt(soKhach.giatri) || 3;

    const soKhachMienPhi = data.find((t) =>
      t.tenthamso === "SoKhachKhongTinhPhi" ||
      t.tenthamso === "Số khách không tính phí phụ thu"
    );
    if (soKhachMienPhi)
      thamSo.khachIncluded = parseInt(soKhachMienPhi.giatri) || 2;

    // Cập nhật toàn bộ phần tử UI hiển thị số khách tối đa
    const maxKhach = thamSo.soKhachToiDa;
    ["max-guests-rule", "max-guests-display", "max-guests", "max-count"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = maxKhach;
    });

    const resPT = await fetch(`${API_URL}/quy-dinh/phu-thu`
      ).catch(() => null);
    const jsonPT = resPT?.ok ? await resPT.json() : {};
    tiLePhuThu = normalizePhuThu(jsonPT.data || []);

    const resLK = await fetch(`${API_URL}/quy-dinh/loai-khach`
      ).catch(() => null);
    const jsonLK = resLK?.ok ? await resLK.json() : {};
    const lkRows = jsonLK.data || [];
    if (lkRows.length > 0) {
      // Cập nhật danh sách loại khách từ DB vào biến toàn cục
      loaiKhachList = lkRows.map((l) => ({
        value: (l.name || l.LoaiKhach || "").toLowerCase().trim(),
        label: l.name || l.LoaiKhach || "",
        heSo: parseFloat(l.surcharge ?? l.HeSoPhuThu) || 1.0,
      }));
    }
    // Cập nhật foreignExtraRate từ loại khách nước ngoài
    const nn = loaiKhachList.find((l) =>
      l.value.includes("nước ngoài") || l.value.includes("foreign")
    );
    if (nn) foreignExtraRate = Math.max(0, nn.heSo - 1);

    // Cập nhật text mô tả quy định trong rules-note
    _updateRulesNoteText();
  } catch (err) {
    console.error("Lỗi load tham số:", err);
  }
}

// Cập nhật phần mô tả quy định hiển thị trên form
function _updateRulesNoteText() {
  // Cập nhật % phụ thu khách nước ngoài
  const foreignPct = Math.round(foreignExtraRate * 100);
  const elForeign = document.getElementById("rule-foreign-pct");
  if (elForeign) elForeign.textContent = foreignPct;

  // Cập nhật text phụ thu theo thứ tự khách
  const elSurcharge = document.getElementById("rule-surcharge-text");
  if (elSurcharge && tiLePhuThu && tiLePhuThu.length > 0) {
    const extras = tiLePhuThu
      .filter(r => (r.thutu ?? r.ThuTuKhach) > (thamSo.khachIncluded || 2))
      .sort((a, b) => (a.thutu ?? a.ThuTuKhach) - (b.thutu ?? b.ThuTuKhach));
    if (extras.length > 0) {
      const parts = extras.map(r => {
        const order = r.thutu ?? r.ThuTuKhach;
        const heso = r.heso ?? r.HeSoPhuThu ?? 1;
        const pct = Math.round((heso - 1) * 100);
        return `khách thứ ${order} +${pct}%`;
      });
      elSurcharge.textContent = parts.join(", ");
    }
  }
}

function pricingOptions() {
  // Map value -> extra rate (phần vượt trên giá cơ bản) cho từng loại khách
  const guestTypeRates = {};
  loaiKhachList.forEach((lk) => {
    guestTypeRates[lk.value] = Math.max(0, lk.heSo - 1);
  });
  return {
    khachIncluded: thamSo.khachIncluded ?? 2,
    foreignExtraRate,
    guestTypeRates,
  };
}

function onRoomChange() {
  const select = document.getElementById("room-select");
  const sophong = select.value;
  const room = allRooms.find((p) => String(p.id) === String(sophong));

  if (room) {
    document.getElementById("room-info").style.display = "flex";
    document.getElementById("selected-room-type").textContent =
      room.typeName || "N/A";
    document.getElementById("selected-room-price").textContent =
      formatCurrency(room.price) + " VNĐ";
    // Dùng thamSo đã load từ DB (không hard-code)
    const maxKhach = thamSo.soKhachToiDa;
    ["max-guests-display", "max-guests", "max-count", "max-guests-rule"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = maxKhach;
    });
  } else {
    document.getElementById("room-info").style.display = "none";
  }
  renderGuests();
  updatePricePreview();
}

function updatePricePreview() {
  const sophong = document.getElementById("room-select").value;
  const room = allRooms.find((p) => String(p.id) === String(sophong));
  if (!room || guests.length === 0) {
    document.getElementById("price-preview").style.display = "none";
    return;
  }

  document.getElementById("price-preview").style.display = "block";
  const total = calcRoomPricePerDay(
    guests,
    room.price,
    tiLePhuThu,
    pricingOptions(),
  );
  document.getElementById("total-per-day").textContent =
    formatCurrency(total) + " VNĐ";
}

async function loadBooking(id) {
  try {
    const res = await fetch(`${API_URL}/thue-phong/${id}`);
    const json = await res.json();
    currentBooking = json.data?.phieu;
    const chitiet = json.data?.chitiet || [];

    document.getElementById("form-title").textContent = isViewMode
      ? "Chi tiết Phiếu Thuê Phòng (BM2)"
      : "Cập nhật Phiếu Thuê Phòng (BM2)";
    document.getElementById("form-subtitle").textContent = `Mã phiếu: #${id}`;
    document.getElementById("save-btn-text").textContent = "Cập nhật";
    const formDateInput = document.getElementById("form-date");
    formDateInput.readOnly = false;
    setDateValue(formDateInput, currentBooking?.ngaylap?.split("T")[0] || "");
    setDateValue(
      document.getElementById("start-date"),
      currentBooking?.ngaybatdauthue?.split("T")[0] || "",
    );
    updateStartDateLimits();

    const startDateInput = document.getElementById("start-date");
    startDateInput.dataset.lastValidDate =
      getISODate(startDateInput) ||
      currentBooking?.ngaybatdauthue?.split("T")[0] ||
      "";
    formDateInput.addEventListener("blur", updateStartDateLimits);
    startDateInput.addEventListener("blur", validateStartDateOnBlur);

    const bookedRoom = {
      id: currentBooking?.sophong,
      typeName: currentBooking?.loaiphong,
      price: currentBooking?.dongia,
      status: "Đang thuê",
    };
    if (!allRooms.some((r) => String(r.id) === String(bookedRoom.id))) {
      allRooms.push({ ...bookedRoom, ...normalizeRoomFields(bookedRoom) });
    }

    const select = document.getElementById("room-select");
    const existingOptions = buildRoomSelectOptions(
      allRooms.filter(
        (r) =>
          String(r.id) === String(bookedRoom.id) ||
          (r.status || "").trim().toLowerCase() === "trống",
      ),
      "-- Chọn phòng --",
    );
    select.innerHTML = existingOptions;
    select.value = currentBooking?.sophong;
    onRoomChange();

    guests = chitiet.map((ct) => ({
      name: ct.tenkhachhang || "",
      // Map tên loại khách từ DB về value trong loaiKhachList (hỗ trợ loại mới)
      type: (() => {
        const raw = (ct.loaikhach || "").toLowerCase().trim();
        const found = loaiKhachList.find(lk => lk.value === raw || lk.label.toLowerCase() === raw);
        return found ? found.value : (loaiKhachList[0]?.value || "nội địa");
      })(),
      idNumber: ct.cmnd || "",
      address: ct.diachi || "",
      makhachhang: ct.makhachhang,
    }));

    renderGuests();

    if (isViewMode) {
      document
        .querySelectorAll(
          "input, select, button:not(.btn-back):not(#print-btn):not(.btn-secondary)",
        )
        .forEach((el) => {
          el.disabled = true;
        });
      document.getElementById("save-btn").style.display = "none";
    }
  } catch (err) {
    alert("Lỗi tải dữ liệu: " + err.message);
  }
}

function renderGuests() {
  const tbody = document.getElementById("guest-list");
  tbody.innerHTML = guests
    .map(
      (guest, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <input type="text" value="${guest.name}" placeholder="Tên khách hàng"
                    onchange="updateGuest(${index}, 'name', this.value)" required>
            </td>
            <td>
                <select onchange="updateGuest(${index}, 'type', this.value)">
                    ${loaiKhachList.map(lk => `<option value="${lk.value}" ${guest.type === lk.value ? "selected" : ""}>${lk.label}</option>`).join("")}
                </select>
            </td>
            <td>
                <input type="text"
                    value="${guest.idNumber}"
                    placeholder="Số CMND"
                    onblur="validateGuestCMND(${index}, this)"
                    id="cmnd-${index}"
                    required>

                <small
                    id="cmnd-error-${index}"
                    class="field-error">
                </small>
            </td>
            <td>
                <input type="text" value="${guest.address}" placeholder="Địa chỉ"
                    onchange="updateGuest(${index}, 'address', this.value)">
            </td>
            <td style="text-align:right">${calcGuestPrice(index)}</td>
            <td>
                <button type="button" class="btn-remove" onclick="removeGuest(${index})"
                    ${guests.length === 1 ? "disabled" : ""}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        </tr>
    `,
    )
    .join("");
  updateGuestCount();
  updatePricePreview();
}

function addGuest() {
  const maxKhach = thamSo.soKhachToiDa || 3;
  if (guests.length >= maxKhach) {
    alert(`Mỗi phòng chỉ được tối đa ${maxKhach} khách!`);
    return;
  }
  const defaultType = loaiKhachList[0]?.value || "nội địa";
  guests.push({ name: "", type: defaultType, idNumber: "", address: "" });
  renderGuests();
}

function removeGuest(index) {
  if (guests.length === 1) {
    alert("Phải có ít nhất 1 khách hàng!");
    return;
  }
  guests.splice(index, 1);
  renderGuests();
}

function updateGuest(index, field, value) {
  guests[index][field] = value;
  renderGuests();
}

function updateGuestCount() {
  const maxKhach = thamSo.soKhachToiDa || 3;
  document.getElementById("current-count").textContent = guests.length;
  document.getElementById("add-guest-btn").disabled = guests.length >= maxKhach;
}

async function validateForm() {
  const formDate = document.getElementById("form-date").value;
  const roomNumber = document.getElementById("room-select").value;
  const startDate = document.getElementById("start-date").value;

  if (!formDate || !roomNumber || !startDate) {
    alert("Vui lòng điền đầy đủ thông tin cơ bản!");
    return false;
  }
  if (!currentBooking) {
    const formDateInput = document.getElementById("form-date");
    const ngayLapIso = getISODate(formDateInput) || convertToISO(formDate);
    if (ngayLapIso !== getTodayISO()) {
      alert("Ngày lập phải là ngày hôm nay và không được thay đổi.");
      setDateValue(formDateInput, getTodayISO());
      updateStartDateLimits();
      return false;
    }
  }
  if (!validateStartDateRange()) return false;
  for (let i = 0; i < guests.length; i++) {
    if (!guests[i].name || !guests[i].idNumber) {
      alert(`Vui lòng điền đầy đủ thông tin cho khách hàng ${i + 1}!`);
      return false;
    }
  }

  const cmndSet = new Set();

  for (let i = 0; i < guests.length; i++) {
    const cmnd = guests[i].idNumber.trim();

    if (cmndSet.has(cmnd)) {
      alert(`CMND ${cmnd} bị trùng trong danh sách khách.`);
      return false;
    }

    cmndSet.add(cmnd);
  }

  for (let i = 0; i < guests.length; i++) {
    const cmnd = guests[i].idNumber.trim();

    const duplicated = await isCMNDExists(cmnd);

    if (duplicated) {
      alert(`CMND ${cmnd} đã tồn tại trong hệ thống.`);
      return false;
    }
  }

  return true;
}

function calcGuestPrice(index) {
  const sophong = document.getElementById("room-select").value;
  const room = allRooms.find((p) => String(p.id) === String(sophong));
  if (!room) return formatGuestSurchargeCell(0, formatCurrency);
  const surcharge = calcGuestSurchargeForDay(
    index,
    guests[index],
    room.price,
    tiLePhuThu,
    pricingOptions(),
  );
  return formatGuestSurchargeCell(surcharge, formatCurrency);
}

function convertToISO(ddmmyyyy) {
  if (!ddmmyyyy) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return ddmmyyyy;
}

// Hàm này được gọi từ HTML (onclick="saveBooking()")
async function saveBooking() {
  if (!(await validateForm())) return;

  const bookingData = {
    SoPhong: document.getElementById("room-select").value,
    NgayLap: convertToISO(document.getElementById("form-date").value),
    NgayBatDauThue: convertToISO(document.getElementById("start-date").value),
    DanhSachKhach: guests.map((g) => ({
      name: g.name,
      type: g.type,
      idNumber: g.idNumber,
      address: g.address,
    })),
  };

  try {
    const method = currentBooking ? "PUT" : "POST";
    const url = currentBooking
      ? `${API_URL}/thue-phong/${currentBooking.mathuephong}`
      : `${API_URL}/thue-phong`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    const json = await res.json();
    if (json.success) {
      alert("Phiếu thuê phòng đã được lưu thành công!");
      window.location.href = "booking-list.html";
    } else {
      alert("Lỗi: " + json.message);
    }
  } catch (err) {
    alert("Lỗi kết nối backend: " + err.message);
  }
}

// Alias để tương thích
const saveForm = saveBooking;

function cancelForm() {
  if (confirm("Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.")) {
    window.location.href = "booking-list.html";
  }
}

function printForm() {
  window.print();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount || 0);
}

// ==========================================================
// SAFETY FALLBACK: room-pricing.js đã hỗ trợ guestTypeRates.
// Block này chỉ chạy nếu room-pricing.js vắng mặt.
// ==========================================================
(function () {
  if (typeof calcGuestSurchargeForDay === "function" &&
      typeof calcRoomPricePerDay === "function") return; // đã có room-pricing.js

  // Fallback tự tính — field names khớp với normalizePhuThu()
  function _getTypeExtra(guest, opts) {
    const t = (guest?.type || "").toLowerCase().trim();
    const rates = opts?.guestTypeRates || {};
    if (t in rates) return rates[t];
    if (t.includes("nước ngoài") || t.includes("foreign")) return opts?.foreignExtraRate ?? 0.5;
    return 0;
  }

  window.calcGuestSurchargeForDay = function (index, guest, basePrice, tiLePhuThu, opts) {
    const donGia = basePrice || 0;
    if (!donGia) return 0;
    const khachIncluded = opts?.khachIncluded ?? 2;
    const thuTu = index + 1;
    let surcharge = donGia * _getTypeExtra(guest, opts);
    if (thuTu > khachIncluded) {
      const pt = (tiLePhuThu || []).find(r => r.thuTuKhach === thuTu);
      surcharge += donGia * Math.max(0, (pt ? pt.heSoPhuThu : 1.25) - 1);
    }
    return Math.round(surcharge);
  };

  window.calcRoomPricePerDay = function (guests, basePrice, tiLePhuThu, opts) {
    const donGia = basePrice || 0;
    if (!donGia || !guests?.length) return 0;
    return Math.round(donGia + guests.reduce(
      (sum, g, i) => sum + window.calcGuestSurchargeForDay(i, g, donGia, tiLePhuThu, opts), 0
    ));
  };
})();
