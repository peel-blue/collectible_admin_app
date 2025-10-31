import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    return (
        <Layout>
            <h1>Dashboard</h1>
            <p>Welcome to your Courtyard Admin Panel!</p>
            <button onClick={handleLogout}>Logout</button>
        </Layout>
    );
}

export default Home;
