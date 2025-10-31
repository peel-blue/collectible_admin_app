import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    // Check login session from localStorage (or cookies, or context)
    const token = localStorage.getItem("token");

    if (!token) {
        // Not logged in → redirect to login
        return <Navigate to="/login" replace />;
    }

    // Logged in → allow access
    return children;
};

export default ProtectedRoute;
