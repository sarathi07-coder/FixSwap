import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, LayoutDashboard, Package, Bell,
  TrendingUp, AlertTriangle, CheckCircle2, Star,
  User, LogOut, RefreshCw, Radio, Wallet, Zap, ShieldCheck, Users, Truck
} from 'lucide-react';
import { partnerSession } from '../../auth/session';
import InvoiceModal from '../../components/InvoiceModal';

const SC = {
  PENDING:  { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: 'Pending Dispatch' },
  ACCEPTED: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Accepted - En Route' },
  TECH_DISPATCHED: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: 'Courier at Hub — Loaner Handover' },
  ITEM_COLLECTED: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'Item Collected' },
  LOANER_GIVEN: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Loaner Handed Over' },
  DEVICE_SWAPPED: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', label: 'Device Swapped' },
  IN_REPAIR:{ bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', label: 'Repair in Progress' },
  REPAIR_DONE:{ bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'Repair Completed' },
  LOANER_COLLECTED_AT_HUB:{ bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'Courier Has Loaner — En Route' },
  EN_ROUTE_TO_CUSTOMER:{ bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Courier at Customer Doorstep' },
  EN_ROUTE_TO_HUB_DROP:{ bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: 'Courier Returning Device to Hub' },
  DROPPED_AT_HUB:{ bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'Dropped at Hub / Awaiting Repair' },
  REPAIRED_COLLECTED_AT_HUB:{ bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'Courier Has Repaired Unit' },
  AWAITING_RETURN_PICKUP:{ bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: 'Awaiting Return Courier' },
  RETURNING:{ bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'En Route to Delivery' },
  COMPLETED:{ bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'Completed' },
  DISPUTED: { bg: 'rgba(239, 68, 68, 0.1)',  text: '#EF4444', label: 'Disputed' },
  CANCELLED:{ bg: 'rgba(239, 68, 68, 0.1)',  text: '#EF4444', label: 'Cancelled' }
};

const IC = {
  AVAILABLE:     { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'Available' },
  LOANED_OUT:    { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Loaned Out' },
  IN_MAINTENANCE:{ bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: 'Maintenance' },
  RETIRED:       { bg: 'rgba(100, 116, 139, 0.1)', text: '#94A3B8', label: 'Retired' },
};

const NAV = [
  { id: 'overview',  label: 'Command Center',   icon: LayoutDashboard },
  { id: 'live',      label: 'Live Dispatches',  icon: Radio },
  { id: 'active',    label: 'Active Jobs',      icon: Wrench },
  { id: 'roster',    label: 'Technician Roster',icon: Users },
  { id: 'ledger',    label: 'Financial Ledger', icon: Wallet },
  { id: 'inventory', label: 'Parts Inventory',  icon: Package },
];

function StatCard({ label, value, sub, color, icon: Icon, glow }) {
  return (
    <div style={{ background: '#1E293B', borderRadius: 20, padding: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
      {glow && <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, opacity: 0.15 }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `rgba(${color === '#EA580C' ? '234, 88, 12' : color === '#10B981' ? '16, 185, 129' : '59, 130, 246'}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: color }}>Active</span>
      </div>
      <p style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-1px' }}>{value}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <p style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function ShopDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [allTickets, setAllTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [deliveryCouriers, setDeliveryCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = partnerSession.get('userName') || 'Service Partner';
  const shopId = partnerSession.get('shopId');

  // Worker Creation Modal
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({ fullName: '', phoneNumber: '', password: '' });
  const [shopInvoices, setShopInvoices] = useState([]);
  const [invoiceModal, setInvoiceModal] = useState(null);

  useEffect(() => { 
    if (!partnerSession.get('userId')) {
      navigate('/partner/login');
      return;
    }
    fetchAll(); 
    const interval = setInterval(() => {
        fetchAll();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    const userId = partnerSession.get('userId');
    if (!userId) return navigate('/partner/login');
    setLoading(true);
    try {
      const shopRes = await fetch(`/api/shop/owner/${userId}`);
      let shopId = userId;
      if (shopRes.ok) {
        const shops = await shopRes.json();
        if (shops && shops.length > 0) shopId = shops[0].shopId;
      }
      partnerSession.set('shopId', shopId);

      const [statsRes, ticketsRes, inventoryRes, workersRes, couriersRes, invoicesRes] = await Promise.all([
        fetch(`/api/shop/${shopId}/dashboard-stats`),
        fetch(`/api/tickets/shop/${shopId}`),
        fetch(`/api/shop/${shopId}/inventory`),
        fetch(`/api/shop/${shopId}/workers`),
        fetch('/api/worker/delivery/couriers'),
        fetch(`/api/invoices/shop/${shopId}`)
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (ticketsRes.ok) setAllTickets(await ticketsRes.json());
      if (inventoryRes.ok) setInventory(await inventoryRes.json());
      if (invoicesRes.ok) setShopInvoices(await invoicesRes.json());
      if (workersRes.ok) {
        const roster = await workersRes.json();
        setWorkers(roster.filter(w => w.workerType !== 'DELIVERY_COURIER'));
      }
      if (couriersRes.ok) setDeliveryCouriers(await couriersRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateWorker = async () => {
    try {
      const res = await fetch(`/api/shop/${shopId}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorker)
      });
      if (!res.ok) throw new Error('Failed to create worker');
      setShowAddWorker(false);
      setNewWorker({ fullName: '', phoneNumber: '', password: '' });
      fetchAll();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAccept = async (ticketId, selectedWorkerId) => {
    try {
      if (!selectedWorkerId) {
          throw new Error('Please select a technician to dispatch.');
      }
      const url = `/api/tickets/accept-and-assign?ticketId=${ticketId}&shopId=${shopId}&workerId=${selectedWorkerId}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to accept and assign dispatch');
      await fetchAll();
    } catch (e) { alert(e.message); }
  };

  const [assignModal, setAssignModal] = useState({ show: false, ticketId: null });
  const [assignMode, setAssignMode] = useState('IN_HOUSE');
  const [hubOtpModal, setHubOtpModal] = useState({ show: false, ticket: null, type: '' });
  const [hubOtpInput, setHubOtpInput] = useState('');
  const [hubOtpError, setHubOtpError] = useState('');

  const openHubOtp = (ticket, type) => {
    setHubOtpModal({ show: true, ticket, type });
    setHubOtpInput('');
    setHubOtpError('');
  };

  const getHubOtpToShare = () => {
    const t = hubOtpModal.ticket;
    if (!t) return '----';
    if (hubOtpModal.type === 'LOANER') return t.hubLoanerPickupOtp;
    if (hubOtpModal.type === 'DROP') return t.hubDeviceDropOtp;
    if (hubOtpModal.type === 'REPAIRED') return t.hubRepairedPickupOtp;
    return '----';
  };

  const handleVerifyHubOtp = async () => {
    const t = hubOtpModal.ticket;
    if (!t) return;
    const endpoints = {
      LOANER: `/api/tickets/${t.ticketId}/verify-shop-hub-loaner?otp=${hubOtpInput}`,
      DROP: `/api/tickets/${t.ticketId}/verify-shop-hub-device-drop?otp=${hubOtpInput}`,
      REPAIRED: `/api/tickets/${t.ticketId}/verify-shop-hub-repaired?otp=${hubOtpInput}`,
    };
    try {
      const res = await fetch(endpoints[hubOtpModal.type], { method: 'POST' });
      if (res.ok) {
        setHubOtpModal({ show: false, ticket: null, type: '' });
        setHubOtpInput('');
        fetchAll();
      } else {
        setHubOtpError('Invalid courier OTP. Ask the delivery partner for their code.');
      }
    } catch {
      setHubOtpError('Verification failed.');
    }
  };

  const handleAcceptDeliveryMode = async (ticketId) => {
    try {
      const url = `/api/tickets/accept-delivery-mode?ticketId=${ticketId}&shopId=${shopId}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to accept in Delivery Partner mode');
      await fetchAll();
    } catch (e) { alert(e.message); }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update ticket status');
      await fetchAll();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRequestReturn = async (ticketId) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/request-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to request return delivery');
      await fetchAll();
    } catch (e) {
      alert(e.message);
    }
  };

  const pendingTickets = allTickets.filter(t => t.status === 'PENDING');
  const activeTickets = allTickets.filter(t => t.status !== 'PENDING' && t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completedTickets = allTickets.filter(t => t.status === 'COMPLETED');

  const Sidebar = () => (
    <div style={{ width: 260, background: '#0B1120', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px', height: '100vh', position: 'sticky', top: 0, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 48 }} onClick={() => navigate('/')}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
          <Wrench size={22} color="#fff" />
        </div>
        <div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px', color: '#fff', display: 'block' }}>FixSwap</span>
          <span style={{ fontSize: 11, color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Partner Hub</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, paddingLeft: 12 }}>Operations</p>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12,
              border: 'none', background: active ? 'linear-gradient(90deg, rgba(234, 88, 12, 0.15) 0%, transparent 100%)' : 'transparent',
              color: active ? '#fff' : '#94A3B8', fontWeight: active ? 700 : 600,
              fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
            }}>
              <Icon size={18} color={active ? '#EA580C' : '#64748B'} />
              {label}
              {id === 'live' && pendingTickets.length > 0 && (
                <span style={{ position: 'absolute', right: 16, background: '#EF4444', color: '#fff', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
                  <span className="pulse-dot" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', display: 'inline-block', marginRight: 4 }} />
                  {pendingTickets.length} NEW
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => { partnerSession.clear(); navigate('/partner/login'); }} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
          <LogOut size={16} /> Partner Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: "'Inter',sans-serif", display: 'flex' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        {/* Topbar */}
        <div style={{ background: 'rgba(11, 17, 32, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0 }}>{NAV.find(n => n.id === tab)?.label}</h2>
            <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 4 }}>FixSwap Enterprise Dispatch Network</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span className="pulse-dot" style={{ width: 8, height: 8, background: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
              Accepting SLA Jobs
            </span>
            <button onClick={fetchAll} style={{ width: 40, height: 40, borderRadius: 12, background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='#334155'} onMouseLeave={e => e.currentTarget.style.background='#1E293B'}>
              <RefreshCw size={18} color="#94A3B8" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: '#1E293B', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #FF5A1F)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={14} color="#fff" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{userName}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ padding: 40, maxWidth: 1400, width: '100%', boxSizing: 'border-box' }}>
          
          {tab === 'overview' && (
            <div className="fade-in-up">
              {/* KPI Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 40 }}>
                <StatCard label="Lifetime Revenue" value={`₹${stats ? Number(stats.totalRevenue || 0).toLocaleString('en-IN') : '0'}`} sub="Enterprise & Retail" color="#10B981" icon={TrendingUp} glow />
                <StatCard label="Live Dispatches" value={pendingTickets.length} sub="Awaiting acceptance" color="#EA580C" icon={Radio} glow />
                <StatCard label="Active Repairs" value={activeTickets.length} sub="SLA tracking active" color="#3B82F6" icon={Wrench} glow />
                <StatCard label="Fleet Assets" value={stats ? `${stats.availableAssets} / ${stats.totalAssets}` : '—'} sub="Inventory available" color="#8B5CF6" icon={Package} glow />
              </div>

              {/* Activity Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* Recent Tickets */}
                <div style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Recent Command Center Activity</h3>
                    <button onClick={() => setTab('active')} style={{ fontSize: 13, fontWeight: 700, color: '#EA580C', background: 'none', border: 'none', cursor: 'pointer' }}>View All Jobs →</button>
                  </div>
                  
                  {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Syncing dispatch network...</div>
                  ) : allTickets.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                      <ShieldCheck size={48} color="#334155" style={{ marginBottom: 16 }} />
                      <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Network Online</p>
                      <p style={{ color: '#64748B', fontSize: 14 }}>Awaiting first incoming dispatch ping.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {allTickets.slice(0, 5).map(t => {
                        const s = SC[t.status] || SC.PENDING;
                        return (
                          <div key={t.ticketId} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                              <div style={{ width: 48, height: 48, borderRadius: 12, background: t.status === 'PENDING' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wrench size={20} color={t.status === 'PENDING' ? '#EA580C' : '#94A3B8'} />
                              </div>
                              <div>
                                <p style={{ fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 4 }}>{t.applianceBrand} {t.applianceProduct}</p>
                                <p style={{ fontSize: 13, color: '#64748B' }}>#{t.ticketId.substring(0,8)} · {new Date(t.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <span style={{ background: s.bg, color: s.text, padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 800 }}>{s.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Performance Summary */}
                <div style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', padding: 24, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Partner Rating</h3>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234, 88, 12, 0.2) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px dashed rgba(234, 88, 12, 0.5)' }}>
                      <span style={{ fontSize: 40, fontWeight: 900, color: '#fff' }}>{stats && stats.avgRating ? stats.avgRating.toFixed(1) : '5.0'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={20} color="#F59E0B" fill="#F59E0B" />)}
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>Based on {stats ? stats.totalReviews : 0} enterprise & customer reviews.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── LIVE DISPATCHES (RADAR) ── */}
          {tab === 'live' && (
            <div className="fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Radio size={28} color="#EA580C" /> Incoming Dispatch Radar
                  </h2>
                  <p style={{ color: '#94A3B8', fontSize: 16 }}>Accept new work orders before they are routed to other partners.</p>
                </div>
                {pendingTickets.length > 0 && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '8px 16px', borderRadius: 12, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <span className="pulse-dot" style={{ width: 8, height: 8, background: '#EF4444', borderRadius: '50%', display: 'inline-block' }} />
                    {pendingTickets.length} Ping(s) Waiting
                  </div>
                )}
              </div>

              {pendingTickets.length === 0 ? (
                <div style={{ padding: 80, textAlign: 'center', background: '#1E293B', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div className="radar-sweep" style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(234, 88, 12, 0.2)', margin: '0 auto 24px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radio size={32} color="#EA580C" style={{ opacity: 0.5 }} />
                  </div>
                  <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Scanning for SLA Jobs...</h3>
                  <p style={{ color: '#64748B', fontSize: 15 }}>Keep this tab open to instantly receive new enterprise and customer dispatches in your area.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
                  {pendingTickets.map(t => (
                    <div key={t.ticketId} className="ping-card" style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)', borderRadius: 24, border: '1px solid rgba(234, 88, 12, 0.3)', padding: 32, position: 'relative', overflow: 'hidden', boxShadow: '0 12px 40px rgba(234, 88, 12, 0.15)' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg, #FF5A1F, #EA580C)' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <div>
                          <span style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#EA580C', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, display: 'inline-block' }}>New Dispatch Ping</span>
                          <h3 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{t.applianceBrand} {t.applianceProduct}</h3>
                          <p style={{ color: '#94A3B8', fontSize: 14 }}>Priority Level: High SLA</p>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={24} color="#F59E0B" />
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, marginBottom: 24 }}>
                        <p style={{ color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Reported Issue</p>
                        <p style={{ color: '#fff', fontSize: 15, lineHeight: 1.5 }}>"{t.issueDescription}"</p>
                      </div>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <button onClick={() => setAssignModal({ show: true, ticketId: t.ticketId })} style={{ flex: 2, background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: '16px', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <CheckCircle2 size={20} /> Accept & Assign Dispatch
                        </button>
                        <button style={{ flex: 1, background: 'transparent', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.2)', padding: '16px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                          Pass
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVE JOBS (KANBAN/CARDS) ── */}
          {tab === 'active' && (
            <div className="fade-in-up">
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Active Jobs Board</h2>
              <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 32 }}>Manage your currently assigned technician workloads and SLAs.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {activeTickets.length === 0 && <div style={{ padding: 60, textAlign: 'center', background: '#1E293B', borderRadius: 20, color: '#64748B' }}>No active repairs in progress.</div>}
                {activeTickets.map(t => {
                  const s = SC[t.status] || SC.ACCEPTED;
                  return (
                    <div key={t.ticketId} style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', padding: '32px', display: 'flex', gap: 32, alignItems: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Wrench size={32} color="#3B82F6" />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ background: s.bg, color: s.text, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
                          <span style={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>Ticket #{t.ticketId.substring(0,8)}</span>
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>{t.applianceBrand} {t.applianceProduct}</h3>
                        <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.5, maxWidth: 800 }}>{t.issueDescription}</p>
                      </div>

                      <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200 }}>
                        {t.fulfillmentType === 'DELIVERY_PARTNER' ? (
                          <>
                            {t.status === 'ACCEPTED' && (
                              <div style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', padding: 8 }}>
                                Waiting for courier to claim pickup run...
                              </div>
                            )}
                            {t.status === 'TECH_DISPATCHED' && (
                              <button onClick={() => openHubOtp(t, 'LOANER')} style={{ width: '100%', background: '#F59E0B', color: '#000', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                                Courier at Hub — Verify OTP & Hand Loaner
                              </button>
                            )}
                            {['LOANER_COLLECTED_AT_HUB', 'EN_ROUTE_TO_CUSTOMER', 'LOANER_GIVEN'].includes(t.status) && (
                              <div style={{ color: '#3B82F6', fontSize: 13, textAlign: 'center', padding: 8, fontWeight: 700 }}>
                                Courier en route to customer...
                              </div>
                            )}
                            {t.status === 'EN_ROUTE_TO_HUB_DROP' && (
                              <button onClick={() => openHubOtp(t, 'DROP')} style={{ width: '100%', background: '#EA580C', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                                Courier Returning — Verify OTP & Receive Device
                              </button>
                            )}
                            {t.status === 'DROPPED_AT_HUB' && (
                              <button onClick={() => handleStatusUpdate(t.ticketId, 'IN_REPAIR')} style={{ width: '100%', background: '#3B82F6', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                                Start Shop Repair
                              </button>
                            )}
                            {t.status === 'IN_REPAIR' && (
                              <button onClick={() => handleStatusUpdate(t.ticketId, 'REPAIR_DONE')} style={{ width: '100%', background: '#10B981', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                                Mark Repair Done
                              </button>
                            )}
                            {t.status === 'REPAIR_DONE' && (
                              <button onClick={() => handleRequestReturn(t.ticketId)} style={{ width: '100%', background: '#EA580C', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                                Request Return Courier
                              </button>
                            )}
                            {t.status === 'AWAITING_RETURN_PICKUP' && (
                              <div style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', padding: 8 }}>
                                🚚 Waiting for return courier...
                              </div>
                            )}
                            {t.status === 'RETURNING' && (
                              <button onClick={() => openHubOtp(t, 'REPAIRED')} style={{ width: '100%', background: '#10B981', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                                Return Courier at Hub — Verify OTP & Hand Repaired Device
                              </button>
                            )}
                            {t.status === 'REPAIRED_COLLECTED_AT_HUB' && (
                              <div style={{ color: '#3B82F6', fontSize: 13, textAlign: 'center', padding: 8, fontWeight: 700 }}>
                                Courier delivering repaired device to customer...
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {!t.assignedWorker ? (
                              <button onClick={() => setAssignModal({ show: true, ticketId: t.ticketId })} style={{ width: '100%', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                Assign Technician
                              </button>
                            ) : (
                              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Assigned To</div>
                                <div style={{ color: '#fff', fontWeight: 700 }}>{t.assignedWorker.fullName}</div>
                              </div>
                            )}
                            {t.status !== 'COMPLETED' && (
                              <button onClick={() => handleStatusUpdate(t.ticketId, 'COMPLETED')} style={{ width: '100%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                Mark Completed
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── FINANCIAL LEDGER ── */}
          {tab === 'ledger' && (
            <div className="fade-in-up">
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Financial Ledger</h2>
              <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 32 }}>Completed jobs, enterprise SLA payouts, and total shop revenue.</p>
              
              <div style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', padding: 32, marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                  <div>
                    <p style={{ color: '#64748B', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Total Settled Revenue</p>
                    <h3 style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>₹{stats ? Number(stats.totalRevenue || 0).toLocaleString('en-IN') : '0'}</h3>
                  </div>
                  <button style={{ background: '#fff', color: '#0F172A', border: 'none', padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
                    Withdraw Funds
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Settled Jobs & Payouts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {shopInvoices.length === 0 && completedTickets.length === 0 && <div style={{ padding: 40, textAlign: 'center', background: '#1E293B', borderRadius: 16, color: '#64748B' }}>No completed jobs to display in ledger.</div>}
                {shopInvoices.map((inv) => (
                  <div key={inv.invoiceId} style={{ background: '#1E293B', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={24} color="#10B981" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 4 }}>{inv.applianceProduct} ({inv.applianceBrand})</p>
                        <p style={{ fontSize: 13, color: '#64748B' }}>#{inv.ticketShortId} • Customer paid: {inv.paymentStatus}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#10B981', fontSize: 20, fontWeight: 900 }}>+ ₹{Number(inv.shopPayout || 0).toLocaleString('en-IN')}</p>
                      <p style={{ color: '#64748B', fontSize: 12, fontWeight: 600 }}>Your shop payout</p>
                      <button onClick={() => setInvoiceModal(inv)} style={{ marginTop: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#EA580C', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View breakdown</button>
                    </div>
                  </div>
                ))}
                {completedTickets.filter(t => !shopInvoices.some(i => i.ticketId === t.ticketId)).map(t => (
                  <div key={t.ticketId} style={{ background: '#1E293B', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)', padding: 24, color: '#94A3B8', fontSize: 14 }}>
                    {t.applianceProduct} — invoice pending. Customer must complete delivery OTP first.
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── INVENTORY ── */}
          {tab === 'inventory' && (
            <div className="fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Parts & Loaner Inventory</h2>
                  <p style={{ color: '#94A3B8', fontSize: 16 }}>Manage spare parts and corporate loaner appliances.</p>
                </div>
                <button style={{ background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
                  + Add Asset
                </button>
              </div>

              {inventory.length === 0 ? (
                <div style={{ padding: 80, textAlign: 'center', background: '#1E293B', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Package size={48} color="#334155" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Empty Inventory Vault</p>
                  <p style={{ color: '#64748B', fontSize: 15 }}>You have not added any spare parts or loaner appliances yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }}>
                  {inventory.map(item => {
                    const ic = IC[item.status] || IC.AVAILABLE;
                    return (
                      <div key={item.assetId} style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', padding: 24, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={24} color="#94A3B8" />
                          </div>
                          <span style={{ background: ic.bg, color: ic.text, padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ic.label}</span>
                        </div>
                        <p style={{ fontWeight: 900, fontSize: 18, color: '#fff', marginBottom: 4 }}>{item.brand} {item.applianceCategory}</p>
                        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20, fontFamily: 'monospace' }}>SN: {item.serialNumber}</p>
                        
                        <div style={{ display: 'flex', gap: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ display: 'block', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Daily Rate</span>
                            <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>₹{item.dailyRentalRate}</span>
                          </div>
                          <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 12 }}>
                            <span style={{ display: 'block', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Cycles</span>
                            <span style={{ color: item.totalLifeCycles > 20 ? '#EF4444' : '#10B981', fontSize: 15, fontWeight: 800 }}>{item.totalLifeCycles} Uses</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TECHNICIAN ROSTER ── */}
          {tab === 'roster' && (
            <div className="fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Technician Roster</h2>
                  <p style={{ color: '#94A3B8', fontSize: 16 }}>Manage your fleet of field technicians and repair specialists.</p>
                </div>
                <button onClick={() => setShowAddWorker(true)} style={{ background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
                  + Add Worker
                </button>
              </div>

              {workers.length === 0 ? (
                <div style={{ padding: 80, textAlign: 'center', background: '#1E293B', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Users size={48} color="#334155" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Technicians Found</p>
                  <p style={{ color: '#64748B', fontSize: 15 }}>Create your first worker account to handle incoming dispatches.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }}>
                  {workers.map(worker => (
                    <div key={worker.workerId} style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={24} color={worker.isOnDuty ? '#10B981' : '#94A3B8'} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 900, fontSize: 18, color: '#fff' }}>{worker.fullName}</p>
                            <p style={{ fontSize: 13, color: '#64748B' }}>{worker.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12 }}>
                        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Current Status</span>
                        {worker.isOnDuty ? (
                          <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800 }}>ON DUTY</span>
                        ) : (
                          <span style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#94A3B8', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800 }}>OFF DUTY</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ADD WORKER MODAL (Multi-step KYC) */}
      {showAddWorker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#1E293B', width: '100%', maxWidth: 550, borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 64px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Register New Technician (Partner KYC)</h2>
            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>Collect mandatory identification and contact details to issue a dispatch license.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Full Name</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={newWorker.fullName || ''} onChange={e => setNewWorker({...newWorker, fullName: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Phone Number</label>
                <input type="text" placeholder="10-digit number" value={newWorker.phoneNumber || ''} onChange={e => setNewWorker({...newWorker, phoneNumber: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Email Address</label>
                <input type="email" placeholder="Email (optional)" value={newWorker.email || ''} onChange={e => setNewWorker({...newWorker, email: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Aadhaar/PAN Number</label>
                <input type="text" placeholder="Govt ID No." value={newWorker.idCardNo || ''} onChange={e => setNewWorker({...newWorker, idCardNo: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Driving License</label>
                <input type="text" placeholder="DL Number" value={newWorker.drivingLicenseNo || ''} onChange={e => setNewWorker({...newWorker, drivingLicenseNo: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Temporary Password</label>
                <input type="password" placeholder="Set an initial password" value={newWorker.password || ''} onChange={e => setNewWorker({...newWorker, password: e.target.value})} style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ background: 'rgba(234, 88, 12, 0.1)', padding: 16, borderRadius: 12, border: '1px solid rgba(234, 88, 12, 0.2)', marginBottom: 24 }}>
              <p style={{ color: '#EA580C', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} /> By creating this account, you confirm the KYC details have been verified physically by the shop manager.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowAddWorker(false)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 16, borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={handleCreateWorker} disabled={!newWorker.fullName || !newWorker.phoneNumber || !newWorker.idCardNo || !newWorker.password} style={{ flex: 2, background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', border: 'none', color: '#fff', padding: 16, borderRadius: 12, cursor: 'pointer', fontWeight: 800, opacity: (!newWorker.fullName || !newWorker.phoneNumber || !newWorker.idCardNo || !newWorker.password) ? 0.5 : 1 }}>Create Worker Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN WORKER MODAL */}
      {assignModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#1E293B', width: '100%', maxWidth: 500, borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Assign Ticket</h2>
            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>Select the fulfillment method for this service ticket.</p>
            
            {/* Toggle switch for Assign Mode */}
            <div style={{ display: 'flex', background: '#0F172A', padding: 4, borderRadius: 12, marginBottom: 24 }}>
              <button 
                onClick={() => setAssignMode('IN_HOUSE')} 
                style={{ flex: 1, padding: '10px', borderRadius: 8, background: assignMode === 'IN_HOUSE' ? 'linear-gradient(135deg, #FF5A1F, #EA580C)' : 'transparent', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                In-House Tech
              </button>
              <button 
                onClick={() => setAssignMode('DELIVERY_PARTNER')} 
                style={{ flex: 1, padding: '10px', borderRadius: 8, background: assignMode === 'DELIVERY_PARTNER' ? 'linear-gradient(135deg, #FF5A1F, #EA580C)' : 'transparent', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Delivery Courier
              </button>
            </div>

            {assignMode === 'IN_HOUSE' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 250, overflowY: 'auto', marginBottom: 24 }}>
                {workers.length === 0 && <p style={{ color: '#64748B', textAlign: 'center', padding: 20 }}>No workers registered. Add a worker in the Roster tab first.</p>}
                {workers.map(worker => (
                  <div key={worker.workerId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: worker.isOnDuty ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color={worker.isOnDuty ? '#10B981' : '#94A3B8'} />
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>{worker.fullName}</div>
                        <div style={{ color: '#64748B', fontSize: 12 }}>{worker.isOnDuty ? 'On Duty' : 'Off Duty'}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => { handleAccept(assignModal.ticketId, worker.workerId); setAssignModal({ show: false, ticketId: null }); }}
                      style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px 16px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                    >
                      Dispatch
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                  Verified delivery partners on the FixSwap network. Broadcast this job — on-duty couriers can claim it from their portal.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
                  {deliveryCouriers.length === 0 && (
                    <p style={{ color: '#64748B', textAlign: 'center', padding: 20 }}>No verified delivery couriers online yet. They can sign up at the Delivery Partner portal.</p>
                  )}
                  {deliveryCouriers.map(courier => (
                    <div key={courier.workerId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: courier.isOnDuty ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Truck size={16} color={courier.isOnDuty ? '#F59E0B' : '#94A3B8'} />
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 700 }}>{courier.fullName}</div>
                          <div style={{ color: '#64748B', fontSize: 12 }}>
                            {courier.phoneNumber || '—'} · {courier.vehicleType || 'BIKE'} · {courier.isOnDuty ? 'On Duty' : 'Off Duty'}
                          </div>
                        </div>
                      </div>
                      <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 800 }}>VERIFIED</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { handleAcceptDeliveryMode(assignModal.ticketId); setAssignModal({ show: false, ticketId: null }); }}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Truck size={18} /> Broadcast to All Delivery Couriers
                </button>
              </div>
            )}

            <button onClick={() => setAssignModal({ show: false, ticketId: null })} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 16, borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* HUB MUTUAL OTP MODAL — Partner verifies delivery courier at shop */}
      {hubOtpModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#1E293B', width: '100%', maxWidth: 440, borderRadius: 24, padding: 32, border: '1px solid rgba(234,88,12,0.3)' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
              {hubOtpModal.type === 'LOANER' && 'Hand Loaner to Courier'}
              {hubOtpModal.type === 'DROP' && 'Receive Broken Device from Courier'}
              {hubOtpModal.type === 'REPAIRED' && 'Hand Repaired Device to Courier'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 20 }}>Mutual OTP with delivery partner at your hub.</p>
            <div style={{ background: '#0B1120', padding: 20, borderRadius: 16, textAlign: 'center', marginBottom: 20 }}>
              <span style={{ color: '#EA580C', fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 6 }}>YOUR HUB OTP (tell courier)</span>
              <span style={{ color: '#fff', fontSize: 32, fontWeight: 900, letterSpacing: 6 }}>{getHubOtpToShare()}</span>
            </div>
            <label style={{ color: '#94A3B8', fontSize: 13, fontWeight: 700 }}>Enter Courier's OTP:</label>
            <input type="text" maxLength={4} value={hubOtpInput} onChange={e => setHubOtpInput(e.target.value)} placeholder="0000"
              style={{ width: '100%', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', fontSize: 28, fontWeight: 900, textAlign: 'center', letterSpacing: 10, margin: '8px 0 12px', boxSizing: 'border-box' }} />
            {hubOtpError && <p style={{ color: '#F87171', fontSize: 13, marginBottom: 12 }}>{hubOtpError}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setHubOtpModal({ show: false, ticket: null, type: '' })} style={{ flex: 1, padding: 14, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleVerifyHubOtp} disabled={hubOtpInput.length < 4} style={{ flex: 2, padding: 14, background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: hubOtpInput.length < 4 ? 0.5 : 1 }}>Verify Courier</button>
            </div>
          </div>
        </div>
      )}
      {invoiceModal && (
        <InvoiceModal invoice={invoiceModal} onClose={() => setInvoiceModal(null)} showPayButton={false} title="Partner payout statement" />
      )}
    </div>
  );
}
