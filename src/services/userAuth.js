import api from "./api";

export const adminLogin = async (userData) => {
    try {
        const response = await api.post("/auth/admin-login", userData);
        return response.data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

export const uploadImage = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await api.post("/admin/upload-image", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

export const getUsers = async (page = 1, pageSize = 10) => {
    try {
        const response = await api.get(`/admin/users?page=${page}&limit=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user details:", error);
        throw error;
    }
};

export const getUserTransactions = async (userId, page = 1, pageSize = 20) => {
    try {
        const response = await api.get(`/admin/users/${userId}/transactions?page=${page}&pageSize=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user transactions:", error);
        throw error;
    }
};