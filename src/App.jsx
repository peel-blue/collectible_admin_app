import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Packs from "./pages/Packs";
import Collectibles from "./pages/Collectibles";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/collection" element={
          <ProtectedRoute>
            <Collection />
          </ProtectedRoute>
        } />
        <Route path="/packs" element={
          <ProtectedRoute>
            <Packs />
          </ProtectedRoute>
        } />
        <Route path="/collectibles" element={
          <ProtectedRoute>
            <Collectibles />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/users/:userId" element={
          <ProtectedRoute>
            <UserDetail />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/users" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
