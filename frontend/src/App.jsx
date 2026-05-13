import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/RegisterPage';
import Login from './pages/LoginPage';
import Home from './pages/HomePage';
import Header from './components/Header';
import Delivery from './pages/DeliveryPage';
import Returns from './pages/ReturnsPage';
import Contacts from './pages/ContactsPage';
import RegistrationConfirm from './pages/RegistrationConfirmPage';
import VerificationSuccess from './pages/VerificationSuccessPage';
import CartPage from './pages/CartPage';
import SearchPage from './pages/SearchProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage';

import MotoPage from './pages/MotoPage';
import EquipmentPage from './pages/EquipmentPage';
import ComponentsPage from './pages/ComponentsPage';
import FavoritesPage from './pages/FavoritesPage';
import AddReviewPage from './pages/AddReviewPage';

// Placeholder components for missing pages
const Moto = () => <h1>Moto Details Page</h1>;

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      window.dispatchEvent(new Event('authUpdated'));
    }

    const syncWithServer = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Sync Cart
        const cartRes = await fetch('/api/cart-items', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          localStorage.setItem('cart', JSON.stringify(cartData));
          window.dispatchEvent(new Event('cartUpdated'));
        }

        // Sync Favorites
        const favRes = await fetch('/api/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (favRes.ok) {
          const favData = await favRes.json();
          localStorage.setItem('favorites', JSON.stringify(favData));
          window.dispatchEvent(new Event('favoritesUpdated'));
        }
      } catch (err) {
        console.error("Помилка синхронізації з сервером:", err);
      }
    };

    syncWithServer();
    window.addEventListener('authUpdated', syncWithServer);
    return () => window.removeEventListener('authUpdated', syncWithServer);
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/registration-confirm" element={<RegistrationConfirm />} />
        <Route path="/verification-success" element={<VerificationSuccess />} />
        <Route path="/moto" element={<MotoPage />} />
        <Route path="/moto/:id" element={<Moto />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/cart-items" element={<CartPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:category/:id" element={<ProductDetailPage />} />
        <Route path="/review/add/:category/:id" element={<AddReviewPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </Router>
    //     {/* <div className = "head">
    //         <div className = "storeName">
    //      <span>moto</span>
    // <span>Country</span>
    //       </div>
    //       <div className = "motoClassification">

    //       </div>
    //   </div> */}


  )
}

export default App
