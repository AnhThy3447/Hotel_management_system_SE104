// ===== DATA =====
const revenueData = [
  { month: "2026-05", type: "Phòng tiêu chuẩn", revenue: 15000000, percent: 45, count: 30, rentPercent: 46, note: "" },
  { month: "2026-05", type: "Phòng hạng sang", revenue: 18000000, percent: 55, count: 35, rentPercent: 54, note: "" },

  { month: "2026-06", type: "Phòng tiêu chuẩn", revenue: 20000000, percent: 50, count: 40, rentPercent: 57, note: "" },
  { month: "2026-06", type: "Phòng hạng sang", revenue: 20000000, percent: 50, count: 30, rentPercent: 43, note: "" }
];

const customerData = [
    { month: "2026-05", type: "Khách nội địa", count: 150, percent: 75 },
    { month: "2026-05", type: "Khách quốc tế", count: 50, percent: 25 },
    { month: "2026-06", type: "Khách nội địa", count: 200, percent: 80 },
    { month: "2026-06", type: "Khách quốc tế", count: 50, percent: 20 }
];

// ===== LOAD =====
document.addEventListener("DOMContentLoaded", () => {
  loadRevenue();
});

// ===== DOANH THU =====
function loadRevenue() {
  const tbody = document.getElementById("revenueBody");
  tbody.innerHTML = "";

  const filterType = document.getElementById("filterType").value;

  let filteredData = [];

  // ===== LỌC =====
  if (filterType === "month") {
    const selectedMonth = document.getElementById("reportMonth").value;
    filteredData = revenueData.filter(item => item.month === selectedMonth);
  } else {
    const selectedYear = document.getElementById("reportYear").value;
    filteredData = revenueData.filter(item =>
      item.month.startsWith(selectedYear)
    );
  }

  // ===== KIỂM TRA RỖNG =====
  if (filteredData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          Không có dữ liệu
        </td>
      </tr>
    `;
    document.getElementById("totalRevenue").innerText = "0";
    document.getElementById("totalCount").innerText = "0";
    return;
  }

  // ===== GỘP THEO LOẠI PHÒNG =====
  let grouped = {};

  filteredData.forEach(item => {
    if (!grouped[item.type]) {
      grouped[item.type] = { revenue: 0, count: 0 };
    }
    grouped[item.type].revenue += item.revenue;
    grouped[item.type].count += item.count;
  });

  // ===== TÍNH TỔNG =====
  let totalRevenue = 0;
  let totalCount = 0;

  Object.values(grouped).forEach(item => {
    totalRevenue += item.revenue;
    totalCount += item.count;
  });

  // ===== RENDER =====
  let index = 1;

  for (let type in grouped) {
    const data = grouped[type];

    const percent = ((data.revenue / totalRevenue) * 100).toFixed(0);
    const rentPercent = ((data.count / totalCount) * 100).toFixed(0);

    tbody.innerHTML += `
      <tr>
        <td>${index++}</td>
        <td>${type}</td>
        <td>${data.revenue.toLocaleString()} VNĐ</td>
        <td class="text-center">${percent}%</td>
        <td class="text-center">${data.count}</td>
        <td class="text-center">${rentPercent}%</td>
        <td></td>
      </tr>
    `;
  }

  // ===== HIỂN THỊ TỔNG =====
  document.getElementById("totalRevenue").innerText =
    totalRevenue.toLocaleString() + " VNĐ";

  document.getElementById("totalCount").innerText = totalCount;
}

// ===== KHÁCH =====
function loadCustomerReport() {
    const tbody = document.getElementById("customerBody");
    tbody.innerHTML = "";

    const filterType = document.getElementById("filterType").value;

    let filteredData = [];

    //  LỌC THEO THÁNG
    if (filterType === "month") {
        const selectedMonth = document.getElementById("reportMonth").value;

        filteredData = customerData.filter(item =>
            item.month === selectedMonth
        );
    }

    // LỌC THEO NĂM
    else {
        const selectedYear = document.getElementById("reportYear").value;

        filteredData = customerData.filter(item =>
            item.month.startsWith(selectedYear)
        );
    }

    let total = 0;
    filteredData.forEach(item => total += item.count);

    filteredData.forEach(item => {
        const [year, m] = item.month.split("-");

        tbody.innerHTML += `
            <tr>
                <td>${parseInt(m)}/${year}</td>
                <td>${item.type}</td>
                <td class="text-center">${item.count}</td>
                <td class="text-center">${item.percent}%</td>
            </tr>
        `;
    });

    document.getElementById("totalCustomer").innerText = total;

    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    Không có dữ liệu
                </td>
            </tr>
        `;
    }


    // Nếu không có dữ liệu
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    Không có dữ liệu tháng này
                </td>
            </tr>
        `;
    }
}

// ===== ĐỔI REPORT =====
function changeReportType() {
  const type = document.getElementById("reportType").value;

  document.getElementById("revenue-report").style.display =
    type === "revenue" ? "block" : "none";

  document.getElementById("customer-report").style.display =
    type === "customer" ? "block" : "none";

  if (type === "customer") loadCustomerReport();  
else loadRevenue();
}

// ===== ĐỔI FILTER =====
function changeFilterType() {
  const type = document.getElementById("filterType").value;

  document.getElementById("monthBox").style.display =
    type === "month" ? "block" : "none";

  document.getElementById("yearBox").style.display =
    type === "year" ? "block" : "none";
}

// ===== APPLY FILTER =====
function applyFilter() {
  const type = document.getElementById("filterType").value;

  let text = "";

  if (type === "month") {
    const month = document.getElementById("reportMonth").value;
    const [year, m] = month.split("-");
    text = `Tháng ${parseInt(m)}/${year}`;
  } else {
    const year = document.getElementById("reportYear").value;
    text = `Năm ${year}`;
  }

  document.getElementById("displayMonth").innerText = text;
  document.getElementById("displayMonth2").innerText = text;

  changeReportType();
}

// ===== EXPORT =====
function exportReport() {
  window.print();
}
