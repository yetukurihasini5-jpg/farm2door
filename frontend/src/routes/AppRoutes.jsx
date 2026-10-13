import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import ConsumerLayout from '../layouts/ConsumerLayout';
import FarmerLayout from '../layouts/FarmerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Route Guard
import ProtectedRoute from '../components/navigation/ProtectedRoute';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import ProductCatalogPage from '../pages/public/ProductCatalogPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Cart & Orders
import CartPage from '../pages/cart/CartPage';
import CheckoutPage from '../pages/orders/CheckoutPage';
import OrderHistoryPage from '../pages/orders/OrderHistoryPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';

// Consumer Pages
import ConsumerDashboard from '../pages/consumer/ConsumerDashboard';
import ConsumerAddressesPage from '../pages/consumer/ConsumerAddressesPage';
import NotificationsPage from '../pages/consumer/NotificationsPage';
import ProfilePage from '../pages/consumer/ProfilePage';

// Farmer Pages
import FarmerDashboard from '../pages/farmer/FarmerDashboard';
import FarmerProductsPage from '../pages/farmer/FarmerProductsPage';
import FarmerOrdersPage from '../pages/farmer/FarmerOrdersPage';
import FarmerProfilePage from '../pages/farmer/FarmerProfilePage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductCatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Global Consumer Orders & Checkout */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CONSUMER']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CONSUMER']}>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CONSUMER', 'ROLE_FARMER', 'ROLE_ADMIN']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth Pages (without standard navbar/footer) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Consumer Portal */}
      <Route
        path="/consumer"
        element={
          <ProtectedRoute allowedRoles={['ROLE_CONSUMER']}>
            <ConsumerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/consumer/dashboard" replace />} />
        <Route path="dashboard" element={<ConsumerDashboard />} />
        <Route path="orders" element={<OrderHistoryPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="addresses" element={<ConsumerAddressesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Farmer Portal */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute allowedRoles={['ROLE_FARMER']}>
            <FarmerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/farmer/dashboard" replace />} />
        <Route path="dashboard" element={<FarmerDashboard />} />
        <Route path="products" element={<FarmerProductsPage />} />
        <Route path="orders" element={<FarmerOrdersPage />} />
        <Route path="profile" element={<FarmerProfilePage />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
