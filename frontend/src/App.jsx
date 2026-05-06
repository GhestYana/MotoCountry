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

import MotoPage from './pages/MotoPage';
import EquipmentPage from './pages/EquipmentPage';
import ComponentsPage from './pages/ComponentsPage';
import FavoritesPage from './pages/FavoritesPage';

// Placeholder components for missing pages
const Moto = () => <h1>Moto Details Page</h1>;

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Force update components that depend on auth state
      window.dispatchEvent(new Event('authUpdated'));
    }
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
