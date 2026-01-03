import api from "./api";

// Get all config values
export const getAllConfigs = async () => {
    try {
        const response = await api.get('/admin/config');
        return response.data;
    } catch (error) {
        console.error('Error fetching configs:', error);
        throw error;
    }
};

// Update a config value
export const updateConfig = async (value) => {
    try {
        const response = await api.post(`/admin/config`, value);
        return response.data;
    } catch (error) {
        console.error('Error updating config:', error);
        throw error;
    }
};