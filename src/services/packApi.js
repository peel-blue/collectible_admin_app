import api from "./api";

// Get all packs
export const getAllPacks = async () => {
    try {
        const response = await api.get('/admin/packs');
        return response.data;
    } catch (error) {
        console.error('Error fetching packs:', error);
        throw error;
    }
};

// Get pack by ID
export const getPackById = async (id) => {
    try {
        const response = await api.get(`/admin/packs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pack:', error);
        throw error;
    }
};

// Create new pack
export const createPack = async (packData) => {
    try {
        const response = await api.post('/admin/packs', packData);
        return response.data;
    } catch (error) {
        console.error('Error creating pack:', error);
        throw error;
    }
};

// Update pack
export const updatePack = async (id, packData) => {
    try {
        // Using POST instead of PUT to avoid CORS issues
        const response = await api.post(`/admin/packs/${id}`, packData);
        return response.data;
    } catch (error) {
        console.error('Error updating pack:', error);
        throw error;
    }
};

// Delete pack
export const deletePack = async (id) => {
    try {
        const response = await api.delete(`/admin/packs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting pack:', error);
        throw error;
    }
};

// Toggle pack status
export const togglePackStatus = async (id, status) => {
    try {
        const response = await api.patch(`/admin/packs/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error toggling pack status:', error);
        throw error;
    }
};