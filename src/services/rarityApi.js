import api from "./api";

export const getRarities = async (packId) => {
    try {
        const response = await api.get(`/admin/rarities?packId=${packId ? packId : ''}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching rarities:", error);
        throw error;
    }
};

export const addRarity = async (rarityData) => {
    try {
        const response = await api.post("/admin/rarities", rarityData);
        return response.data;
    } catch (error) {
        console.error("Error adding rarity:", error);
        throw error;
    }
};

export const updateRarity = async (id, rarityData) => {
    try {
        const response = await api.post(`/admin/rarities/${id}`, rarityData);
        return response.data;
    } catch (error) {
        console.error("Error updating rarity:", error);
        throw error;
    }
};

// Assign rarities to a specific pack (POST /packs/:id/rarities)
export const addPackRarities = async (packId, raritiesPayload) => {
    try {
        const response = await api.post(`/admin/packs/${packId}/rarities`, raritiesPayload);
        return response.data;
    } catch (error) {
        console.error("Error assigning rarities to pack:", error);
        throw error;
    }
};