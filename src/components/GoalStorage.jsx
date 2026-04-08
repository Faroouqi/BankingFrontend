// Key for localStorage
const STORAGE_KEY = "goalNames";

export const getGoalNames = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
};

export const addGoalNames = (names) => {
    const existing = getGoalNames();

    const updated = [...new Set([...existing, ...names])];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const addGoalName = (name) => {
    const existing = getGoalNames();

    if (!existing.includes(name)) {
        existing.push(name);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
};

export const removeGoalName = (name) => {
    const existing = getGoalNames();
    const updated = existing.filter(item => item !== name);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const clearGoalNames = () => {
    localStorage.removeItem(STORAGE_KEY);
};