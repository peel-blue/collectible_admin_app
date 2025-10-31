import Sidebar from "./sidebar/Sidebar";

function Layout({ children }) {
    return (
        <div style={{
            display: "flex",
            height: "100vh",
            width: "100vw",
            overflow: "hidden"
        }}>
            <Sidebar />
            <main style={{
                marginLeft: "280px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#fff",
                overflow: "hidden",
                minWidth: 0,
                width: "calc(100vw - 280px)"
            }}>
                {children}
            </main>
        </div>
    );
}

export default Layout;
