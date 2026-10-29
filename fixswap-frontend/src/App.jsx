import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerDashboard from './pages/customer/Dashboard';
import ShopDashboard from './pages/shop/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import PartnerLandingPage from './pages/PartnerLandingPage';
import PartnerLoginPage from './pages/PartnerLoginPage';
import PartnerRegisterPage from './pages/PartnerRegisterPage';
import CorporateLoginPage from './pages/CorporateLoginPage';
import CorporateRegisterPage from './pages/CorporateRegisterPage';
import CorporateDashboard from './pages/corporate/Dashboard';
import WorkerLoginPage from './pages/worker/WorkerLoginPage';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerLandingPage from './pages/worker/WorkerLandingPage';
import WorkerSignupPage from './pages/worker/WorkerSignupPage';
import DeliveryPartnerLoginPage from './pages/delivery/DeliveryPartnerLoginPage';
import DeliveryPartnerDashboard from './pages/delivery/DeliveryPartnerDashboard';
import DeliveryLandingPage from './pages/delivery/DeliveryLandingPage';
import DeliverySignupPage from './pages/delivery/DeliverySignupPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/partner" element={<PartnerLandingPage />} />
        <Route path="/worker" element={<WorkerLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/corporate/login" element={<CorporateLoginPage />} />
        <Route path="/corporate/register" element={<CorporateRegisterPage />} />
        <Route path="/partner/login" element={<PartnerLoginPage />} />
        <Route path="/partner/register" element={<PartnerRegisterPage />} />
        <Route path="/worker/login" element={<WorkerLoginPage />} />
        <Route path="/worker/signup" element={<WorkerSignupPage />} />
        <Route path="/delivery" element={<DeliveryLandingPage />} />
        <Route path="/delivery/login" element={<DeliveryPartnerLoginPage />} />
        <Route path="/delivery/signup" element={<DeliverySignupPage />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/corporate/dashboard" element={<CorporateDashboard />} />
        <Route path="/partner/dashboard" element={<ShopDashboard />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/delivery/dashboard" element={<DeliveryPartnerDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
