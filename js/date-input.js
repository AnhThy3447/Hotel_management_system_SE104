// date-input.js - Component nhập ngày tự động format dd/mm/yyyy
// Nhập ngày → tự thêm / → nhập tháng → tự thêm / → nhập năm

function initDateInputs() {
    const dateInputs = document.querySelectorAll('.date-input-vn');

    dateInputs.forEach(input => {
        input.setAttribute('placeholder', 'dd/mm/yyyy');
        input.setAttribute('maxlength', '10');

        input.addEventListener('input', function(e) {
            formatDateInput(e.target);
        });

        input.addEventListener('keydown', function(e) {
            // Cho phép: backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Cho phép: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true) ||
                // Cho phép: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }

            // Chỉ cho phép số
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });

        input.addEventListener('blur', function(e) {
            validateAndConvertDate(e.target);
        });
    });
}

function formatDateInput(input) {
    let value = input.value.replace(/\D/g, ''); // Xóa tất cả ký tự không phải số
    let formatted = '';

    // Format: dd/mm/yyyy
    if (value.length > 0) {
        // Ngày (2 số)
        formatted = value.substring(0, 2);

        if (value.length > 2) {
            // Thêm / sau ngày
            formatted += '/' + value.substring(2, 4);
        }

        if (value.length > 4) {
            // Thêm / sau tháng
            formatted += '/' + value.substring(4, 8);
        }
    }

    input.value = formatted;
}

function validateAndConvertDate(input) {
    const value = input.value;

    if (!value) return;

    // Kiểm tra format dd/mm/yyyy
    const parts = value.split('/');

    if (parts.length !== 3) {
        alert('Vui lòng nhập đúng định dạng ngày: dd/mm/yyyy');
        input.value = '';
        input.focus();
        return;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Validate
    if (day < 1 || day > 31) {
        alert('Ngày không hợp lệ (1-31)');
        input.value = '';
        input.focus();
        return;
    }

    if (month < 1 || month > 12) {
        alert('Tháng không hợp lệ (1-12)');
        input.value = '';
        input.focus();
        return;
    }

    if (year < 1900 || year > 2100) {
        alert('Năm không hợp lệ (1900-2100)');
        input.value = '';
        input.focus();
        return;
    }

    // Kiểm tra ngày hợp lệ trong tháng
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        alert('Ngày không tồn tại trong tháng này!');
        input.value = '';
        input.focus();
        return;
    }

    // Lưu giá trị ISO vào data attribute để backend xử lý
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    input.setAttribute('data-iso-date', isoDate);
}

// Helper: Lấy giá trị ISO date từ input
function getISODate(input) {
    return input.getAttribute('data-iso-date') || '';
}

// Helper: Set giá trị từ ISO date (yyyy-mm-dd) sang dd/mm/yyyy
function setDateValue(input, isoDate) {
    if (!isoDate) return;

    const parts = isoDate.split('-');
    if (parts.length === 3) {
        const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
        input.value = formatted;
        input.setAttribute('data-iso-date', isoDate);
    }
}

// Helper: Lấy ngày hôm nay theo format dd/mm/yyyy
function getTodayFormatted() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

// Helper: Lấy ngày hôm nay ISO
function getTodayISO() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
}

// Auto init khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initDateInputs();
});
