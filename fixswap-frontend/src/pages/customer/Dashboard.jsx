import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Home, Bell, Truck, CheckCircle2, Clock, MapPin, LogOut, Zap, Fan, Droplet, Monitor, Camera, Image as ImageIcon, CreditCard, User, UploadCloud, Map as MapIcon, XCircle, FileText, AlertTriangle, Box, Plus, Trash2 } from 'lucide-react';
import LocationPicker from '../../components/LocationPicker';
import { customerSession } from '../../auth/session';
import {
  getTrackerSteps,
  getStepIndex,
  getStatusBanner,
  showsPickupOtpSection,
  showsDeliveryOtpSection,
  isDeliveryPartnerTicket,
} from '../../utils/ticketTracker';
import InvoiceModal from '../../components/InvoiceModal';

const CATEGORY_DETAILS = {
  appliances: {
    id: 'appliances',
    name: 'Large Appliances',
    image: '/images/cat_appliances.png',
    products: ['Refrigerator (French Door)', 'Refrigerator (Side-by-Side)', 'Refrigerator (Top/Bottom)', 'Chest Freezer', 'Washing Machine (Front Load)', 'Washing Machine (Top Load)', 'Dryer', 'Other'],
    brands: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Bosch', 'KitchenAid', 'Frigidaire', 'Maytag', 'Electrolux', 'Haier', 'Panasonic', 'Godrej', 'Voltas', 'Other']
  },
  hvac: {
    id: 'hvac',
    name: 'HVAC Systems',
    image: '/images/cat_hvac.png',
    products: ['Split Air Conditioner', 'Window Air Conditioner', 'Central AC Unit', 'Heat Pump', 'Furnace', 'Boiler', 'Thermostat', 'Ventilation Fan', 'Air Purifier', 'Other'],
    brands: ['Daikin', 'Carrier', 'Voltas', 'Blue Star', 'Hitachi', 'LG', 'Mitsubishi', 'O General', 'Trane', 'Lennox', 'Other']
  },
  electrical: {
    id: 'electrical',
    name: 'Home Electricals',
    image: '/images/cat_electrical.png',
    products: ['Lighting Fixture', 'Ceiling Fan', 'Exhaust Fan', 'Tube Light / Bulb Fitting', 'Switchboard / Outlets', 'Main Breaker Panel', 'Inverter / UPS', 'Smart Home Hub', 'Security Camera', 'Other'],
    brands: ['Philips', 'Crompton', 'Havells', 'Orient', 'Legrand', 'Anchor', 'Schneider', 'Luminous', 'Microtek', 'Other']
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen Essentials',
    image: '/images/cat_appliances.png',
    products: ['Mixer Grinder', 'Wet Grinder', 'Food Processor', 'Gas Stove', 'Induction Stove', 'Microwave Oven', 'Dishwasher', 'Electric Kettle', 'Water Purifier (RO)', 'Other'],
    brands: ['Preethi', 'Butterfly', 'Prestige', 'Pigeon', 'Bajaj', 'Philips', 'Bosch', 'Kent', 'Aquaguard', 'Faber', 'Other']
  },
  electronics: {
    id: 'electronics',
    name: 'Smart Electronics',
    image: '/images/cat_electrical.png',
    products: ['Smartphone', 'Laptop', 'Tablet / iPad', 'Smartwatch', 'Desktop PC', 'Monitor', 'Gaming Console', 'Smart TV', 'Other'],
    brands: ['Apple', 'Samsung', 'OnePlus', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Sony', 'Microsoft', 'Xiaomi', 'Other']
  },
  automotive: {
    id: 'automotive',
    name: 'Automotive & Mobility',
    image: '/images/cat_appliances.png',
    products: ['Car (Sedan/SUV/Hatchback)', 'Motorcycle / Bike', 'Scooter', 'EV Bike', 'Electric Car', 'Bicycle / Cycle', 'Electric Motor / Pump', 'Other'],
    brands: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Royal Enfield', 'TVS', 'Bajaj', 'Ather', 'Ola Electric', 'Hero', 'Other']
  }
};

const LiveArrivalTimer = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = React.useState('30:00');

  React.useEffect(() => {
    const update = () => {
      const created = new Date(createdAt);
      const diff = (created.getTime() + 30 * 60000) - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('Arriving');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return <span style={{ color: '#06B6D4' }}>{timeLeft}</span>;
};

const CancellationTimer = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = React.useState('');
  const [isFine, setIsFine] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      const created = new Date(createdAt);
      const diff = (created.getTime() + 10 * 60000) - new Date().getTime();
      if (diff <= 0) {
        setIsFine(true);
        setTimeLeft('');
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
        setIsFine(false);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (isFine) return <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>⚠️ Cancellation fine now applies (₹150)</div>;
  return <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Free cancellation ends in: {timeLeft}</div>;
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('home');
  const [tickets, setTickets] = useState([]);
  const [garage, setGarage] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Booking State
  const [showBook, setShowBook] = useState(false);
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [selectedGarageItem, setSelectedGarageItem] = useState(null);
  const [bookStep, setBookStep] = useState(1);
  const [ticketData, setTicketData] = useState({ 
    category: '', product: '', otherProduct: '', brand: '', otherBrand: '', 
    model: '', year: '', issue: '', photos: [], 
    locationType: 'auto', address: '', lat: null, lon: null, selectedShopId: null 
  });
  const [nearbyShops, setNearbyShops] = useState([]);
  const [fetchingShops, setFetchingShops] = useState(false);
  const fileInputRef = useRef(null);
  const garageFileInputRef = useRef(null);

  // Household garage (B2C only — not shared with B2B enterprise registry)
  const [showGarageModal, setShowGarageModal] = useState(false);
  const [garageItem, setGarageItem] = useState({ category: '', product: '', brand: '', model: '', year: '', photo: null });

  // Profile State
  const [profile, setProfile] = useState(() => ({
    fullName: customerSession.get('userName') || '',
    email: customerSession.get('userEmail') || '',
    phoneNumber: '',
    hqAddress: '',
    profilePhoto: '',
    smsNotifications: true,
    whatsappNotifications: true,
  }));
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState('account');
  const [originalProfile, setOriginalProfile] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [workerPickupOtpInput, setWorkerPickupOtpInput] = useState('');
  const [workerDeliveryOtpInput, setWorkerDeliveryOtpInput] = useState('');
  const [otpErrorMsg, setOtpErrorMsg] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const openInvoice = async (ticketId) => {
    setLoadingInvoice(true);
    try {
      let res = await fetch(`/api/invoices/ticket/${ticketId}`);
      if (!res.ok) {
        res = await fetch(`/api/invoices/ticket/${ticketId}/generate`, { method: 'POST' });
      }
      if (res.ok) setInvoiceModal(await res.json());
      else alert('Could not load invoice.');
    } catch (e) {
      alert('Invoice error.');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const fetchInvoices = async () => {
    const userId = customerSession.get('userId');
    if (!userId) return;
    try {
      const res = await fetch(`/api/invoices/customer/${userId}`);
      if (res.ok) setInvoices(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleVerifyWorkerPickupOtp = async (ticketId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/verify-worker-otp?otp=${workerPickupOtpInput}`, {
        method: 'POST'
      });
      if (res.ok) {
        setWorkerPickupOtpInput('');
        setOtpErrorMsg('');
        fetchTickets();
      } else {
        setOtpErrorMsg('Invalid Technician OTP code');
      }
    } catch (e) {
      setOtpErrorMsg('Verification error.');
    }
  };

  const handleVerifyWorkerDeliveryOtp = async (ticketId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/verify-worker-delivery-otp?otp=${workerDeliveryOtpInput}`, {
        method: 'POST'
      });
      if (res.ok) {
        setWorkerDeliveryOtpInput('');
        setOtpErrorMsg('');
        fetchTickets();
      } else {
        setOtpErrorMsg('Invalid Courier OTP code');
      }
    } catch (e) {
      setOtpErrorMsg('Verification error.');
    }
  };

  useEffect(() => { 
    if (!customerSession.get('userId')) {
      navigate('/login');
      return;
    }
    const role = customerSession.get('userRole');
    if (role === 'HOTEL_B2B' || role === 'B2B_ADMIN') {
      alert('You are signed in with a corporate account. Redirecting to the B2B portal.');
      customerSession.clear();
      navigate('/corporate/login');
      return;
    }
    fetchTickets(); 
    fetchGarage();
    fetchProfile();
    fetchInvoices();
    const interval = setInterval(() => {
      fetchTickets();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    const userId = customerSession.get('userId');
    if (!userId) return;
    try {
      const res = await fetch(`/api/profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          fullName: data.fullName || customerSession.get('userName') || 'Customer',
          email: data.email || customerSession.get('userEmail') || '',
          phoneNumber: data.phoneNumber || '',
          hqAddress: data.hqAddress || '',
          profilePhoto: data.profilePhoto || '',
          smsNotifications: data.smsNotifications !== false,
          whatsappNotifications: data.whatsappNotifications !== false,
        });
        setOriginalProfile(data);
      }
    } catch (e) { console.error(e); }
  };

  const initiateProfileUpdate = async () => {
    const isPhoneChanged = originalProfile && profile.phoneNumber !== originalProfile.phoneNumber;
    const isPasswordChanged = !!profile.newPassword;

    if (isPhoneChanged || isPasswordChanged) {
      if (isPasswordChanged && !profile.currentPassword) {
         alert("Security Requirement: Please enter your Current Password to set a new one.");
         return;
      }
      setSavingProfile(true);
      const userId = customerSession.get('userId');
      try {
        const res = await fetch(`/api/profile/${userId}/generate-otp`, { method: 'POST' });
        if (res.ok) {
          setShowOtpModal(true);
        } else {
          alert("Failed to generate OTP.");
        }
      } catch (e) { alert("Failed to initiate secure update."); }
      finally { setSavingProfile(false); }
    } else {
      executeProfileUpdate();
    }
  };

  const verifyOtpAndSave = async () => {
    setOtpError('');
    const userId = customerSession.get('userId');
    try {
      const res = await fetch(`/api/profile/${userId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpValue })
      });
      if (res.ok) {
        setShowOtpModal(false);
        setOtpValue('');
        executeProfileUpdate();
      } else {
        setOtpError("Invalid or expired OTP code.");
      }
    } catch (e) { setOtpError("Error verifying OTP."); }
  };

  const executeProfileUpdate = async () => {
    setSavingProfile(true);
    const userId = customerSession.get('userId');
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
          email: updated.email || prev.email || customerSession.get('userEmail') || '',
          phoneNumber: updated.phoneNumber || prev.phoneNumber,
          hqAddress: updated.hqAddress ?? prev.hqAddress,
          profilePhoto: updated.profilePhoto ?? prev.profilePhoto,
          smsNotifications: updated.smsNotifications !== false,
          whatsappNotifications: updated.whatsappNotifications !== false,
        }));
        setOriginalProfile(updated);
        if (updated.fullName) customerSession.set('userName', updated.fullName);
        alert("Profile Settings Updated Securely!");
      } else {
        const err = await res.text();
        alert("Update failed: " + err);
      }
    } catch (e) { alert("Failed to update profile."); }
    finally { setSavingProfile(false); }
  };

  const fetchTickets = async () => {
    const userId = customerSession.get('userId');
    if (!userId) return navigate('/login');
    try {
      const res = await fetch(`/api/tickets/customer/${userId}?channel=HOUSEHOLD`);
      if (res.ok) setTickets(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchGarage = async () => {
    const userId = customerSession.get('userId');
    if (!userId) return;
    try {
      const res = await fetch(`/api/garage/user/${userId}?registryType=HOUSEHOLD`);
      if (res.ok) {
        const items = await res.json();
        setGarage(items.filter((i) => !i.registryType || i.registryType === 'HOUSEHOLD'));
      }
    } catch (e) { console.error(e); }
  };

  const addGarageAppliance = async () => {
    const userId = customerSession.get('userId');
    try {
      const res = await fetch('/api/garage/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          category: garageItem.category,
          product: garageItem.product,
          brand: garageItem.brand,
          model: garageItem.model,
          purchaseYear: garageItem.year ? parseInt(garageItem.year, 10) : null,
          photoBase64: garageItem.photo || null,
          registryType: 'HOUSEHOLD',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to add appliance');
      }
      await fetchGarage();
      setShowGarageModal(false);
      setGarageItem({ category: '', product: '', brand: '', model: '', year: '', photo: null });
      setTab('garage');
    } catch (e) { alert(e.message); }
  };

  const deleteGarageAppliance = async (garageId) => {
    if (!window.confirm('Remove this appliance from your garage?')) return;
    try {
      await fetch(`/api/garage/${garageId}`, { method: 'DELETE' });
      await fetchGarage();
    } catch (e) { alert('Failed to delete.'); }
  };

  const submitQuickRescue = async () => {
    const userId = customerSession.get('userId');
    const curActive = tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    if (curActive.length >= 2) {
      alert('You already have 2 active rescues. Please complete or cancel one before booking another.');
      return;
    }
    const chosenCategory = selectedGarageItem?.category;
    if (curActive.some(t => t.applianceCategory === chosenCategory)) {
      alert(`You already have an active rescue for "${chosenCategory}".`);
      return;
    }
    if (!ticketData.issue?.trim()) {
      alert('Please describe the problem.');
      return;
    }
    try {
      const lat = ticketData.lat || 13.0827;
      const lon = ticketData.lon || 80.2707;
      const shopRes = await fetch(`/api/shop/nearby?lat=${lat}&lon=${lon}&radiusKm=8`);
      const shops = await shopRes.json();
      if (!shops?.length) throw new Error('No nearby service shops found.');

      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userId,
          shopId: shops[0].shopId,
          ticketChannel: 'HOUSEHOLD',
          applianceCategory: selectedGarageItem.category,
          applianceBrand: selectedGarageItem.brand,
          applianceProduct: selectedGarageItem.product,
          applianceModel: selectedGarageItem.model,
          purchaseYear: selectedGarageItem.purchaseYear,
          issueDescription: ticketData.issue,
          issuePhotos: ticketData.photos || [],
          customerAddress: profile.hqAddress || ticketData.address || 'Saved Address',
          customerLat: lat,
          customerLon: lon,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to book rescue');
      }
      await fetchTickets();
      setShowQuickBook(false);
      setSelectedGarageItem(null);
      setTicketData(prev => ({ ...prev, issue: '', photos: [] }));
      setTab('home');
    } catch (e) { alert(e.message); }
  };

  const handleLogout = async () => {
    const userId = customerSession.get('userId');
    if (userId) await fetch(`/api/auth/logout/${userId}`, { method: 'POST' });
    customerSession.clear();
    navigate('/login');
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
    if (step === 5) return ticketData.locationType === 'auto' || ticketData.address.trim().length > 0;
    if (step === 6) return !!ticketData.selectedShopId;
    return false;
  };

  const findNearbyShops = async () => {
    setFetchingShops(true);
    try {
      // Default to Chennai center if lat/lon not set by LocationPicker yet
      const lat = ticketData.lat || 13.0827;
      const lon = ticketData.lon || 80.2707;
      const res = await fetch(`/api/shop/nearby?lat=${lat}&lon=${lon}&radiusKm=8`);
      if (res.ok) {
        const shops = await res.json();
        setNearbyShops(shops);
        if (shops && shops.length > 0) {
          const firstShopId = shops[0].shopId;
          setTicketData(prev => ({ ...prev, selectedShopId: firstShopId }));
          await submitTicket(firstShopId);
          return;
        } else {
          // Fallback if no nearby shops found (for demo purposes)
          const fallbackRes = await fetch(`/api/shop/all`);
          if (fallbackRes.ok) {
            const allShops = await fallbackRes.json();
            if (allShops && allShops.length > 0) {
              const fallbackShopId = allShops[0].shopId;
              setTicketData(prev => ({ ...prev, selectedShopId: fallbackShopId }));
              await submitTicket(fallbackShopId);
              return;
            }
          }
          alert("No service partners found in the system.");
          return;
        }
      }
    } catch (e) {
      alert("Error finding shops");
    } finally {
      setFetchingShops(false);
    }
  };



  const submitTicket = async (overrideShopId) => {
    const userId = customerSession.get('userId');
    // --- CLIENT-SIDE CONCURRENCY GUARD (Customer: max 2, different categories) ---
    const curActive = tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    if (curActive.length >= 2) {
      alert('You already have 2 active rescues. Please complete or cancel one before booking another.');
      return;
    }
    const chosenCategory = ticketData.category;
    const catAlreadyActive = curActive.some(t => t.applianceCategory === chosenCategory);
    if (catAlreadyActive) {
      alert(`You already have an active rescue for "${chosenCategory}". Please choose a different category or wait for the current one to complete.`);
      return;
    }
    try {
      const shopIdToUse = typeof overrideShopId === 'string' ? overrideShopId : ticketData.selectedShopId;
      if (!shopIdToUse) throw new Error('Please select a shop.');
      
      const finalProduct = ticketData.product === 'Other' ? ticketData.otherProduct : ticketData.product;
      const finalBrand = ticketData.brand === 'Other' ? ticketData.otherBrand : ticketData.brand;

      const payload = {
        customerId: userId, 
        shopId: shopIdToUse,
        ticketChannel: 'HOUSEHOLD',
        applianceCategory: ticketData.category, 
        applianceBrand: finalBrand,
        applianceProduct: finalProduct,
        applianceModel: ticketData.model || 'N/A',
        purchaseYear: parseInt(ticketData.year) || null,
        issueDescription: ticketData.issue || 'General service request',
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
      setShowBook(false); setBookStep(1); setTab('home');
      setTicketData({ category: '', product: '', otherProduct: '', brand: '', otherBrand: '', model: '', year: '', issue: '', photos: [], locationType: 'auto', address: '', lat: null, lon: null });
    } catch (e) { alert(e.message); }
  };

  const cancelTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to cancel this rescue request? A fine may apply if cancelled after 10 minutes.")) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/cancel`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error("Failed to cancel ticket");
      await fetchTickets();
    } catch (e) { alert(e.message); }
  };

  const activeTickets = tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const pastTickets = tickets.filter(t => t.status === 'COMPLETED' || t.status === 'CANCELLED');
  const activeCategories = activeTickets.map(t => t.applianceCategory);
  const canBook = activeTickets.length < 2;
  const selectedCategoryBlocked = ticketData.category && activeCategories.includes(ticketData.category);

  const SidebarItem = ({ icon: Icon, label, id }) => (
    <div onClick={() => { setTab(id); setShowBook(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 12, cursor: 'pointer', background: tab === id && !showBook ? 'rgba(6,182,212,0.1)' : 'transparent', color: tab === id && !showBook ? '#06B6D4' : '#94A3B8', borderLeft: tab === id && !showBook ? '3px solid #06B6D4' : '3px solid transparent', transition: 'all 0.2s', fontWeight: tab === id && !showBook ? 700 : 500 }}>
      <Icon size={20} /> {label}
    </div>
  );

  const selectedCategoryDetails = Object.values(CATEGORY_DETAILS).find(c => c.name === ticketData.category);

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", display: 'flex' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: 280, background: '#1E293B', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, zIndex: 40 }}>
        <div style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)' }}>
            <Wrench size={24} color="#fff" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px' }}>Fix<span style={{ color: '#06B6D4' }}>Swap</span></span>
        </div>

        <div style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ color: '#64748B', fontSize: 12, fontWeight: 700, padding: '16px 20px 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dashboard</div>
          <SidebarItem icon={Home} label="Active Rescues" id="home" />
          <div 
            onClick={() => canBook && !selectedCategoryBlocked && setShowBook(true)} 
            title={!canBook ? 'Max 2 active rescues reached' : ''}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '16px 20px', 
              borderRadius: 12, 
              cursor: !canBook ? 'not-allowed' : 'pointer', 
              background: !canBook ? '#1E293B' : (showBook ? 'linear-gradient(135deg, #06B6D4, #0284C7)' : '#0B1120'), 
              color: !canBook ? '#64748B' : '#fff', 
              border: '1px solid rgba(255,255,255,0.1)', 
              marginTop: 8, 
              transition: 'all 0.2s', 
              fontWeight: 800,
              opacity: !canBook ? 0.6 : 1
            }}>
            <Zap size={20} />
            {!canBook ? `${activeTickets.length}/2 Rescues Active` : 'Book a Rescue'}
            {activeTickets.length === 1 && canBook && <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.2)', color: '#10B981', padding: '2px 8px', borderRadius: 6, marginLeft: 4 }}>+1 Slot</span>}
          </div>
          
          <div style={{ color: '#64748B', fontSize: 12, fontWeight: 700, padding: '32px 20px 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Account</div>
          <SidebarItem icon={Box} label="My Garage" id="garage" />
          <SidebarItem icon={Clock} label="Repair History" id="history" />
          <SidebarItem icon={CreditCard} label="Invoices & Billing" id="invoices" />
          <SidebarItem icon={User} label="Profile Settings" id="profile" />
        </div>

        <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: profile.profilePhoto ? `url("${profile.profilePhoto}") center/cover` : '#0B1120', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {!profile.profilePhoto && <User size={20} color="#06B6D4" />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{profile.fullName || customerSession.get('userName') || 'User'}</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{profile.email || customerSession.get('userEmail') || 'Household Account'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogOut size={16} /> Secure Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ marginLeft: 280, flex: 1, padding: '40px', maxWidth: 1200 }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-1px' }}>
              {tab === 'home' && "Household Overview"}
              {tab === 'garage' && "My Appliance Garage"}
              {tab === 'history' && "Service History"}
              {tab === 'invoices' && "Invoices & Payments"}
              {tab === 'profile' && "Account Settings"}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: 16 }}>Manage your zero-downtime experience.</p>
          </div>
          <button style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Bell size={20} color="#94A3B8" />
          </button>
        </header>

        {tab === 'home' && (
          <div>
            {!canBook && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={20} color="#F87171" />
                <div>
                  <p style={{ color: '#FCA5A5', fontWeight: 800, margin: '0 0 4px', fontSize: 14 }}>Booking limit reached (2/2 active rescues)</p>
                  <p style={{ color: '#94A3B8', margin: 0, fontSize: 13 }}>Cancel or complete an active rescue below before raising a new ticket.</p>
                </div>
              </div>
            )}
            {loading ? <div style={{ color: '#06B6D4', textAlign: 'center', padding: 40 }}>Loading...</div> : (
              activeTickets.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                  {/* Capacity Bar */}
                  <div style={{ background: '#1E293B', borderRadius: 16, padding: '16px 24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Zap size={18} color="#06B6D4" />
                      <span style={{ color: '#fff', fontWeight: 700 }}>Active Rescues</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[0,1].map(i => (
                          <div key={i} style={{ width: 28, height: 10, borderRadius: 4, background: i < activeTickets.length ? '#06B6D4' : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <span style={{ color: '#94A3B8', fontSize: 14 }}>{activeTickets.length}/2 slots used</span>
                      {activeTickets.length < 2 && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>+{2 - activeTickets.length} slot available</span>}
                    </div>
                  </div>

                  {activeTickets.map(ticket => {
                    const steps = getTrackerSteps(ticket);
                    const stepIdx = getStepIndex(ticket);
                    const banner = getStatusBanner(ticket);
                    const isPending = ticket.status === 'PENDING';
                    const showPickupOtp = showsPickupOtpSection(ticket);
                    const showDeliveryOtp = showsDeliveryOtpSection(ticket);
                    return (
                      <div key={ticket.ticketId} style={{ background: '#1E293B', borderRadius: 24, border: '1px solid rgba(6,182,212,0.3)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)' }} />
                        
                        {isPending ? (
                          <div style={{ height: 200, background: '#0B1120', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="pulsing-radar" style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)', border: '1px dashed rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', top: 30 }}>
                              <Truck size={28} color="#06B6D4" />
                              <div className="radar-wave-1" />
                              <div className="radar-wave-2" />
                            </div>
                            <div style={{ textAlign: 'center', zIndex: 1, marginTop: 80 }}>
                              <div style={{ background: 'rgba(234, 88, 12, 0.1)', border: '1px solid #EA580C', padding: '6px 16px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span className="pulse-dot" style={{ width: 8, height: 8, background: '#EA580C', borderRadius: '50%', display: 'inline-block' }} />
                                <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>Broadcasting Rescue Request (8km Radius)...</span>
                              </div>
                              <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>Awaiting acceptance from nearby service partners</p>
                            </div>
                          </div>
                        ) : (
                          <div style={{ height: 200, background: '#0B1120', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapIcon size={100} color="rgba(6,182,212,0.05)" style={{ position: 'absolute' }} />
                            <div style={{ textAlign: 'center', zIndex: 1, padding: '0 24px' }}>
                              {isDeliveryPartnerTicket(ticket) && (
                                <span style={{ display: 'inline-block', marginBottom: 10, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#93C5FD', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Delivery Partner Flow
                                </span>
                              )}
                              <div style={{ background: banner.tone === 'pending' ? 'rgba(234, 88, 12, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: `1px solid ${banner.tone === 'pending' ? '#EA580C' : '#10B981'}`, padding: '10px 20px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 12, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: banner.tone === 'pending' ? '#EA580C' : '#10B981', boxShadow: `0 0 10px ${banner.tone === 'pending' ? '#EA580C' : '#10B981'}` }} />
                                <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>
                                  {banner.title}
                                  {ticket.status === 'TECH_DISPATCHED' && !isDeliveryPartnerTicket(ticket) && (
                                    <> in <LiveArrivalTimer createdAt={ticket.createdAt} /></>
                                  )}
                                </span>
                              </div>
                              <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>{banner.subtitle}</p>
                            </div>
                          </div>
                        )}
                        <div style={{ padding: 28 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div>
                              <div style={{ fontSize: 11, color: '#06B6D4', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '1px' }}>{ticket.applianceCategory}</div>
                              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{ticket.applianceProduct} ({ticket.applianceBrand})</h2>
                              <p style={{ color: '#94A3B8', fontSize: 14 }}>Issue: {ticket.issueDescription}</p>
                              {ticket.purchaseYear && <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>Model: {ticket.applianceModel} • Year: {ticket.purchaseYear}</p>}
                              
                              {/* Mutual OTP Display and inputs for Verification */}
                              {showPickupOtp && (
                                <div style={{ marginTop: 20, padding: 20, background: 'rgba(234, 88, 12, 0.05)', borderRadius: 16, border: '1px solid rgba(234, 88, 12, 0.2)' }}>
                                  <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 12px' }}>
                                    {isDeliveryPartnerTicket(ticket)
                                      ? 'Courier is at your home — exchange loaner for your broken device.'
                                      : 'Technician is at your door — verify identity with mutual OTP.'}
                                  </p>
                                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div>
                                      <span style={{ color: '#EA580C', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Your Pickup OTP</span>
                                      <span style={{ color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '2px', background: 'rgba(234,88,12,0.1)', padding: '6px 16px', borderRadius: 8, display: 'inline-block' }}>{ticket.pickupOtp || 'Syncing...'}</span>
                                    </div>
                                    
                                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 16, flex: 1, minWidth: 200 }}>
                                      <span style={{ color: '#06B6D4', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                                        {isDeliveryPartnerTicket(ticket) ? "Verify Courier (Enter Courier's OTP)" : "Verify Tech Identity (Enter Tech's OTP)"}
                                      </span>
                                      {ticket.workerPickupOtpVerified ? (
                                        <div style={{ color: '#10B981', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <CheckCircle2 size={16} /> Identity Verified Successfully!
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                          <input 
                                            type="text" 
                                            maxLength={6} 
                                            placeholder="Tech OTP" 
                                            value={workerPickupOtpInput} 
                                            onChange={e => setWorkerPickupOtpInput(e.target.value)} 
                                            style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, color: '#fff', width: 100, fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center' }} 
                                          />
                                          <button 
                                            onClick={() => handleVerifyWorkerPickupOtp(ticket.ticketId)} 
                                            style={{ background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                                          >
                                            Verify
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {otpErrorMsg && <div style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginTop: 8 }}>{otpErrorMsg}</div>}
                                </div>
                              )}
                              
                              {showDeliveryOtp && (
                                <div style={{ marginTop: 20, padding: 20, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 16, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                  <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 12px' }}>
                                    Return courier is delivering your repaired device and collecting the loaner.
                                  </p>
                                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div>
                                      <span style={{ color: '#10B981', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Your Delivery OTP</span>
                                      <span style={{ color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '2px', background: 'rgba(16,185,129,0.1)', padding: '6px 16px', borderRadius: 8, display: 'inline-block' }}>{ticket.deliveryOtp || 'Syncing...'}</span>
                                    </div>
                                    
                                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 16, flex: 1, minWidth: 200 }}>
                                      <span style={{ color: '#06B6D4', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Verify Delivery (Enter Worker's OTP)</span>
                                      {ticket.workerDeliveryOtpVerified ? (
                                        <div style={{ color: '#10B981', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <CheckCircle2 size={16} /> Delivery Verified Successfully!
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                          <input 
                                            type="text" 
                                            maxLength={6} 
                                            placeholder="Worker OTP" 
                                            value={workerDeliveryOtpInput} 
                                            onChange={e => setWorkerDeliveryOtpInput(e.target.value)} 
                                            style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, color: '#fff', width: 100, fontSize: 16, fontWeight: 700, outline: 'none', textAlign: 'center' }} 
                                          />
                                          <button 
                                            onClick={() => handleVerifyWorkerDeliveryOtp(ticket.ticketId)} 
                                            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                                          >
                                            Verify
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {otpErrorMsg && <div style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginTop: 8 }}>{otpErrorMsg}</div>}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                              <button onClick={() => cancelTicket(ticket.ticketId)} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <XCircle size={14} /> Cancel
                              </button>
                              <CancellationTimer createdAt={ticket.createdAt} />
                            </div>
                          </div>
                          <div style={{ background: '#0B1120', borderRadius: 16, padding: '24px 16px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1, minWidth: steps.length * 88 }}>
                              <div style={{ position: 'absolute', top: 14, left: 24, right: 24, height: 4, background: 'rgba(255,255,255,0.05)', zIndex: -1, borderRadius: 2 }} />
                              <div style={{ position: 'absolute', top: 14, left: 24, width: steps.length > 1 ? `calc(${(Math.max(stepIdx, 0) / (steps.length - 1)) * 100}% - 48px)` : '0%', height: 4, background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)', zIndex: -1, transition: 'width 0.5s ease', borderRadius: 2 }} />
                              {steps.map((step, idx) => {
                                const isCompleted = idx <= stepIdx;
                                const isActive = idx === stepIdx;
                                return (
                                  <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1, minWidth: 72 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: isCompleted ? '#06B6D4' : '#1E293B', border: `3px solid ${isCompleted ? 'rgba(6,182,212,0.3)' : '#0B1120'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', boxShadow: isActive ? '0 0 18px rgba(6,182,212,0.5)' : 'none' }}>
                                      {isCompleted && <CheckCircle2 size={16} color="#fff" />}
                                    </div>
                                    <span style={{ color: isActive ? '#fff' : '#64748B', fontSize: 11, fontWeight: isActive ? 800 : 600, textAlign: 'center', lineHeight: 1.3, maxWidth: 76 }}>{step.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Book Second Rescue CTA */}
                  {activeTickets.length < 2 && (
                    <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px dashed rgba(6,182,212,0.3)', borderRadius: 20, padding: 28, textAlign: 'center' }}>
                      <p style={{ color: '#94A3B8', marginBottom: 16 }}>You have 1 rescue slot remaining. You can book another rescue in a <strong style={{ color: '#06B6D4' }}>different category</strong>.</p>
                      <button onClick={() => setShowBook(true)} style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 100, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Book 2nd Rescue</button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(139,92,246,0.08))', borderRadius: 24, padding: '32px 36px', marginBottom: 28, border: '1px solid rgba(6,182,212,0.2)' }}>
                    <p style={{ color: '#06B6D4', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Welcome back</p>
                    <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
                      {profile.fullName || customerSession.get('userName') || 'Household Customer'}
                    </h2>
                    <p style={{ color: '#94A3B8', margin: 0, fontSize: 15 }}>
                      {customerSession.get('userEmail') || profile.email || 'customer@test.com'} • Zero active repairs
                    </p>
                  </div>

                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#1E293B', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                      <Zap size={40} color="#06B6D4" />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: '#fff' }}>Ready for your first rescue?</h2>
                    <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 12, maxWidth: 480, margin: '0 auto 12px' }}>
                      No active tickets yet. Book a repair and we will broadcast it to nearby partner shops within 8km.
                    </p>
                    <p style={{ color: '#64748B', fontSize: 13, marginBottom: 32 }}>You can have up to 2 active rescues in different categories.</p>
                    <button onClick={() => setShowBook(true)} style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 100, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(6,182,212,0.3)' }}>
                      Book Your First Rescue
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* MY GARAGE — household assets only */}
        {tab === 'garage' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Registered Home Appliances</h2>
                <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>Saved for one-tap rescues. Business assets belong on the B2B portal.</p>
              </div>
              <button onClick={() => setShowGarageModal(true)} style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: '1px solid #06B6D4', padding: '10px 20px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={16} /> Add Appliance
              </button>
            </div>

            {garage.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', background: '#1E293B', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Box size={48} color="#64748B" style={{ marginBottom: 16 }} />
                <h2 style={{ color: '#fff', marginBottom: 8 }}>Your Garage is Empty</h2>
                <p style={{ color: '#94A3B8', marginBottom: 24 }}>Register home appliances here for faster booking next time.</p>
                <button onClick={() => setShowGarageModal(true)} style={{ background: '#06B6D4', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Add Your First Appliance</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                {garage.map(item => (
                  <div
                    key={item.garageId}
                    onClick={() => { setSelectedGarageItem(item); setShowQuickBook(true); }}
                    style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                  >
                    <div style={{ height: 140, background: item.photoBase64 ? `url("${item.photoBase64}") center/cover` : '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!item.photoBase64 && <Box size={40} color="rgba(255,255,255,0.1)" />}
                    </div>
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#06B6D4', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{item.category}</div>
                          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{item.product}</h3>
                          <p style={{ color: '#94A3B8', fontSize: 13 }}>{item.brand} • {item.model}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteGarageAppliance(item.garageId); }}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', width: 32, height: 32, borderRadius: 8, cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8, color: '#10B981', fontSize: 12, fontWeight: 700 }}>
                        <Zap size={14} /> Tap to Book Instant Rescue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SERVICE HISTORY */}
        {tab === 'history' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {pastTickets.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', background: '#1E293B', borderRadius: 24 }}><Clock size={48} color="#64748B" style={{marginBottom:16}}/><h2 style={{color:'#fff'}}>No Service History</h2><p style={{color:'#94A3B8'}}>You haven't completed any rescues yet.</p></div>
            ) : (
              pastTickets.map(t => (
                <div key={t.ticketId} style={{ background: '#1E293B', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: t.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.status === 'COMPLETED' ? <CheckCircle2 size={24} color="#10B981" /> : <XCircle size={24} color="#EF4444" />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{t.applianceProduct} ({t.applianceBrand})</h4>
                      <p style={{ color: '#64748B', fontSize: 13 }}>{t.status} • ID: {t.ticketId.substring(0,8)}</p>
                    </div>
                  </div>
                  {t.status === 'COMPLETED' && (
                    <button onClick={() => openInvoice(t.ticketId)} disabled={loadingInvoice} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      View Invoice
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PLACEHOLDERS FOR OTHERS */}
        {tab === 'invoices' && (
          <div>
            <p style={{ color: '#94A3B8', marginBottom: 24 }}>Dynamic invoices based on your appliance, repair complexity, and delivery path.</p>
            {invoices.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', background: '#1E293B', borderRadius: 24 }}>
                <CreditCard size={48} color="#64748B" style={{ marginBottom: 16 }} />
                <h2 style={{ color: '#fff' }}>No invoices yet</h2>
                <p style={{ color: '#94A3B8' }}>Completed rescues will appear here with itemized billing.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {invoices.map((inv) => (
                  <div key={inv.invoiceId} style={{ background: '#1E293B', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h4 style={{ color: '#fff', fontWeight: 800, margin: '0 0 4px' }}>{inv.applianceProduct} ({inv.applianceBrand})</h4>
                      <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>#{inv.ticketShortId} • {inv.paymentStatus}</p>
                      <p style={{ color: '#06B6D4', fontSize: 18, fontWeight: 900, margin: '8px 0 0' }}>₹{Number(inv.finalTotal).toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => setInvoiceModal(inv)} style={{ background: inv.paymentStatus === 'PAID' ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #06B6D4, #8B5CF6)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
                      {inv.paymentStatus === 'PAID' ? 'View Receipt' : 'Pay Now'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* PROFILE SETTINGS */}
        {tab === 'profile' && (
          <div style={{ display: 'flex', gap: 32, maxWidth: 1000 }}>
            {/* Sidebar Navigation */}
            <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'account', label: 'My Account', icon: User },
                { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
                { id: 'security', label: 'Security & Privacy', icon: CreditCard },
                { id: 'notifications', label: 'Notifications', icon: Zap }
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setProfileSubTab(item.id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', 
                    padding: '16px 20px', borderRadius: 16, cursor: 'pointer',
                    background: profileSubTab === item.id ? 'rgba(6,182,212,0.1)' : 'transparent',
                    border: 'none', color: profileSubTab === item.id ? '#06B6D4' : '#94A3B8',
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
                    <div onClick={() => { const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange=async (e)=>{ const file=e.target.files[0]; if(file){ const compressed=await compressImage(file); setProfile({...profile, profilePhoto: compressed}); } }; input.click(); }} style={{ width: 100, height: 100, borderRadius: '50%', background: profile.profilePhoto ? `url("${profile.profilePhoto}") center/cover` : '#0B1120', border: '3px solid #06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                      {!profile.profilePhoto && <User size={40} color="#06B6D4" />}
                      <div style={{ position: 'absolute', bottom: -5, right: -5, background: '#06B6D4', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #1E293B' }}>
                        <Camera size={14} color="#fff" />
                      </div>
                    </div>
                    <div>
                      <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{profile.fullName || 'User'}</h2>
                      <p style={{ color: '#94A3B8', fontSize: 14 }}>{profile.email} • Household Member</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Email Address</label>
                      <input type="email" readOnly value={profile.email || customerSession.get('userEmail') || ''} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#94A3B8', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Full Name</label>
                      <input type="text" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Phone Number</label>
                      <input type="text" value={profile.phoneNumber} onChange={e => setProfile({...profile, phoneNumber: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {profileSubTab === 'addresses' && (
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={24} color="#06B6D4" /> Service Addresses</h3>
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Primary Home Base</label>
                    <textarea placeholder="e.g. 123 Tech Lane, Block B..." value={profile.hqAddress} onChange={e => setProfile({...profile, hqAddress: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', minHeight: 120, resize: 'none' }} />
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {profileSubTab === 'security' && (
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={24} color="#06B6D4" /> Security & Privacy</h3>
                  <div style={{ background: '#0B1120', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                    
                    <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Current Password (Required for changes)</label>
                    <input type="password" placeholder="Enter current password" value={profile.currentPassword || ''} onChange={e => setProfile({...profile, currentPassword: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', marginBottom: 16 }} />

                    <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>New Password</label>
                    <input type="password" placeholder="Enter new password" value={profile.newPassword || ''} onChange={e => setProfile({...profile, newPassword: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', marginBottom: 8 }} />
                    <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>An OTP verification will be required to change your password.</p>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {profileSubTab === 'notifications' && (
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={24} color="#06B6D4" /> Communication Preferences</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0B1120', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>SMS Alerts</div>
                        <div style={{ fontSize: 13, color: '#94A3B8' }}>Receive technician dispatch and ETA updates via SMS.</div>
                      </div>
                      <button onClick={() => setProfile({...profile, smsNotifications: !profile.smsNotifications})} style={{ width: 50, height: 28, borderRadius: 100, background: profile.smsNotifications ? '#06B6D4' : '#1E293B', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 2, left: profile.smsNotifications ? 24 : 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0B1120', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>WhatsApp Updates</div>
                        <div style={{ fontSize: 13, color: '#94A3B8' }}>Receive digital invoices and images via WhatsApp.</div>
                      </div>
                      <button onClick={() => setProfile({...profile, whatsappNotifications: !profile.whatsappNotifications})} style={{ width: 50, height: 28, borderRadius: 100, background: profile.whatsappNotifications ? '#06B6D4' : '#1E293B', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 2, left: profile.whatsappNotifications ? 24 : 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button (Always visible) */}
              <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={initiateProfileUpdate} disabled={savingProfile} style={{ background: '#06B6D4', color: '#fff', border: 'none', padding: '16px 40px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', opacity: savingProfile ? 0.6 : 1 }}>
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* OTP VERIFICATION MODAL */}
        {showOtpModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150, padding: 20 }}>
            <div style={{ background: '#1E293B', width: '100%', maxWidth: 450, borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 64px rgba(0,0,0,0.6)', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '2px solid #06B6D4' }}>
                <CreditCard size={32} color="#06B6D4" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Security Verification</h2>
              <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 32 }}>We've sent a 6-digit OTP to your registered phone number. Please enter it below to confirm your changes.</p>
              
              <input type="text" placeholder="Enter 6-digit OTP" maxLength={6} value={otpValue} onChange={e => setOtpValue(e.target.value)} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: 16, color: '#fff', fontSize: 24, fontWeight: 800, textAlign: 'center', letterSpacing: '8px', marginBottom: 16, outline: 'none', boxSizing: 'border-box' }} />
              
              {otpError && <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 700, marginBottom: 24 }}>{otpError}</div>}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { setShowOtpModal(false); setOtpValue(''); setOtpError(''); }} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 16, borderRadius: 16, cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                <button onClick={verifyOtpAndSave} disabled={otpValue.length !== 6} style={{ flex: 2, background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', border: 'none', color: '#fff', padding: 16, borderRadius: 16, cursor: 'pointer', fontWeight: 800, opacity: otpValue.length !== 6 ? 0.5 : 1 }}>
                  Verify & Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD GARAGE MODAL */}
      {showGarageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: '#1E293B', width: '100%', maxWidth: 500, borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 24 }}>Add Appliance to Garage</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div onClick={() => garageFileInputRef.current?.click()} style={{ width: 120, height: 120, borderRadius: 16, border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: garageItem.photo ? `url("${garageItem.photo}") center/cover` : 'transparent' }}>
                  {!garageItem.photo && <div style={{ textAlign: 'center' }}><Camera size={24} color="#64748B" /><div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>Photo</div></div>}
                  <input type="file" ref={garageFileInputRef} hidden accept="image/*" onChange={async (e) => { const file = e.target.files[0]; if (file) { const compressed = await compressImage(file); setGarageItem({ ...garageItem, photo: compressed }); } }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <select value={garageItem.category} onChange={e => setGarageItem({ ...garageItem, category: e.target.value, product: '', brand: '' })} style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 12, color: '#fff' }}>
                    <option value="">Select Category</option>
                    {Object.values(CATEGORY_DETAILS).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <input type="text" placeholder="Product (e.g. Split AC)" value={garageItem.product} onChange={e => setGarageItem({ ...garageItem, product: e.target.value })} style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 12, color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="text" placeholder="Brand" value={garageItem.brand} onChange={e => setGarageItem({ ...garageItem, brand: e.target.value })} style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 12, color: '#fff' }} />
                <input type="text" placeholder="Model Number" value={garageItem.model} onChange={e => setGarageItem({ ...garageItem, model: e.target.value })} style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 12, color: '#fff' }} />
              </div>
              <input type="number" placeholder="Purchase Year" value={garageItem.year} onChange={e => setGarageItem({ ...garageItem, year: e.target.value })} style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 14, borderRadius: 12, color: '#fff' }} />
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => { setShowGarageModal(false); setGarageItem({ category: '', product: '', brand: '', model: '', year: '', photo: null }); }} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 16, borderRadius: 12, cursor: 'pointer' }}>Cancel</button>
                <button onClick={addGarageAppliance} disabled={!garageItem.category || !garageItem.product} style={{ flex: 1, background: '#06B6D4', border: 'none', color: '#fff', padding: 16, borderRadius: 12, cursor: 'pointer', fontWeight: 700, opacity: (!garageItem.category || !garageItem.product) ? 0.5 : 1 }}>Save Appliance</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK RESCUE FROM GARAGE */}
      {showQuickBook && selectedGarageItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 20 }}>
          <div style={{ background: '#1E293B', width: '100%', maxWidth: 500, borderRadius: 24, padding: 32, border: '1px solid #06B6D4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>Quick Rescue</h2>
                <p style={{ color: '#94A3B8', fontSize: 14 }}>Booking for {selectedGarageItem.product}</p>
              </div>
              <button onClick={() => { setShowQuickBook(false); setSelectedGarageItem(null); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <textarea placeholder="What's the problem?" value={ticketData.issue} onChange={e => setTicketData({ ...ticketData, issue: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', minHeight: 120, resize: 'none', boxSizing: 'border-box', marginBottom: 24 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setShowQuickBook(false); setSelectedGarageItem(null); }} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 16, borderRadius: 16, cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={submitQuickRescue} disabled={!ticketData.issue?.trim()} style={{ flex: 2, background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', border: 'none', color: '#fff', padding: 16, borderRadius: 16, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: ticketData.issue?.trim() ? 1 : 0.5 }}>
                <Zap size={18} /> Confirm Dispatch
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
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>Rescue Booking</h2>
                <p style={{ color: '#94A3B8', fontSize: 14 }}>Step {bookStep} of 6: {['Select Category', 'Select Product', 'Appliance Details', 'Upload Photo Evidence', 'Location', 'Select Dispatch Shop'][bookStep-1]}</p>
              </div>
              <button onClick={() => { setShowBook(false); setBookStep(1); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 4, padding: '0 32px', background: '#0B1120' }}>
              {[1,2,3,4,5,6].map(step => (
                <div key={step} style={{ height: 4, flex: 1, background: bookStep >= step ? '#06B6D4' : 'rgba(255,255,255,0.1)', borderRadius: '0 0 4px 4px', transition: 'background 0.3s' }} />
              ))}
            </div>

            <div style={{ padding: 32, overflowY: 'auto', flex: 1 }}>
              {/* STEP 1: CATEGORY (LIST WITH AVATAR) */}
              {bookStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Object.values(CATEGORY_DETAILS).map(c => (
                    <div key={c.id} onClick={() => setTicketData({ ...ticketData, category: c.name, product: '', brand: '' })} style={{ borderRadius: 16, border: `2px solid ${ticketData.category === c.name ? '#06B6D4' : 'rgba(255,255,255,0.05)'}`, background: ticketData.category === c.name ? 'rgba(6,182,212,0.1)' : '#0B1120', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20, padding: 20, transition: 'all 0.2s' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundImage: `url("${c.image}")`, backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid rgba(255,255,255,0.1)' }} />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{c.name}</h3>
                        <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>{c.products.slice(0,4).join(', ')}...</p>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${ticketData.category === c.name ? '#06B6D4' : '#64748B'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ticketData.category === c.name && <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#06B6D4' }} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: EXHAUSTIVE SUB-PRODUCT SELECTION */}
              {bookStep === 2 && selectedCategoryDetails && (
                <div>
                  <h3 style={{ color: '#fff', marginBottom: 20 }}>Select your {ticketData.category}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {selectedCategoryDetails.products.map(prod => (
                      <div key={prod} onClick={() => setTicketData({ ...ticketData, product: prod })} style={{ padding: '16px 20px', borderRadius: 12, border: `2px solid ${ticketData.product === prod ? '#06B6D4' : 'rgba(255,255,255,0.05)'}`, background: ticketData.product === prod ? 'rgba(6,182,212,0.1)' : '#0B1120', cursor: 'pointer', color: '#fff', fontWeight: 600, fontSize: 14 }}>
                        {prod}
                      </div>
                    ))}
                  </div>
                  {ticketData.product === 'Other' && (
                    <div style={{ marginTop: 16 }}>
                      <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Please Specify Product</label>
                      <input type="text" placeholder="Enter product name..." value={ticketData.otherProduct} onChange={e => setTicketData({ ...ticketData, otherProduct: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: DETAILS (DYNAMIC BRANDS) */}
              {bookStep === 3 && selectedCategoryDetails && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Select Brand</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedCategoryDetails.brands.map(brand => (
                        <button key={brand} onClick={() => setTicketData({ ...ticketData, brand })} style={{ padding: '10px 16px', borderRadius: 100, border: `1px solid ${ticketData.brand === brand ? '#06B6D4' : 'rgba(255,255,255,0.1)'}`, background: ticketData.brand === brand ? '#06B6D4' : '#0B1120', color: ticketData.brand === brand ? '#fff' : '#94A3B8', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
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
                      <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Model Number</label>
                      <input type="text" placeholder="Model No." value={ticketData.model} onChange={e => setTicketData({ ...ticketData, model: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Year</label>
                      <input type="number" placeholder="YYYY" value={ticketData.year} onChange={e => setTicketData({ ...ticketData, year: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Problem Description</label>
                    <textarea placeholder="Describe exactly what is going wrong..." value={ticketData.issue} onChange={e => setTicketData({ ...ticketData, issue: e.target.value })} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', minHeight: 100, resize: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              )}

              {/* STEP 4: MULTI-PHOTO UPLOAD */}
              {bookStep === 4 && (
                <div>
                  <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)', padding: 16, borderRadius: 12, marginBottom: 24 }}>
                    <p style={{ color: '#fff', fontSize: 14, margin: 0 }}><strong>Required:</strong> Please upload up to 3 photos (e.g., The entire unit, the specific damage, and the manufacturer label/model number).</p>
                  </div>
                  
                  <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {ticketData.photos.map((photoStr, idx) => (
                      <div key={idx} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #06B6D4', height: 160 }}>
                        <img src={photoStr} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => setTicketData({...ticketData, photos: ticketData.photos.filter((_, i) => i !== idx)})} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                    
                    {ticketData.photos.length < 3 && (
                      <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 12, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#0B1120', transition: 'border 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#06B6D4'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}>
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
                  <h3 style={{ color: '#fff', margin: 0 }}>Where should we send the tech?</h3>
                  <LocationPicker
                    accentColor="#06B6D4"
                    onLocationConfirm={({ lat, lon, address }) => {
                      setTicketData(prev => ({ ...prev, locationType: 'auto', address, lat, lon }));
                    }}
                  />
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 16 }}>Location Method</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button 
                        onClick={() => setTicketData({ ...ticketData, locationType: 'profile' })} 
                        disabled={ticketData.category === 'Automotive & Mobility'}
                        style={{ flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${ticketData.locationType === 'profile' ? '#06B6D4' : 'rgba(255,255,255,0.05)'}`, background: ticketData.locationType === 'profile' ? 'rgba(6,182,212,0.1)' : '#0B1120', color: ticketData.category === 'Automotive & Mobility' ? '#64748B' : '#fff', cursor: ticketData.category === 'Automotive & Mobility' ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                      >
                        Use Profile HQ
                      </button>
                      
                      <button onClick={() => setTicketData({ ...ticketData, locationType: 'auto' })} style={{ flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${ticketData.locationType === 'auto' ? '#06B6D4' : 'rgba(255,255,255,0.05)'}`, background: ticketData.locationType === 'auto' ? 'rgba(6,182,212,0.1)' : '#0B1120', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Auto-Detect</button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: BROADCAST DISPATCH REQUEST */}
              {bookStep === 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ color: '#fff', margin: 0 }}>Broadcast Rescue Request</h3>
                  <p style={{ color: '#94A3B8', fontSize: 14 }}>Your rescue alert will be broadcasted live to all certified partners within an 8km radius.</p>
                  
                  {fetchingShops ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#06B6D4' }}>Searching nearby partners...</div>
                  ) : nearbyShops.length === 0 ? (
                    <div style={{ background: '#1E293B', padding: 32, borderRadius: 16, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <MapIcon size={48} color="#64748B" style={{ marginBottom: 16 }} />
                      <h4 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>No Service Shops Found Nearby</h4>
                      <p style={{ color: '#94A3B8' }}>Try adjusting your location or check back later.</p>
                    </div>
                  ) : (
                    <div>
                      {/* Radar sweep animation */}
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                        <div className="pulsing-radar" style={{
                          width: 120, height: 120, borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
                          border: '2px solid rgba(6, 182, 212, 0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <Truck size={40} color="#06B6D4" />
                          <div className="radar-wave-1" />
                          <div className="radar-wave-2" />
                        </div>
                      </div>

                      <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                        📡 {nearbyShops.length} Partner(s) in Range (8km)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                        {nearbyShops.map(shop => (
                          <div key={shop.shopId} style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <Wrench size={16} color="#06B6D4" />
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{shop.shopName}</div>
                                <div style={{ color: '#64748B', fontSize: 12 }}>{shop.address}</div>
                              </div>
                            </div>
                            <span style={{ color: '#10B981', fontSize: 12, fontWeight: 700 }}>Online</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', background: '#0B1120' }}>
              <button onClick={() => setBookStep(Math.max(1, bookStep - 1))} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', visibility: bookStep === 1 ? 'hidden' : 'visible' }}>Back</button>
              
              {bookStep < 5 ? (
                <button 
                  onClick={() => setBookStep(bookStep + 1)} 
                  disabled={!isStepValid(bookStep)}
                  style={{ background: '#06B6D4', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', opacity: 1 }}
                >
                  Next Step
                </button>
              ) : bookStep === 5 ? (
                <button 
                  onClick={findNearbyShops} 
                  disabled={!isStepValid(5) || fetchingShops} 
                  style={{ background: isStepValid(5) && !fetchingShops ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 12, fontWeight: 800, cursor: isStepValid(5) && !fetchingShops ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {fetchingShops ? 'Dispatching...' : <><Truck size={18} /> Request Tech Dispatch</>}
                </button>
              ) : (
                <button 
                  onClick={submitTicket} 
                  disabled={!isStepValid(6)} 
                  style={{ background: isStepValid(6) ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 12, fontWeight: 800, cursor: isStepValid(6) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Truck size={18} /> Request Tech Dispatch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {invoiceModal && (
        <InvoiceModal
          invoice={invoiceModal}
          onClose={() => setInvoiceModal(null)}
          onPaid={() => { fetchInvoices(); fetchTickets(); setInvoiceModal(null); }}
          showPayButton
          title="Rescue Invoice"
        />
      )}
    </div>
  );
}
