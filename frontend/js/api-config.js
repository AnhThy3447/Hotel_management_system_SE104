/**
 * Một base URL cho toàn bộ API (quy định, thuê phòng, phòng, …).
 * Chạy local: backend tại cổng 3000.
 */
(function initApiConfig(global) {
    const isLocal =
        global.location &&
        (global.location.hostname === 'localhost' || global.location.hostname === '127.0.0.1');

    const API_BASE_URL = isLocal
        ? `http://${global.location.hostname}:3000/api`
        : 'https://hotel-management-system-se104-g0le.onrender.com/api';

    global.API_BASE_URL = API_BASE_URL;
    global.API_QUYDINH_URL = `${API_BASE_URL}/quy-dinh`;
})(typeof window !== 'undefined' ? window : global);
