export const storage = {
  save: (key, data) => {
    try {
      localStorage.setItem(`talentdash_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving to localStorage", e);
    }
  },
  load: (key) => {
    try {
      const data = localStorage.getItem(`talentdash_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error loading from localStorage", e);
      return null;
    }
  },
  clear: (key) => {
    localStorage.removeItem(`talentdash_${key}`);
  },
  clearAll: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('talentdash_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
