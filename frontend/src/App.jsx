
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { CartProvider } from "./cart/CartContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import Cloth from "./pages/Cloth";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import DashboardRedirect from "./pages/DashboardRedirect";
import CustomizationInfo from "./pages/CustomizationInfo";
import CustomizeCanvas from "./pages/CustomizeCanvas";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";

// Admin Dashboard Pages
import DashboardLayout from "./components/dashboard/DashboardLayout";
import AdminOverview from "./pages/admin/Overview";
import UserManagement from "./pages/admin/Users";
import AdminProductManagement from "./pages/admin/ProductManagement";
import AdminOrderManagement from "./pages/admin/Orders";
import AdminInventory from "./pages/admin/Inventory";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminCategories from "./pages/admin/Categories";
import SlaughterStudio from "./pages/admin/SlaughterStudio";

function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Customer Routes with Main Navbar */}
      <Route
        path="/*"
        element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Shop />} />
              <Route path="/cloth" element={<Cloth  />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute roles={["customer", "admin"]}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="/customization-info" element={<CustomizationInfo />} />
              <Route path="/customize-canvas" element={<CustomizeCanvas />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </>
        }
      />

      {/* Unified Dashboard Entry Point */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<AdminOverview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="products" element={<AdminProductManagement />} />
                <Route path="orders" element={<AdminOrderManagement />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<SlaughterStudio />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}