import api from "./api";

export const getAllCollections = async () => {
    try {
        const response = await api.get("/admin/collections");
        return response.data;
    } catch (error) {
        console.error("Error fetching admin collections:", error);
        throw error;
    }
};


export const addCollection = async (collectionData) => {
    try {
        const response = await api.post("/admin/collections", collectionData);
        return response.data;
    } catch (error) {
        console.error("Error adding collection:", error);
        throw error;
    }
};

export const updateCollection = async (id, collectionData) => {
    try {
        // Using POST instead of PUT to avoid CORS issues
        const response = await api.post(`/admin/collections/${id}`, collectionData);
        return response.data;
    } catch (error) {
        console.error("Error updating collection:", error);
        throw error;
    }
};
