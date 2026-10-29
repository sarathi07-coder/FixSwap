import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Bell, LogOut, CheckCircle2, AlertCircle, FileText, Activity, MapPin, Truck, Zap, Plus, Settings, Users, UploadCloud, Map as MapIcon, XCircle, Trash2, Shield, Clock, BarChart3, Briefcase, Leaf, Phone, Laptop, Factory, CreditCard, Camera, User, ChevronDown, Lock, UserPlus, Trash } from 'lucide-react';
import LocationPicker from '../../components/LocationPicker';
import ActiveTicketTrackerCard from '../../components/ActiveTicketTrackerCard';
import { corporateSession } from '../../auth/session';

const CATEGORY_DETAILS = {
  appliances: {
    id: 'appliances',
    name: 'Commercial Appliances',
    image: '/images/cat_appliances.png',
    products: ['Commercial Fridge', 'Walk-in Freezer', 'Industrial Washer', 'Commercial Dryer', 'Industrial Oven', 'Dishwasher (Commercial)', 'Other'],
    brands: ['True', 'Traulsen', 'Hobart', 'Vulcan', 'Samsung Commercial', 'LG Commercial', 'Electrolux Professional', 'Other']
  },
  hvac: {
    id: 'hvac',
    name: 'Enterprise HVAC',
    image: '/images/cat_hvac.png',
    products: ['Central AC Unit', 'Rooftop HVAC Unit (RTU)', 'Chiller', 'Boiler System', 'Ventilation Network', 'Commercial Heat Pump', 'Other'],
    brands: ['Carrier', 'Trane', 'Lennox', 'York', 'Daikin', 'Mitsubishi Electric', 'Johnson Controls', 'Other']
  },
  plumbing: {
    id: 'plumbing',
    name: 'Commercial Plumbing',
    image: '/images/cat_plumbing.png',
    products: ['Commercial Sink/Faucet', 'Industrial Toilet', 'Urinal', 'Water Main', 'Commercial Water Heater', 'Grease Trap', 'Sump Pump', 'Other'],
    brands: ['Sloan', 'Kohler Commercial', 'Moen Commercial', 'American Standard', 'Zurn', 'Bradley', 'Other']
  },
  electrical: {
    id: 'electrical',
    name: 'Facility Electrical',
    image: '/images/cat_electrical.png',
    products: ['Building Lighting Network', 'Main Breaker Panel', 'Generator', 'Industrial UPS/Inverter', 'Security Network', 'Access Control System', 'Other'],
    brands: ['Schneider Electric', 'Eaton', 'Siemens', 'ABB', 'Legrand', 'Honeywell Commercial', 'Other']
  },
  kitchen: {
    id: 'kitchen',
    name: 'Commercial Kitchen',
    image: '/images/cat_appliances.png',
    products: ['Industrial Mixer', 'Commercial Grinder', 'Food Processor', 'Commercial Gas Stove', 'Induction Stove', 'Microwave Oven', 'Electric Kettle', 'Water Purifier (RO)', 'Other'],
    brands: ['Preethi', 'Butterfly', 'Prestige', 'Pigeon', 'Bajaj', 'Philips', 'Bosch', 'Kent', 'Aquaguard', 'Faber', 'Other']
  },
  electronics: {
    id: 'electronics',
    name: 'Enterprise Electronics',
    image: '/images/cat_electrical.png',
    products: ['Company Smartphone', 'Company Laptop', 'Tablet / iPad', 'Desktop PC', 'Server Rack', 'Monitor', 'Smart TV', 'Other'],
    brands: ['Apple', 'Samsung', 'OnePlus', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Sony', 'Microsoft', 'Other']
  },
  automotive: {
    id: 'automotive',
    name: 'Corporate Fleet & Mobility',
    image: '/images/cat_appliances.png',
    products: ['Company Car (Sedan/SUV)', 'Delivery Van', 'Truck', 'Motorcycle / Bike', 'EV Bike', 'Electric Car', 'Electric Motor / Pump', 'Other'],
    brands: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Ashok Leyland', 'TVS', 'Bajaj', 'Ather', 'Ola Electric', 'Hero', 'Other']
  }
};

export default function CorporateDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [tickets, setTickets] = useState([]);
  const [garage, setGarage] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Booking State
  const [showBook, setShowBook] = useState(false);
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [bookStep, setBookStep] = useState(1);
  const [ticketData, setTicketData] = useState({ 
    category: '', product: '', otherProduct: '', brand: '', otherBrand: '', 
    model: '', year: '', issue: '', photos: [], 
    locationType: 'auto', address: '' 
  });
  const fileInputRef = useRef(null);

  // Asset State
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [assetItem, setAssetItem] = useState({ category: '', product: '', brand: '', model: '', year: '', photo: null });

  // Profile State
  const [profile, setProfile] = useState({ fullName: '', phoneNumber: '', email: '', hqAddress: '', profilePhoto: '', smsNotifications: true, whatsappNotifications: true });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState('account');
  const [corpDashboard, setCorpDashboard] = useState(null);
  const [delays, setDelays] = useState([]);
  const [esgReport, setEsgReport] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [esgWasteType, setEsgWasteType] = useState('Laptops & IT');
  const [inviteForm, setInviteForm] = useState({ fullName: '', email: '', role: 'Dispatcher' });
  const [assetIntel, setAssetIntel] = useState(null);
  const [workerPickupOtpInput, setWorkerPickupOtpInput] = useState('');
  const [workerDeliveryOtpInput, setWorkerDeliveryOtpInput] = useState('');
  const [otpErrorMsg, setOtpErrorMsg] = useState('');

  const handleVerifyWorkerPickupOtp = async (ticketId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/verify-worker-otp?otp=${workerPickupOtpInput}`, { method: 'POST' });
      if (res.ok) {
        setWorkerPickupOtpInput('');
        setOtpErrorMsg('');
        fetchTickets();
      } else {
        setOtpErrorMsg('Invalid technician OTP');
      }
    } catch (e) {
      setOtpErrorMsg('Verification error.');
    }
  };

  const handleVerifyWorkerDeliveryOtp = async (ticketId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/verify-worker-delivery-otp?otp=${workerDeliveryOtpInput}`, { method: 'POST' });
      if (res.ok) {
        setWorkerDeliveryOtpInput('');
        setOtpErrorMsg('');
        fetchTickets();
      } else {
        setOtpErrorMsg('Invalid courier OTP');
      }
    } catch (e) {
      setOtpErrorMsg('Verification error.');
    }
  };

  useEffect(() => { 
    if (!corporateSession.get('userId')) {
      navigate('/corporate/login');
      return;
    }
    const role = corporateSession.get('userRole');
    if (role === 'CUSTOMER') {
      alert('Household accounts must use the customer portal.');
      corporateSession.clear();
      navigate('/login');
      return;
    }
    fetchTickets(); 
    fetchGarage();
    fetchProfile();
    fetchCorporateData();
    const interval = setInterval(() => {
      fetchTickets();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    const userId = corporateSession.get('userId');
    if (!userId) return;
    try {
      const res = await fetch(`/api/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          fullName: data.fullName || corporateSession.get('userName') || 'Corporate User',
          email: data.email || corporateSession.get('userEmail') || '',
          phoneNumber: data.phoneNumber || '',
          hqAddress: data.hqAddress || '',
          profilePhoto: data.profilePhoto || '',
          smsNotifications: data.smsNotifications !== false,
          whatsappNotifications: data.whatsappNotifications !== false,
        });
      }
    } catch (e) { console.error(e); }
  };

  const updateProfile = async () => {
    setSavingProfile(true);
    const userId = corporateSession.get('userId');
    try {
      const res = await fetch(`/api/profile/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(prev => ({
          ...prev,
          fullName: updated.fullName || prev.fullName,
          email: updated.email || prev.email || corporateSession.get('userEmail') || '',
          phoneNumber: updated.phoneNumber || prev.phoneNumber,
          hqAddress: updated.hqAddress ?? prev.hqAddress,
          profilePhoto: updated.profilePhoto ?? prev.profilePhoto,
        }));
        if (updated.fullName) corporateSession.set('userName', updated.fullName);
        alert("Corporate profile updated!");
      }
    } catch (e) { alert("Failed to update profile."); }
    finally { setSavingProfile(false); }
  };

  const fetchTickets = async () => {
    const userId = corporateSession.get('userId');
    if (!userId) return navigate('/corporate/login');
    try {
      let res = await fetch(`/api/tickets/customer/${userId}/enterprise`);
      if (!res.ok) {
        res = await fetch(`/api/tickets/customer/${userId}?channel=ENTERPRISE`);
      }
      if (res.ok) setTickets(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchGarage = async () => {
    const userId = corporateSession.get('userId');
    if (!userId) return;
    try {
      let res = await fetch(`/api/garage/user/${userId}/enterprise`);
      if (!res.ok) {
        res = await fetch(`/api/garage/user/${userId}?registryType=ENTERPRISE`);
      }
      if (!res.ok) {
        res = await fetch(`/api/garage/user/${userId}`);
      }
      if (res.ok) {
        const items = await res.json();
        const enterpriseOnly = items.filter(
          (i) => !i.registryType || i.registryType === 'ENTERPRISE'
        );
        setGarage(enterpriseOnly.length > 0 ? enterpriseOnly : items);
      }
    } catch (e) { console.error(e); }
  };

  const fetchCorporateData = async () => {
    const userId = corporateSession.get('userId');
    if (!userId) return;
    try {
      const [dashRes, delayRes, esgRes, teamRes] = await Promise.all([
        fetch(`/api/corporate/${userId}/dashboard`),
        fetch(`/api/corporate/${userId}/delays`),
        fetch(`/api/corporate/${userId}/esg`),
        fetch(`/api/corporate/${userId}/team`),
      ]);
      if (dashRes.ok) setCorpDashboard(await dashRes.json());
      if (delayRes.ok) setDelays(await delayRes.json());
      if (esgRes.ok) setEsgReport(await esgRes.json());
      if (teamRes.ok) setTeamMembers(await teamRes.json());
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    const userId = corporateSession.get('userId');
    if (userId) await fetch(`/api/auth/logout/${userId}`, { method: 'POST' });
    corporateSession.clear();
    navigate('/corporate/login');
  };

  const compressImage = (file, maxWidth = 800, quality = 0.6) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        if (h > maxWidth) { w = (maxWidth / h) * w; h = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (ticketData.photos.length + files.length > 3) {
      alert("You can upload a maximum of 3 photos.");
      return;
    }
    for (const file of files) {
      const compressed = await compressImage(file);
      setTicketData(prev => ({ ...prev, photos: [...prev.photos, compressed] }));
    }
  };

  const isStepValid = (step) => {
    if (step === 1) return !!ticketData.category;
    if (step === 2) return !!ticketData.product && (ticketData.product !== 'Other' || ticketData.otherProduct.trim().length >= 2);
    if (step === 3) {
      const hasBrand = !!ticketData.brand && (ticketData.brand !== 'Other' || ticketData.otherBrand.trim().length >= 2);
      const hasIssue = ticketData.issue.trim().length >= 5;
      const isYearValid = ticketData.year && parseInt(ticketData.year) >= 2000 && parseInt(ticketData.year) <= new Date().getFullYear();
      const isModelValid = ticketData.model && ticketData.model.trim().length >= 2;
      return hasBrand && hasIssue && isYearValid && isModelValid;
    }
    if (step === 4) return ticketData.photos.length > 0;
    return false;
  };

  const isGarageValid = () => {
    const model = (assetItem.model || '').trim();
    const year = parseInt(assetItem.year, 10);
    return !!assetItem.category &&
           !!assetItem.product &&
           !!assetItem.brand &&
           model.length >= 2 &&
           !Number.isNaN(year) &&
           year >= 2000 &&
           year <= new Date().getFullYear();
  };

  const submitTicket = async () => {
    const userId = corporateSession.get('userId');
    // --- ENTERPRISE CONCURRENCY GUARD (B2B: max 5 active, same category OK) ---
    const curActive = tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    if (curActive.length >= 5) {
      alert('Your enterprise account has reached the maximum of 5 concurrent active work orders. Please resolve or cancel one before dispatching another.');
      return;
    }
    try {
      // Get any available shop
      const shopRes = await fetch('/api/shop/all');
      const shops = await shopRes.json();
      if (!shops?.length) throw new Error('No shops available in the system. Please contact admin.');
      
      const finalProduct = ticketData.product === 'Other' ? ticketData.otherProduct : ticketData.product;
      const finalBrand = ticketData.brand === 'Other' ? ticketData.otherBrand : ticketData.brand;

      const payload = {
        customerId: userId, 
        shopId: shops[0].shopId,
        ticketChannel: 'ENTERPRISE',
        applianceCategory: ticketData.category, 
        applianceBrand: finalBrand,
        applianceProduct: finalProduct,
        applianceModel: ticketData.model || 'N/A',
        purchaseYear: parseInt(ticketData.year) || null,
        issueDescription: `[Enterprise SLA] ${ticketData.issue || 'General service request'}`,
        issuePhotos: ticketData.photos.length > 0 ? ticketData.photos : [],
        customerAddress: ticketData.address || 'Auto-detected',
        customerLat: ticketData.lat || 13.0827, 
        customerLon: ticketData.lon || 80.2707
      };

      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || errData?.error || `Server error: ${res.status}`);
      }
      await fetchTickets();
      setShowBook(false); setBookStep(1); setTab('work_orders');
      setTicketData({ category: '', product: '', otherProduct: '', brand: '', otherBrand: '', model: '', year: '', issue: '', photos: [], locationType: 'auto', address: '', lat: null, lon: null });
    } catch (e) { alert(e.message); }
  };

  const cancelTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to cancel this SLA dispatch? A fine may apply if cancelled after 10 minutes.")) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/cancel`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error("Failed to cancel ticket");
      await fetchTickets();
    } catch (e) { alert(e.message); }
  };

  const registerAsset = async () => {
    const userId = corporateSession.get('userId');
    if (!userId) {
      alert('Session expired. Please log in again.');
      navigate('/corporate/login');
      return;
    }
    const snapshot = { ...assetItem };
    const payload = {
      userId,
      category: snapshot.category,
      product: snapshot.product,
      brand: snapshot.brand || 'Unknown',
      model: (snapshot.model || '').trim(),
      purchaseYear: snapshot.year ? parseInt(snapshot.year, 10) : null,
      photoBase64: snapshot.photo || null,
      registryType: 'ENTERPRISE',
    };
    try {
      const res = await fetch('/api/garage/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || `Registration failed (${res.status})`);
      }
      await fetchGarage();
      fetchCorporateData();
      setShowGarageModal(false);
      setTab('assets');
      setAssetItem({ category: '', product: '', brand: '', model: '', year: '', photo: null });
      alert('Asset registered successfully.');
      try {
        const intelRes = await fetch('/api/corporate/asset-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: snapshot.category,
            product: snapshot.product,
            brand: snapshot.brand,
            purchaseYear: snapshot.year ? parseInt(snapshot.year, 10) : null,
          }),
        });
        if (intelRes.ok) setAssetIntel(await intelRes.json());
      } catch (_) {}
    } catch (e) { alert(e.message); }
  };

  const submitQuickMaintenance = async () => {
    const userId = corporateSession.get('userId');
    try {
      const shopRes = await fetch('/api/shop/all');
      const shops = await shopRes.json();
      if (!shops?.length) throw new Error('No service partners found');

      const payload = {
        customerId: userId, 
        shopId: shops[0].shopId,
        ticketChannel: 'ENTERPRISE',
        applianceCategory: selectedAsset.category, 
        applianceBrand: selectedAsset.brand,
        applianceProduct: selectedAsset.product,
        applianceModel: selectedAsset.model,
        purchaseYear: selectedAsset.purchaseYear,
        issueDescription: `[Enterprise SLA] ${ticketData.issue || 'Priority work order'}`,
        issuePhotos: ticketData.photos,
        customerAddress: profile.hqAddress || 'Corporate HQ',
        customerLat: 13.0827, customerLon: 80.2707
      };

      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to open work order');
      }
      
      await fetchTickets();
      setShowQuickBook(false);
      setTicketData({ ...ticketData, issue: '', photos: [] });
    } catch (e) { alert(e.message); }
  };

  const deleteGarageAppliance = async (garageId) => {
    try {
      await fetch(`/api/garage/${garageId}`, { method: 'DELETE' });
      await fetchGarage();
    } catch (e) { alert("Failed to delete."); }
  };

  const activeTickets = tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'DISPUTED');
  const totalAssets = corpDashboard?.totalAssets ?? garage.length;
  const slaUptime = corpDashboard?.slaUptime ?? (totalAssets > 0 ? 99.8 : 0);
  const ledgerAmount = corpDashboard?.monthlyRetainer ? Number(corpDashboard.monthlyRetainer) : 0;
  const contract = corpDashboard?.contract;

  const inviteTeamMember = async () => {
    const userId = corporateSession.get('userId');
    if (!inviteForm.fullName || !inviteForm.email) return alert('Name and email required');
    try {
      const res = await fetch(`/api/corporate/${userId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });
      if (res.ok) {
        setInviteForm({ fullName: '', email: '', role: 'Dispatcher' });
        fetchCorporateData();
      }
    } catch (e) { alert('Failed to invite member'); }
  };

  const scheduleEsgPickup = async () => {
    const userId = corporateSession.get('userId');
    try {
      const res = await fetch(`/api/corporate/${userId}/esg/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wasteType: esgWasteType, estimatedKg: 50 }),
      });
      if (res.ok) {
        alert('Certified e-waste pickup scheduled.');
        fetchCorporateData();
      }
    } catch (e) { alert('Failed to schedule pickup'); }
  };

  const SidebarItem = ({ icon: Icon, label, id }) => (
    <div onClick={() => { setTab(id); setShowBook(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, cursor: 'pointer', background: tab === id && !showBook ? 'rgba(16,185,129,0.1)' : 'transparent', color: tab === id && !showBook ? '#10B981' : '#94A3B8', borderLeft: tab === id && !showBook ? '3px solid #10B981' : '3px solid transparent', transition: 'all 0.2s', fontWeight: tab === id && !showBook ? 700 : 500 }}>
      <Icon size={20} /> {label}
    </div>
  );

  const selectedCategoryDetails = Object.values(CATEGORY_DETAILS).find(c => c.name === ticketData.category);

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", display: 'flex' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: 280, background: '#1E293B', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, zIndex: 40 }}>
        <div style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #10B981, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
            <Building2 size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px', color: '#fff' }}>FixSwap <span style={{ color: '#10B981' }}>B2B</span></div>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Enterprise Hub</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          <div style={{ color: '#64748B', fontSize: 12, fontWeight: 700, padding: '16px 20px 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Operations</div>
          <SidebarItem icon={Activity} label="Enterprise Overview" id="overview" />
          <SidebarItem icon={Truck} label="Active Work Orders" id="work_orders" />
          
          <div 
            onClick={() => { if (activeTickets.length < 5) setShowBook(true); }} 
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 12, cursor: activeTickets.length >= 5 ? 'not-allowed' : 'pointer', background: activeTickets.length >= 5 ? '#0B1120' : showBook ? 'linear-gradient(135deg, #10B981, #06B6D4)' : '#0B1120', color: activeTickets.length >= 5 ? '#64748B' : '#fff', border: '1px solid rgba(255,255,255,0.1)', marginTop: 8, transition: 'all 0.2s', fontWeight: 800, opacity: activeTickets.length >= 5 ? 0.5 : 1 }}>
            <Plus size={20} />
            {activeTickets.length >= 5 ? '5/5 Orders Active' : `Dispatch Repair${activeTickets.length > 0 ? ` (${activeTickets.length}/5)` : ''}`}
          </div>
          
          <div style={{ color: '#64748B', fontSize: 12, fontWeight: 700, padding: '32px 20px 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Management</div>
          <SidebarItem icon={Building2} label="Asset Registry" id="assets" />
          <SidebarItem icon={FileText} label="SLA Contracts" id="contracts" />
          <SidebarItem icon={Users} label="Team Access" id="team" />
          <SidebarItem icon={Clock} label="Delay Tracker" id="delay_tracker" />
          <SidebarItem icon={Leaf} label="ESG E-Waste Report" id="eco_waste" />
          <SidebarItem icon={Settings} label="Company Settings" id="settings" />
        </div>

        <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#94A3B8'}>
            <LogOut size={16} /> Corporate Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ marginLeft: 280, flex: 1, padding: '40px', maxWidth: 1400 }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-1px' }}>
              {tab === 'overview' && `${corporateSession.get('userName')} HQ`}
              {tab === 'work_orders' && "Active Work Orders"}
              {tab === 'assets' && "Enterprise Asset Registry"}
              {tab === 'contracts' && "Service Level Agreements"}
              {tab === 'team' && "Role Management"}
              {tab === 'delay_tracker' && "Business Delay Tracker"}
              {tab === 'eco_waste' && "ESG Sustainability Report"}
              {tab === 'settings' && "Corporate Settings"}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: 16 }}>Enterprise-grade zero downtime SLA monitoring.</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={20} color="#94A3B8" />
            </button>
          </div>
        </header>

        {tab === 'overview' && (
          <div>
            {/* KPI ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
              <div style={{ background: '#1E293B', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={20} color="#10B981" />
                  </div>
                  <span style={{ color: '#10B981', fontSize: 13, fontWeight: 700 }}>Active</span>
                </div>
                <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>{slaUptime}%</h3>
                <p style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>SLA Uptime Rating</p>
              </div>

              <div style={{ background: '#1E293B', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} color="#06B6D4" />
                  </div>
                </div>
                <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>{totalAssets}</h3>
                <p style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>Assets Under Contract</p>
              </div>

              <div style={{ background: '#1E293B', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={20} color="#F59E0B" />
                  </div>
                  {activeTickets.length > 0 && <span style={{ background: 'rgba(245,158,11,0.2)', color: '#FCD34D', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>Action Needed</span>}
                </div>
                <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>{activeTickets.length}</h3>
                <p style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>Active Asset Repairs</p>
              </div>

              <div style={{ background: '#1E293B', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#8B5CF6" />
                  </div>
                </div>
                <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>₹{ledgerAmount.toLocaleString()}</h3>
                <p style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>Monthly Retainer</p>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))', padding: 32, borderRadius: 24, border: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Emergency Dispatch Required?</h2>
                <p style={{ color: '#CBD5E1', fontSize: 16 }}>Instantly deploy a technician under your 30-minute SLA guarantee.</p>
              </div>
              <button onClick={() => setShowBook(true)} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}>
                <Truck size={20} /> Open New Work Order
              </button>
            </div>
          </div>
        )}

        {tab === 'work_orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Enterprise Capacity Bar */}
            <div style={{ background: '#1E293B', borderRadius: 16, padding: '16px 24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Zap size={18} color="#10B981" />
                <span style={{ color: '#fff', fontWeight: 700 }}>Dispatch Capacity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ width: 28, height: 10, borderRadius: 4, background: i < activeTickets.length ? '#10B981' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <span style={{ color: '#94A3B8', fontSize: 14 }}>{activeTickets.length}/5 Enterprise Slots</span>
                {activeTickets.length < 5 && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>{5 - activeTickets.length} Dispatchers Available</span>}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#10B981' }}>Loading enterprise work orders...</div>
            ) : activeTickets.length === 0 ? (
              <div style={{ background: '#1E293B', borderRadius: 20, padding: 80, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CheckCircle2 size={48} color="#10B981" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>All Assets Operational</h3>
                <p style={{ color: '#94A3B8' }}>Your enterprise has no active downtime events.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {activeTickets.map(ticket => (
                  <ActiveTicketTrackerCard
                    key={ticket.ticketId}
                    ticket={ticket}
                    variant="b2b"
                    onCancel={cancelTicket}
                    workerPickupOtpInput={workerPickupOtpInput}
                    setWorkerPickupOtpInput={setWorkerPickupOtpInput}
                    workerDeliveryOtpInput={workerDeliveryOtpInput}
                    setWorkerDeliveryOtpInput={setWorkerDeliveryOtpInput}
                    otpErrorMsg={otpErrorMsg}
                    onVerifyPickupOtp={handleVerifyWorkerPickupOtp}
                    onVerifyDeliveryOtp={handleVerifyWorkerDeliveryOtp}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ASSET REGISTRY (GARAGE) */}
        {tab === 'assets' && (
          <div>
            {assetIntel && (
              <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ color: '#10B981', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>AI Asset Intelligence • {assetIntel.modelVersion}</p>
                    <p style={{ color: '#fff', fontWeight: 700, margin: '0 0 4px' }}>{assetIntel.summary}</p>
                    <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>{assetIntel.maintenancePriority}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: assetIntel.riskTier === 'HIGH' ? '#EF4444' : assetIntel.riskTier === 'MEDIUM' ? '#F59E0B' : '#10B981' }}>{assetIntel.riskTier}</div>
                    <div style={{ color: '#64748B', fontSize: 12 }}>Risk {Math.round((assetIntel.riskScore || 0) * 100)}% • SLA {assetIntel.recommendedSlaMinutes}m</div>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Registered Commercial Assets</h2>
              <button onClick={() => setShowGarageModal(true)} style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid #10B981', padding: '10px 20px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={16} /> Register Asset
              </button>
            </div>
            
            {garage.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', background: '#1E293B', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Building2 size={48} color="#64748B" style={{marginBottom:16}}/>
                <h2 style={{color:'#fff', marginBottom: 8}}>Asset Registry is Empty</h2>
                <p style={{color:'#94A3B8'}}>Register your commercial equipment here for automated maintenance scheduling.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {garage.map(item => {
                  const isFull = activeTickets.length >= 5;
                  return (
                    <div 
                      key={item.garageId} 
                      onClick={() => { 
                        if (isFull) {
                          alert("Enterprise Dispatch Limit Reached: You already have 5 active work orders. Please complete or cancel one before initiating another.");
                          return;
                        }
                        setSelectedAsset(item); 
                        setShowQuickBook(true); 
                      }} 
                      style={{ 
                        background: '#1E293B', 
                        borderRadius: 20, 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        overflow: 'hidden', 
                        cursor: isFull ? 'not-allowed' : 'pointer', 
                        transition: 'all 0.2s', 
                        position: 'relative',
                        opacity: isFull ? 0.7 : 1
                      }} 
                      onMouseEnter={e => { if (!isFull) e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; }} 
                      onMouseLeave={e => { if (!isFull) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                    >
                    
                    {/* Asset Image / Banner */}
                    <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
                      {item.photoBase64 ? (
                        <img src={item.photoBase64} alt={item.product} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0B1120, #1E293B)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <Building2 size={40} color="rgba(16,185,129,0.3)" />
                          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>No Image</span>
                        </div>
                      )}
                      {/* Category Badge */}
                      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: '#10B981', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {item.category}
                      </div>
                    </div>

                    <div style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{item.product}</h3>
                          <p style={{ color: '#94A3B8', fontSize: 13 }}>{item.brand}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteGarageAppliance(item.garageId); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Trash2 size={16} /></button>
                      </div>

                      {/* Model & Year Row */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        {item.model && <span style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>Model: {item.model}</span>}
                        {item.purchaseYear && <span style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>{item.purchaseYear}</span>}
                        <span style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>#{item.garageId?.substring(0,8)}</span>
                      </div>

                      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8, color: isFull ? '#64748B' : '#10B981', fontSize: 12, fontWeight: 700 }}>
                        <Zap size={14} /> {isFull ? 'Capacity Reached (5/5)' : 'Open Priority Work Order'}
                      </div>
                    </div>
                  </div>
                )})}

              </div>
            )}
          </div>
        )}

        {tab === 'contracts' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Active SLA Retainers</h2>
            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#0B1120', color: '#94A3B8', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '20px 24px', fontWeight: 700 }}>Contract ID</th>
                    <th style={{ padding: '20px 24px', fontWeight: 700 }}>SLA Level</th>
                    <th style={{ padding: '20px 24px', fontWeight: 700 }}>Response Guarantee</th>
                    <th style={{ padding: '20px 24px', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contract ? (
                    <tr>
                      <td style={{ padding: '20px 24px', color: '#fff', fontWeight: 600 }}>{contract.contractId?.toString().substring(0,8).toUpperCase()}</td>
                      <td style={{ padding: '20px 24px' }}><span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{contract.slaLevel}</span></td>
                      <td style={{ padding: '20px 24px', color: '#94A3B8' }}>{contract.responseGuarantee}</td>
                      <td style={{ padding: '20px 24px', color: '#fff' }}>{contract.status} • {contract.swapsUsedThisMonth}/{contract.includedSwapsPerMonth} swaps</td>
                    </tr>
                  ) : (
                    <tr><td colSpan={4} style={{ padding: 24, color: '#94A3B8' }}>No active SLA contract on file.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'team' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Corporate Access Roles</h2>
                <p style={{ color: '#94A3B8', fontSize: 14 }}>Manage which employees can create, dispatch, or view service tickets.</p>
              </div>
              <button style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={16} /> Invite Team Member
              </button>
            </div>

            {/* Permission Legend */}
            <div style={{ background: '#1E293B', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: '#fff', marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>Role Permission Matrix</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, auto)', gap: 0, fontSize: 13 }}>
                <div style={{ color: '#64748B', padding: '8px 16px 8px 0', fontWeight: 600 }}>Permission</div>
                {['HQ Admin', 'Dispatcher', 'Technician', 'Viewer'].map(r => (
                  <div key={r} style={{ color: '#94A3B8', padding: '8px 24px', fontWeight: 700, textAlign: 'center' }}>{r}</div>
                ))}
                {[
                  { label: 'Create Service Tickets', perms: [true, true, false, false] },
                  { label: 'Dispatch / Assign Technician', perms: [true, true, false, false] },
                  { label: 'Close / Resolve Tickets', perms: [true, true, true, false] },
                  { label: 'View All Tickets', perms: [true, true, true, true] },
                  { label: 'Manage SLA Contracts', perms: [true, false, false, false] },
                  { label: 'Register / Remove Assets', perms: [true, true, false, false] },
                  { label: 'Manage Team Members', perms: [true, false, false, false] },
                  { label: 'Company Settings', perms: [true, false, false, false] }
                ].map(({ label, perms }) => (
                  <>
                    <div key={label} style={{ color: '#fff', padding: '10px 16px 10px 0', fontSize: 13, borderTop: '1px solid rgba(255,255,255,0.04)' }}>{label}</div>
                    {perms.map((p, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '10px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        {p 
                          ? <CheckCircle2 size={18} color="#10B981" />
                          : <XCircle size={18} color="#374151" />}
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>

            {/* Team Members Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {teamMembers.map((member) => (
                <div key={member.memberId || member.email} style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: `1px solid ${member.isOwner ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #10B981' }}>
                        <User size={20} color="#10B981" />
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{member.fullName}</div>
                        <div style={{ color: '#64748B', fontSize: 12 }}>{member.email}</div>
                      </div>
                    </div>
                    {!member.isOwner && (
                      <button onClick={() => fetch(`/api/corporate/team/${member.memberId}`, { method: 'DELETE' }).then(() => fetchCorporateData())} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: member.role === 'HQ Admin' ? 'rgba(16,185,129,0.1)' : member.role === 'Dispatcher' ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)', color: member.role === 'HQ Admin' ? '#10B981' : member.role === 'Dispatcher' ? '#3B82F6' : '#94A3B8', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{member.role}</span>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#64748B' }}>
                      {member.canCreate && <span style={{ color: '#10B981' }}>Create</span>}
                      {member.canDispatch && <span style={{ color: '#3B82F6' }}>Dispatch</span>}
                      <span>View</span>
                    </div>
                  </div>
                </div>
              ))}
              <div onClick={inviteTeamMember} style={{ background: 'transparent', border: '2px dashed rgba(255,255,255,0.1)', padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 140 }}>
                <Plus size={24} color="#64748B" />
                <span style={{ color: '#64748B', fontSize: 14, fontWeight: 600 }}>Save invited member</span>
                <input placeholder="Name" value={inviteForm.fullName} onChange={e => setInviteForm({...inviteForm, fullName: e.target.value})} onClick={e => e.stopPropagation()} style={{ width: '90%', padding: 8, borderRadius: 8, background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <input placeholder="Email" value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} onClick={e => e.stopPropagation()} style={{ width: '90%', padding: 8, borderRadius: 8, background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
            </div>
          </div>
        )}

        {tab === 'delay_tracker' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Business Delay Implementation Group Tracker</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
              <div style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid rgba(239,68,68,0.2)' }}>
                <h4 style={{ color: '#94A3B8', fontSize: 13, textTransform: 'uppercase', marginBottom: 8 }}>SLA Breaches (This Month)</h4>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#EF4444' }}>{delays.length}</div>
              </div>
              <div style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: '#94A3B8', fontSize: 13, textTransform: 'uppercase', marginBottom: 8 }}>Active Work Orders</h4>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{activeTickets.length}</div>
              </div>
              <div style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: '#94A3B8', fontSize: 13, textTransform: 'uppercase', marginBottom: 8 }}>Enterprise Assets</h4>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{totalAssets}</div>
              </div>
            </div>
            
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Live Escalations</h3>
            {delays.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', background: '#1E293B', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <CheckCircle2 size={48} color="#10B981" style={{ marginBottom: 16 }} />
              <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>All Systems Nominal</h3>
              <p style={{ color: '#94A3B8' }}>There are no current SLA delays or escalations.</p>
            </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {delays.map(d => (
                  <div key={d.ticketId} style={{ background: '#1E293B', padding: 20, borderRadius: 16, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p style={{ color: '#fff', fontWeight: 800, margin: '0 0 4px' }}>{d.applianceProduct} • #{d.ticketShortId}</p>
                    <p style={{ color: '#F87171', fontSize: 13, margin: 0 }}>{d.message} ({d.minutesOpen} min open)</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'eco_waste' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #064E3B, #047857)', borderRadius: 24, padding: 40, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Corporate ESG & E-Waste Report</h2>
                <p style={{ color: '#A7F3D0', fontSize: 16, maxWidth: 500 }}>Track your enterprise carbon offset and schedule certified electronic waste recycling pickups.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px 32px', borderRadius: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#A7F3D0', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Total Waste Diverted</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{esgReport ? Number(esgReport.totalWasteDivertedKg).toLocaleString() : '0'} kg</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              <div style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginBottom: 20 }}>Schedule E-Waste Pickup</h3>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  {['Laptops & IT', 'HVAC / Heavy', 'Batteries / UPS'].map(t => (
                    <button key={t} type="button" onClick={() => setEsgWasteType(t)} style={{ flex: 1, padding: 16, background: '#0B1120', border: esgWasteType === t ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)', color: esgWasteType === t ? '#10B981' : '#fff', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>{t}</button>
                  ))}
                </div>
                <button type="button" onClick={scheduleEsgPickup} style={{ width: '100%', background: '#10B981', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Request Certified Disposal</button>
              </div>
              <div style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', marginBottom: 16 }}>ESG Certificates</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0B1120', padding: 16, borderRadius: 12, marginBottom: 8 }}>
                  <FileText size={20} color="#10B981" />
                  <div style={{ flex: 1 }}><div style={{ color: '#fff', fontSize: 14 }}>Q1 Disposal Cert</div><div style={{ color: '#64748B', fontSize: 12 }}>ISO 14001</div></div>
                  <button style={{ background: 'transparent', color: '#10B981', border: 'none', fontWeight: 700, cursor: 'pointer' }}>View</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'settings' && (
          <div style={{ display: 'flex', gap: 32, maxWidth: 1000 }}>
            {/* Sidebar Navigation */}
            <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'account', label: 'Corporate HQ Info', icon: Building2 },
                { id: 'addresses', label: 'Branch Locations', icon: MapPin },
                { id: 'security', label: 'Security & Access', icon: CreditCard },
                { id: 'notifications', label: 'Alert Preferences', icon: Zap }
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setProfileSubTab(item.id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', 
                    padding: '16px 20px', borderRadius: 16, cursor: 'pointer',
                    background: profileSubTab === item.id ? 'rgba(16,185,129,0.1)' : 'transparent',
                    border: 'none', color: profileSubTab === item.id ? '#10B981' : '#94A3B8',
                    fontWeight: 700, fontSize: 15, transition: 'all 0.2s', textAlign: 'left'
                  }}>
                  <item.icon size={20} /> {item.label}
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, background: '#1E293B', borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.05)' }}>
              
              {/* Account Tab */}
              {profileSubTab === 'account' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div onClick={() => { const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange=async (e)=>{ const file=e.target.files[0]; if(file){ const compressed=await compressImage(file); setProfile({...profile, profilePhoto: compressed}); } }; input.click(); }} style={{ width: 100, height: 100, borderRadius: '20%', background: profile.profilePhoto ? `url("${profile.profilePhoto}") center/cover` : '#0B1120', border: '3px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                      {!profile.profilePhoto && <Building2 size={40} color="#10B981" />}
                      <div style={{ position: 'absolute', bottom: -5, right: -5, background: '#10B981', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #1E293B' }}>
                        <Camera size={14} color="#fff" />
                      </div>
                    </div>
                    <div>
                      <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{profile.fullName || 'Corporate User'}</h2>
                      <p style={{ color: '#94A3B8', fontSize: 14 }}>{profile.email} • Enterprise Admin</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Company Name</label>
                      <input type="text" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>HQ Contact Number</label>
                      <input type="text" value={profile.phoneNumber} onChange={e => setProfile({...profile, phoneNumber: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {profileSubTab === 'addresses' && (
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={24} color="#10B981" /> Corporate Headquarters</h3>
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Primary HQ Address</label>
                    <textarea placeholder="e.g. Enterprise Tower, Tech Park..." value={profile.hqAddress} onChange={e => setProfile({...profile, hqAddress: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', minHeight: 120, resize: 'none' }} />
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {profileSubTab === 'security' && (
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={24} color="#10B981" /> Security & Access Control</h3>
                  <div style={{ background: '#0B1120', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Update Admin Password</label>
                    <input type="password" placeholder="Enter new password" value={profile.newPassword || ''} onChange={e => setProfile({...profile, newPassword: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', marginBottom: 8 }} />
                    <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>This password is used for enterprise dashboard access.</p>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {profileSubTab === 'notifications' && (
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={24} color="#10B981" /> SLA Alert Preferences</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0B1120', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Priority SMS Alerts</div>
                        <div style={{ fontSize: 13, color: '#94A3B8' }}>Receive immediate SMS when an SLA is breached or near expiry.</div>
                      </div>
                      <button onClick={() => setProfile({...profile, smsNotifications: !profile.smsNotifications})} style={{ width: 50, height: 28, borderRadius: 100, background: profile.smsNotifications ? '#10B981' : '#1E293B', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 2, left: profile.smsNotifications ? 24 : 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0B1120', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>WhatsApp Operations Sync</div>
                        <div style={{ fontSize: 13, color: '#94A3B8' }}>Receive daily automated reports and technician ETAs via WhatsApp.</div>
                      </div>
                      <button onClick={() => setProfile({...profile, whatsappNotifications: !profile.whatsappNotifications})} style={{ width: 50, height: 28, borderRadius: 100, background: profile.whatsappNotifications ? '#10B981' : '#1E293B', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 2, left: profile.whatsappNotifications ? 24 : 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={updateProfile} disabled={savingProfile} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '16px 40px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', opacity: savingProfile ? 0.6 : 1 }}>
                  {savingProfile ? 'Saving Changes...' : 'Save Corporate Settings'}
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* ADD ASSET MODAL */}
      {showGarageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: '#1E293B', width: '100%', maxWidth: 500, borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 24 }}>Register Commercial Asset</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <select value={assetItem.category} onChange={e => setAssetItem({...assetItem, category: e.target.value, product: '', brand: ''})} style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff' }}>
                <option value="">Select Asset Category</option>
                {Object.values(CATEGORY_DETAILS).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>

              {assetItem.category && (() => {
                const cat = Object.values(CATEGORY_DETAILS).find(c => c.name === assetItem.category);
                return cat ? (
                  <>
                    <select value={assetItem.product} onChange={e => setAssetItem({...assetItem, product: e.target.value})} style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff' }}>
                      <option value="">Select Product Type</option>
                      {cat.products.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={assetItem.brand} onChange={e => setAssetItem({...assetItem, brand: e.target.value})} style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff' }}>
                      <option value="">Select Brand / Manufacturer</option>
                      {cat.brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </>
                ) : null;
              })()}

              <input type="text" placeholder="Asset Serial / Model Number (min. 2 chars)" value={assetItem.model} onChange={e => setAssetItem({ ...assetItem, model: e.target.value })} style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff' }} />
              <div>
                <input type="number" placeholder="Installation Year (2000 - present)" value={assetItem.year} onChange={e => setAssetItem({ ...assetItem, year: e.target.value })} style={{ background: '#0B1120', border: `1px solid ${assetItem.year && (parseInt(assetItem.year) < 2000 || parseInt(assetItem.year) > new Date().getFullYear()) ? '#EF4444' : 'rgba(255,255,255,0.1)'}`, padding: 16, borderRadius: 12, color: '#fff', width: '100%' }} />
                {assetItem.year && parseInt(assetItem.year) < 2000 && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>Year must be 2000 or later.</p>}
                {assetItem.year && parseInt(assetItem.year) > new Date().getFullYear() && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>Year cannot be in the future.</p>}
              </div>

              {/* Asset Photo Upload */}
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '1px' }}>Asset Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  id="asset-photo-upload"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const compressed = await compressImage(file, 600, 0.7);
                      setAssetItem(prev => ({ ...prev, photo: compressed }));
                    }
                  }}
                />
                {assetItem.photo ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={assetItem.photo}
                      alt="Asset preview"
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, border: '2px solid #10B981', display: 'block' }}
                    />
                    <button
                      onClick={() => setAssetItem(prev => ({ ...prev, photo: null }))}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >✕</button>
                    <button
                      onClick={() => document.getElementById('asset-photo-upload').click()}
                      style={{ position: 'absolute', bottom: 8, right: 8, background: '#10B981', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >Change</button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById('asset-photo-upload').click()}
                    style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 12, height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#10B981'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                  >
                    <UploadCloud size={28} color="#64748B" />
                    <span style={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>Click to upload asset photo</span>
                    <span style={{ color: '#475569', fontSize: 11 }}>JPG, PNG, WEBP — max compressed to 600px</span>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => { setShowGarageModal(false); setAssetItem({ category: '', product: '', brand: '', model: '', year: '', photo: null }); }} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 16, borderRadius: 12, cursor: 'pointer' }}>Cancel</button>
                <button onClick={registerAsset} disabled={!isGarageValid()} style={{ flex: 1, background: isGarageValid() ? 'linear-gradient(135deg, #10B981, #059669)' : '#1E293B', border: 'none', color: isGarageValid() ? '#fff' : '#64748B', padding: 16, borderRadius: 12, cursor: isGarageValid() ? 'pointer' : 'not-allowed', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Building2 size={16} /> Register Asset
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* QUICK WORK ORDER MODAL */}
      {showQuickBook && selectedAsset && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 20 }}>
          <div style={{ background: '#1E293B', width: '100%', maxWidth: 500, borderRadius: 24, padding: 32, border: '1px solid #10B981', boxShadow: '0 0 50px rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>Priority Work Order</h2>
                <p style={{ color: '#94A3B8', fontSize: 14 }}>Asset: {selectedAsset.product}</p>
              </div>
              <button onClick={() => setShowQuickBook(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#0B1120', borderRadius: 16, padding: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 12, background: selectedAsset.photoBase64 ? `url("${selectedAsset.photoBase64}") center/cover` : 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedAsset.brand} {selectedAsset.product}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Asset ID: {selectedAsset.garageId.substring(0,8).toUpperCase()}</div>
              </div>
            </div>

            <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Issue Details</label>
            <textarea placeholder="Describe the downtime event..." value={ticketData.issue} onChange={e => setTicketData({ ...ticketData, issue: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', minHeight: 120, resize: 'none', boxSizing: 'border-box', marginBottom: 24 }} />

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowQuickBook(false)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 16, borderRadius: 16, cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={submitQuickMaintenance} disabled={!ticketData.issue.trim()} style={{ flex: 2, background: 'linear-gradient(135deg, #10B981, #06B6D4)', border: 'none', color: '#fff', padding: 16, borderRadius: 16, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Zap size={18} /> Dispatch Tech Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADVANCED MULTI-STEP BOOKING WIZARD */}
      {showBook && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: '#1E293B', width: '100%', maxWidth: 700, borderRadius: 24, position: 'relative', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 64px rgba(0,0,0,0.6)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0B1120' }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>Enterprise Dispatch</h2>
                <p style={{ color: '#94A3B8', fontSize: 14 }}>Step {bookStep} of 5: {['Select Asset Category', 'Select Equipment Type', 'Asset Specifications', 'Upload Photo Evidence', 'Location Authorization'][bookStep-1]}</p>
              </div>
              <button onClick={() => { setShowBook(false); setBookStep(1); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 4, padding: '0 32px', background: '#0B1120' }}>
              {[1,2,3,4,5].map(step => (
                <div key={step} style={{ height: 4, flex: 1, background: bookStep >= step ? '#10B981' : 'rgba(255,255,255,0.1)', borderRadius: '0 0 4px 4px', transition: 'background 0.3s' }} />
              ))}
            </div>

            <div style={{ padding: 32, overflowY: 'auto', flex: 1 }}>
              {/* STEP 1: CATEGORY (LIST WITH AVATAR) */}
              {bookStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Object.values(CATEGORY_DETAILS).map(c => (
                    <div key={c.id} onClick={() => setTicketData({ ...ticketData, category: c.name, product: '', brand: '' })} style={{ borderRadius: 16, border: `2px solid ${ticketData.category === c.name ? '#10B981' : 'rgba(255,255,255,0.05)'}`, background: ticketData.category === c.name ? 'rgba(16,185,129,0.1)' : '#0B1120', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20, padding: 20, transition: 'all 0.2s' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundImage: `url("${c.image}")`, backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid rgba(255,255,255,0.1)' }} />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{c.name}</h3>
                        <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>{c.products.slice(0,3).join(', ')}...</p>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${ticketData.category === c.name ? '#10B981' : '#64748B'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ticketData.category === c.name && <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: EXHAUSTIVE SUB-PRODUCT SELECTION */}
              {bookStep === 2 && selectedCategoryDetails && (
                <div>
                  <h3 style={{ color: '#fff', marginBottom: 20 }}>Select Equipment Type</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {selectedCategoryDetails.products.map(prod => (
                      <div key={prod} onClick={() => setTicketData({ ...ticketData, product: prod })} style={{ padding: '16px 20px', borderRadius: 12, border: `2px solid ${ticketData.product === prod ? '#10B981' : 'rgba(255,255,255,0.05)'}`, background: ticketData.product === prod ? 'rgba(16,185,129,0.1)' : '#0B1120', cursor: 'pointer', color: '#fff', fontWeight: 600, fontSize: 14 }}>
                        {prod}
                      </div>
                    ))}
                  </div>
                  {ticketData.product === 'Other' && (
                    <div style={{ marginTop: 16 }}>
                      <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Specify Equipment Type</label>
                      <input type="text" placeholder="Enter equipment name..." value={ticketData.otherProduct} onChange={e => setTicketData({ ...ticketData, otherProduct: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: DETAILS (DYNAMIC BRANDS) */}
              {bookStep === 3 && selectedCategoryDetails && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Manufacturer Brand</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedCategoryDetails.brands.map(brand => (
                        <button key={brand} onClick={() => setTicketData({ ...ticketData, brand })} style={{ padding: '10px 16px', borderRadius: 100, border: `1px solid ${ticketData.brand === brand ? '#10B981' : 'rgba(255,255,255,0.1)'}`, background: ticketData.brand === brand ? '#10B981' : '#0B1120', color: ticketData.brand === brand ? '#fff' : '#94A3B8', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                          {brand}
                        </button>
                      ))}
                    </div>
                    {ticketData.brand === 'Other' && (
                      <input type="text" placeholder="Enter brand name..." value={ticketData.otherBrand} onChange={e => setTicketData({ ...ticketData, otherBrand: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box', marginTop: 12 }} />
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Asset / Model Number</label>
                      <input type="text" placeholder="Model No." value={ticketData.model} onChange={e => setTicketData({ ...ticketData, model: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Install Year</label>
                      <input type="number" placeholder="YYYY" value={ticketData.year} onChange={e => setTicketData({ ...ticketData, year: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Failure / Diagnostic Description</label>
                    <textarea placeholder="Describe the failure codes, alerts, or symptoms..." value={ticketData.issue} onChange={e => setTicketData({ ...ticketData, issue: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', minHeight: 100, resize: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              )}

              {/* STEP 4: MULTI-PHOTO UPLOAD */}
              {bookStep === 4 && (
                <div>
                  <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: 16, borderRadius: 12, marginBottom: 24 }}>
                    <p style={{ color: '#fff', fontSize: 14, margin: 0 }}><strong>SLA Requirement:</strong> Please upload up to 3 photos of the asset (e.g., The entire unit, the damaged component, and the manufacturer data plate).</p>
                  </div>
                  
                  <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {ticketData.photos.map((photoStr, idx) => (
                      <div key={idx} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #10B981', height: 160 }}>
                        <img src={photoStr} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => setTicketData({...ticketData, photos: ticketData.photos.filter((_, i) => i !== idx)})} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                    
                    {ticketData.photos.length < 3 && (
                      <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 12, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#0B1120', transition: 'border 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#10B981'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}>
                        <UploadCloud size={32} color="#64748B" style={{ marginBottom: 8 }} />
                        <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>Add Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: LOCATION / ADDRESS */}
              {bookStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ color: '#fff', margin: 0 }}>Authorize Dispatch Location</h3>
                  <LocationPicker
                    accentColor="#10B981"
                    onLocationConfirm={({ lat, lon, address }) => {
                      setTicketData(prev => ({ ...prev, locationType: 'auto', address, lat, lon }));
                    }}
                  />
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 16 }}>Where should we send the technician?</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      
                      {/* Disable Corporate HQ for Automotive */}
                      <button 
                        onClick={() => setTicketData({ ...ticketData, locationType: 'profile' })} 
                        disabled={ticketData.category === 'Corporate Fleet & Mobility'}
                        style={{ flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${ticketData.locationType === 'profile' ? '#10B981' : 'rgba(255,255,255,0.05)'}`, background: ticketData.locationType === 'profile' ? 'rgba(16,185,129,0.1)' : '#0B1120', color: ticketData.category === 'Corporate Fleet & Mobility' ? '#64748B' : '#fff', cursor: ticketData.category === 'Corporate Fleet & Mobility' ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                      >
                        Use Corporate HQ
                        {ticketData.category === 'Corporate Fleet & Mobility' && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 4 }}>Disabled for Fleet</div>}
                      </button>
                      
                      <button onClick={() => setTicketData({ ...ticketData, locationType: 'auto' })} style={{ flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${ticketData.locationType === 'auto' ? '#10B981' : 'rgba(255,255,255,0.05)'}`, background: ticketData.locationType === 'auto' ? 'rgba(16,185,129,0.1)' : '#0B1120', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Auto-Detect (Current Location)</button>
                      <button onClick={() => setTicketData({ ...ticketData, locationType: 'manual' })} style={{ flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${ticketData.locationType === 'manual' ? '#10B981' : 'rgba(255,255,255,0.05)'}`, background: ticketData.locationType === 'manual' ? 'rgba(16,185,129,0.1)' : '#0B1120', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Enter Manually</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', background: '#0B1120' }}>
              <button onClick={() => setBookStep(Math.max(1, bookStep - 1))} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', visibility: bookStep === 1 ? 'hidden' : 'visible' }}>Back</button>
              
              {bookStep < 5 ? (
                <button 
                  onClick={() => setBookStep(bookStep + 1)} 
                  disabled={!isStepValid(bookStep)}
                  style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', opacity: 1 }}
                >
                  Next Step
                </button>
              ) : (
                <button 
                  onClick={submitTicket} 
                  disabled={ticketData.locationType === 'manual' && !ticketData.address.trim()} 
                  style={{ background: (ticketData.locationType === 'auto' || ticketData.address.trim()) ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 12, fontWeight: 800, cursor: (ticketData.locationType === 'auto' || ticketData.address.trim()) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Truck size={18} /> Authorize SLA Dispatch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
