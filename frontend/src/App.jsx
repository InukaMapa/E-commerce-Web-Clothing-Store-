import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { CartProvider } from "./cart/CartContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import DashboardRedirect from "./pages/DashboardRedirect";
import NotFound from "./pages/NotFound";

// Admin Dashboard Pages
import DashboardLayout from "./components/dashboard/DashboardLayout";
import AdminOverview from "./pages/admin/Overview";
import UserManagement from "./pages/admin/Users";

// Producer Dashboard Pages
import ProducerOverview from "./pages/producer/Overview";
import MyProducts from "./pages/producer/Products";

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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute roles={["customer", "producer", "admin"]}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </>
        }
      />

      {/* Unified Dashboard Entry Point */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["producer", "admin"]}>
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
                <Route path="products" element={<div>All Products (WIP)</div>} />
                <Route path="producers" element={<div>Producers (WIP)</div>} />
                <Route path="orders" element={<div>All Orders (WIP)</div>} />
                <Route path="categories" element={<div>Categories (WIP)</div>} />
                <Route path="analytics" element={<AdminOverview />} />
                <Route path="settings" element={<div>Settings (WIP)</div>} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Producer Dashboard Routes */}
      <Route
        path="/producer/*"
        element={
          <ProtectedRoute roles={["producer"]}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<ProducerOverview />} />
                <Route path="products" element={<MyProducts />} />
                <Route path="orders" element={<div>My Orders (WIP)</div>} />
                <Route path="analytics" element={<ProducerOverview />} />
                <Route path="settings" element={<div>Settings (WIP)</div>} />
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