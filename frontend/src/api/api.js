/**
 * central api utility wrapper
 */

const API_BASE = '';

export async function apiRequest(url, method = 'GET', body = null, isMultipart = false) {
    const token = localStorage.getItem('token');

    const headers = {};
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = isMultipart ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${url}`, config);

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return null;
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message };
    }
}
