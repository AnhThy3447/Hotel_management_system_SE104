const BASE_URL = "http://localhost:3000/api/baocao";

// ===== LOAD =====
document.addEventListener("DOMContentLoaded", () => {
  loadRevenue();
});


async function loadRevenue() {
  const tbody = document.getElementById("revenueBody");
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:15px;">Đang tải dữ liệu doanh thu...</td></tr>`;

  const filterType = document.getElementById("filterType").value;
  let filterValue = "";

  if (filterType === "month") {
    filterValue = document.getElementById("reportMonth").value; // Định dạng: YYYY-MM
  } else {
    filterValue = document.getElementById("reportYear").value;  // Định dạng: YYYY
  }

  if (!filterValue) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Vui lòng chọn thời gian</td></tr>`;
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/doanh-thu?filterType=${filterType}&value=${filterValue}`);
    const filteredData = await response.json();


    if (!filteredData || filteredData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">Không có dữ liệu doanh thu</td>
        </tr>
      `;
      document.getElementById("totalRevenue").innerText = "0 VNĐ";
      document.getElementById("totalCount").innerText = "0";
      return;
    }

    let totalRevenue = 0;
    let totalCount = 0;

    filteredData.forEach(item => {
      totalRevenue += Number(item.revenue);
      totalCount += Number(item.count);
    });

    tbody.innerHTML = "";
    let index = 1;

    filteredData.forEach(item => {
      const revenue = Number(item.revenue);
      const count = Number(item.count);

      const percent = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(0) : 0;
      const rentPercent = totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : 0;

      tbody.innerHTML += `
        <tr>
          <td>${index++}</td>
          <td>Phòng loại ${item.type}</td>
          <td>${revenue.toLocaleString()} VNĐ</td>
          <td class="text-center">${percent}%</td>
          <td class="text-center">${count}</td>
          <td class="text-center">${rentPercent}%</td>
          <td>${item.revenue > 0 ? "Ổn định" : ""}</td>
        </tr>
      `;
    });

    document.getElementById("totalRevenue").innerText = totalRevenue.toLocaleString() + " VNĐ";
    document.getElementById("totalCount").innerText = totalCount;

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Lỗi hệ thống: ${error.message}</td></tr>`;
  }
}


async function loadCustomerReport() {
  const tbody = document.getElementById("customerBody");
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px;">Đang tải dữ liệu mật độ khách...</td></tr>`;

  const filterType = document.getElementById("filterType").value;
  let filterValue = "";

  if (filterType === "month") {
    filterValue = document.getElementById("reportMonth").value;
  } else {
    filterValue = document.getElementById("reportYear").value;
  }

  if (!filterValue) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Vui lòng chọn thời gian</td></tr>`;
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/khach?filterType=${filterType}&value=${filterValue}`);
    const filteredData = await response.json();

    
    if (!filteredData || filteredData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state">Không có dữ liệu khách tháng này</td>
        </tr>
      `;
      document.getElementById("totalCustomer").innerText = "0";
      return;
    }

    
    let total = 0;
    filteredData.forEach(item => total += Number(item.count));

    
    tbody.innerHTML = "";
    filteredData.forEach(item => {
      const [year, m] = item.month.split("-");
      const count = Number(item.count);
      const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

      tbody.innerHTML += `
        <tr>
          <td>${parseInt(m)}/${year}</td>
          <td>Khách ${item.type}</td>
          <td class="text-center">${count}</td>
          <td class="text-center">${percent}%</td>
        </tr>
      `;
    });

    document.getElementById("totalCustomer").innerText = total;

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Lỗi hệ thống: ${error.message}</td></tr>`;
  }
}


function changeReportType() {
  const type = document.getElementById("reportType").value;

  document.getElementById("revenue-report").style.display =
    type === "revenue" ? "block" : "none";

  document.getElementById("customer-report").style.display =
    type === "customer" ? "block" : "none";

  if (type === "customer") loadCustomerReport();  
  else loadRevenue();
}


function changeFilterType() {
  const type = document.getElementById("filterType").value;

  document.getElementById("monthBox").style.display =
    type === "month" ? "block" : "none";

  document.getElementById("yearBox").style.display =
    type === "year" ? "block" : "none";
}


function applyFilter() {
  const type = document.getElementById("filterType").value;
  let text = "";

  if (type === "month") {
    const month = document.getElementById("reportMonth").value;
    if (month) {
      const [year, m] = month.split("-");
      text = `Tháng ${parseInt(m)}/${year}`;
    } else {
      text = "Chưa chọn tháng";
    }
  } else {
    const year = document.getElementById("reportYear").value;
    text = year ? `Năm ${year}` : "Chưa chọn năm";
  }

  document.getElementById("displayMonth").innerText = text;
  document.getElementById("displayMonth2").innerText = text;

  changeReportType();
}


function exportReport() {
  const currentType = document.getElementById("reportType").value;
  let tableId = "";
  let filePrefix = "";
  let headerRow = [];

  if (currentType === "revenue") {
    tableId = "revenueBody";
    filePrefix = "BaoCaoDoanhThu";
    headerRow = ["STT", "Loại Phòng", "Doanh Thu", "Tỷ Lệ Doanh Thu", "Số Lượt Thuê", "Tỷ Lệ Thuê", "Ghi Chú"];
  } else {
    tableId = "customerBody";
    filePrefix = "BaoCaoKhach";
    headerRow = ["Tháng/Năm", "Loại Khách", "Số Lượng Khách", "Tỷ Lệ"];
  }

  const tableBody = document.getElementById(tableId);
  if (!tableBody || tableBody.innerHTML.includes("empty-state") || tableBody.rows.length === 0) {
    alert("Không có số liệu hiển thị trên bảng để kết xuất file!");
    return;
  }

  let csvContent = "";
  csvContent += headerRow.map(h => `"${h}"`).join(",") + "\n";

  const rows = tableBody.querySelectorAll("tr");
  for (let i = 0; i < rows.length; i++) {
    const cols = rows[i].querySelectorAll("td");
    const rowData = [];
    for (let j = 0; j < cols.length; j++) {
      // Loại bỏ ký tự dấu phẩy trong định dạng tiền tệ (ví dụ: 15,000,000) để không bị nhảy lệch ô Excel
      let text = cols[j].innerText.replace(/,/g, "");
      rowData.push(`"${text}"`);
    }
    csvContent += rowData.join(",") + "\n";
  }

 
  if (currentType === "revenue") {
    const totalRev = document.getElementById("totalRevenue").innerText.replace(/,/g, "");
    const totalCnt = document.getElementById("totalCount").innerText;
    csvContent += `"Tổng cộng","", "${totalRev}","", "${totalCnt}","",""\n`;
  } else {
    const totalCst = document.getElementById("totalCustomer").innerText;
    csvContent += `"Tổng cộng","", "${totalCst}",""\n`;
  }

  
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const timeText = document.getElementById("displayMonth").innerText.replace(/\//g, "-");
  link.href = url;
  link.setAttribute("download", `${filePrefix}_${timeText}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}