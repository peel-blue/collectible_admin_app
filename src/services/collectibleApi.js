import api from './api';

// Get all collectibles
export const getAllCollectibles = async (page = 1, pageSize = 15, collection_id = null) => {
    try {
        const params = {
            page,
            pageSize
        };
        if (collection_id) {
            params.collection_id = collection_id;
        }

        const response = await api.get('/admin/collectibles', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching collectibles:', error);
        throw error;
    }
};

// Get collectible by ID
export const getCollectibleById = async (id) => {
    try {
        const response = await api.get(`/admin/collectibles/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching collectible:', error);
        throw error;
    }
};

// Create new collectible
export const createCollectible = async (collectibleData) => {
    try {
        const response = await api.post('/admin/collectibles', collectibleData);
        return response.data;
    } catch (error) {
        console.error('Error creating collectible:', error);
        throw error;
    }
};

// Update collectible
export const updateCollectible = async (id, collectibleData) => {
    try {
        // Using POST instead of PUT to avoid CORS issues
        const response = await api.post(`/admin/collectibles/${id}`, collectibleData);
        return response.data;
    } catch (error) {
        console.error('Error updating collectible:', error);
        throw error;
    }
};

// Delete collectible
export const deleteCollectible = async (id) => {
    try {
        const response = await api.post(`/admin/delete-collectibles/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting collectible:', error);
        throw error;
    }
};

// Toggle collectible status
export const toggleCollectibleStatus = async (id, status) => {
    try {
        const response = await api.patch(`/admin/collectibles/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error toggling collectible status:', error);
        throw error;
    }
};