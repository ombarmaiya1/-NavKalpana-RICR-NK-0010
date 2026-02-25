export const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const getFromStorage = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

export const removeFromStorage = (key) => {
    localStorage.removeItem(key);
};

export const clearAppStorage = () => {
    // Only clear app-specific keys, not the auth token
    const STORAGE_KEYS = [
        'dashboard_data',
        'quiz_data',
        'assignment_data',
        'assignment_list',
        'learning_topics',
    ];
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('token');
};
