// invoice-list.js - Quản lý danh sách hóa đơn

const API_URL = 'https://hotel-management-system-se104.onrender.com/api';
let allInvoices = [];

document.addEventListener('DOMContentLoaded', () => {
    loadInvoices();
    setupSearch();
});

async function loadInvoices(filtered = null) {
    try {
        if (!filtered) {
            const res = await fetch(`${API_URL}/hoa-don`);
            const json = await res.json();
            allInvoices = json.data || [];
        }

        const data = filtered || allInvoices;
        const tableBody = document.getElementById('invoice-table-body');
        const totalInvoices = document.getElementById('total-invoices');
        const showingCount = document.getElementById('showing-count');

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Chưa có hóa đơn nào!</td></tr>`;
            totalInvoices.textContent = '0';
            showingCount.textContent = '0';
            return;
        }

        tableBody.innerHTML = data.map((invoice, index) => {
            const maHD = 'HD' + String(invoice.mahoadon).padStart(3, '0');
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${maHD}</strong></td>
                    <td>${invoice.tenkhachhang || 'N/A'}</td>
                    <td>${formatDateVN(invoice.ngaythanhToan?.split('T')[0] || invoice.ngaythanhtoan?.split('T')[0])}</td>
                    <td><span class="badge badge-room">${invoice.mathuephong || '—'}</span></td>
                    <td><strong style="color: #4CAF50;">${formatCurrency(invoice.tongtien)} VNĐ</strong></td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-view" onclick="viewInvoice(${invoice.mahoadon})" title="Xem chi tiết">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteInvoice(${invoice.mahoadon})" title="Xóa">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        totalInvoices.textContent = allInvoices.length;
        showingCount.textContent = data.length;
    } catch (err) {
        console.error('Lỗi:', err);
    }
}

async function viewInvoice(maHoaDon) {
    try {
        const res = await fetch(`${API_URL}/hoa-don/${maHoaDon}`);
        const json = await res.json();
        const invoice = json.data.hoaDon;
        const chitiet = json.data.chiTiet || [];

        const maHD = 'HD' + String(invoice.mahoadon).padStart(3, '0');
        document.getElementById('modal-invoice-id').textContent = maHD;
        document.getElementById('modal-customer').textContent = invoice.tenkhachhang || 'N/A';
        document.getElementById('modal-agency').textContent = invoice.tencoquan || 'Không có';
        document.getElementById('modal-date').textContent = formatDateVN(invoice.ngaythanhtoan?.split('T')[0]);
        document.getElementById('modal-total').textContent = formatCurrency(invoice.tongtien) + ' VNĐ';

        const detailBody = document.getElementById('invoice-detail-body');
        detailBody.innerHTML = chitiet.map((ct, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${ct.sophong || 'N/A'}</strong></td>
                <td>${ct.loaiphong || '—'}</td>
                <td>${ct.songaythue || 0}</td>
                <td>${ct.dongia ? formatCurrency(ct.dongia) + ' VNĐ' : '—'}</td>
                <td><strong style="color:#4CAF50">${formatCurrency(ct.trigia)} VNĐ</strong></td>
            </tr>
        `).join('');

        document.getElementById('invoice-modal').classList.add('show');
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

function closeInvoiceModal() {
    document.getElementById('invoice-modal').classList.remove('show');
}

async function deleteInvoice(maHoaDon) {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return;
    try {
        await fetch(`${API_URL}/hoa-don/${maHoaDon}`, { method: 'DELETE' });
        alert('Đã xóa hóa đơn thành công!');
        loadInvoices();
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) { loadInvoices(); return; }
        const filtered = allInvoices.filter(hd => {
            const maHD = 'HD' + String(hd.mahoadon).padStart(3, '0');
            return maHD.toLowerCase().includes(q) ||
                (hd.tenkhachhang || '').toLowerCase().includes(q);
        });
        loadInvoices(filtered);
    });
}

function goToCreateInvoice() {
    window.location.href = 'create-invoice.html';
}

function printInvoice() { window.print(); }

function printInvoiceById(maHoaDon) {
    viewInvoice(maHoaDon);
    setTimeout(() => window.print(), 300);
}

function formatDateVN(dateString) {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
}
