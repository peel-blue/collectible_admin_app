import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

function Sidebar() {
    const location = useLocation();

    return (
        <div className={styles.sidebar}>
            <h2 className={styles['sidebar-title']}>Admin Panel</h2>
            <nav className={styles['sidebar-nav']}>
                <Link to="/home" className={location.pathname === "/home" ? styles.active : ""}>
                    🏠 Dashboard
                </Link>
                <Link to="/users" className={location.pathname === "/users" ? styles.active : ""}>
                    👤 Users
                </Link>
                <Link to="/collection" className={location.pathname === "/collection" ? styles.active : ""}>
                    💰 Collections
                </Link>
                <Link to="/packs" className={location.pathname === "/packs" ? styles.active : ""}>
                    🔄 Packs
                </Link>
                <Link to="/collectibles" className={location.pathname === "/collectibles" ? styles.active : ""}>
                    🎨 Collectibles
                </Link>
                {/* <Link to="/settings" className={location.pathname === "/settings" ? styles.active : ""}>
                    ⚙️ Settings
                </Link> */}
            </nav>
        </div>
    );
}

export default Sidebar;
