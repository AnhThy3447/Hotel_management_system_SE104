const BASE_URL =
    "https://hotel-management-system-se104.onrender.com/api/bao-cao";

// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("📊 REPORT PAGE READY");

    const btnView =
        document.getElementById("btnView");

    if (btnView) {

        btnView.addEventListener(
            "click",
            loadReport
        );
    }

    loadReport();
});

// ======================================================

async function loadReport() {

    const reportType =
        document.getElementById("reportType").value;

    if (reportType === "revenue") {

        await loadRevenueReport();

    } else {

        await loadGuestReport();
    }
}

// ======================================================
// DOANH THU
// ======================================================

async function loadRevenueReport() {

    const tbody =
        document.getElementById("revenueBody");

    tbody.innerHTML = `
        <tr>
            <td colspan="7">
                Đang tải dữ liệu...
            </td>
        </tr>
    `;

    try {

        const filterType =
            document.getElementById("filterType").value;

        const value =
            document.getElementById("reportMonth").value;

        const url =
            `${BASE_URL}/doanh-thu?filterType=${filterType}&value=${value}`;

        console.log(url);

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message
            );
        }

        const data =
            result.data || [];

        // ==================================================
        // EMPTY
        // ==================================================

        if (data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        Không có dữ liệu
                    </td>
                </tr>
            `;

            return;
        }

        // ==================================================
        // TOTAL
        // ==================================================

        document.getElementById(
            "totalRevenue"
        ).innerText =
            Number(
                result.totalRevenue || 0
            ).toLocaleString("vi-VN") + " VNĐ";

        document.getElementById(
            "totalCount"
        ).innerText =
            result.totalCount || 0;

        // ==================================================
        // TABLE
        // ==================================================

        tbody.innerHTML = "";

        data.forEach((item, index) => {

            tbody.innerHTML += `
                <tr>

                    <td>${index + 1}</td>

                    <td>${item.type}</td>

                    <td>
                        ${Number(item.revenue)
                            .toLocaleString('vi-VN')}
                        VNĐ
                    </td>

                    <td>${item.percent}%</td>

                    <td>${item.count}</td>

                    <td>${item.rentPercent}%</td>

                    <td>
                        ${item.count > 0
                            ? 'Có lượt thuê'
                            : 'Không có'}
                    </td>

                </tr>
            `;
        });

    } catch (error) {

        console.error(error);

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="color:red">

                    Lỗi tải báo cáo doanh thu:
                    ${error.message}

                </td>
            </tr>
        `;
    }
}

// ======================================================
// KHÁCH
// ======================================================

async function loadGuestReport() {

    const tbody =
        document.getElementById("customerBody");

    tbody.innerHTML = `
        <tr>
            <td colspan="4">
                Đang tải dữ liệu...
            </td>
        </tr>
    `;

    try {

        const filterType =
            document.getElementById("filterType").value;

        const value =
            document.getElementById("reportMonth").value;

        const url =
            `${BASE_URL}/khach?filterType=${filterType}&value=${value}`;

        console.log(url);

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message
            );
        }

        const data =
            result.data || [];

        if (data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="4">
                        Không có dữ liệu
                    </td>
                </tr>
            `;

            return;
        }

        document.getElementById(
            "totalCustomer"
        ).innerText =
            result.total || 0;

        tbody.innerHTML = "";

        data.forEach(item => {

            tbody.innerHTML += `
                <tr>

                    <td>${item.month}</td>

                    <td>${item.type}</td>

                    <td>${item.count}</td>

                    <td>${item.percent}%</td>

                </tr>
            `;
        });

    } catch (error) {

        console.error(error);

        tbody.innerHTML = `
            <tr>
                <td colspan="4"
                    style="color:red">

                    Lỗi tải báo cáo khách:
                    ${error.message}

                </td>
            </tr>
        `;
    }
}

window.loadReport = loadReport;