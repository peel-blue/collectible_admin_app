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

export const getUsers = async () => {
    try {
        const response = await api.get("/admin/users");
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};