import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, CheckCircle2, Box, Truck, ShieldCheck, RefreshCw, LogOut, ClipboardList, Map, Building2, ArrowRight } from 'lucide-react';
import { deliverySession } from '../../auth/session';

const STEP_LABELS = {
  TECH_DISPATCHED: 'Step 1: Partner Hub — Collect loaner (mutual OTP)',
  LOANER_COLLECTED_AT_HUB: 'Step 2: Go to customer with loaner',
  EN_ROUTE_TO_CUSTOMER: 'Step 3: Customer — Deliver loaner & collect device (mutual OTP)',
  LOANER_GIVEN: 'Step 4: Return broken device to Partner Hub',
  EN_ROUTE_TO_HUB_DROP: 'Step 5: Partner Hub — Drop device (mutual OTP)',
  RETURNING: 'Return run — Pick repaired device at hub (mutual OTP)',
  REPAIRED_COLLECTED_AT_HUB: 'Deliver repaired device to customer',
};

export default function DeliveryPartnerDashboard() {
  const navigate = useNavigate();
  const workerId = deliverySession.get('workerId');
  const workerName = deliverySession.get('workerName');

  const [isOnDuty, setIsOnDuty] = useState(false);
  const [activeRuns, setActiveRuns] = useState([]);
  const [availablePickups, setAvailablePickups] = useState([]);
  const [availableReturns, setAvailableReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpType, setOtpType] = useState('');
  const [currentJob, setCurrentJob] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [processingOtp, setProcessingOtp] = useState(false);
  const [courierEarnings, setCourierEarnings] = useState([]);

  useEffect(() => {
    if (!workerId) {
      navigate('/delivery/login');
      return;
    }
    syncData();
    const interval = setInterval(syncData, 5000);
    return () => clearInterval(interval);
  }, [workerId]);

  const syncData = async () => {
    if (!workerId) return;
    try {
      const [activeRes, pickupsRes, returnsRes, earningsRes] = await Promise.all([
        fetch(`/api/worker/${workerId}/delivery/active`),
        fetch('/api/worker/delivery/available-pickups'),
        fetch('/api/worker/delivery/available-returns'),
        fetch(`/api/invoices/courier/${workerId}`),
      ]);
      if (activeRes.ok) setActiveRuns(await activeRes.json());
      if (pickupsRes.ok) setAvailablePickups(await pickupsRes.json());
      if (returnsRes.ok) setAvailableReturns(await returnsRes.json());
      if (earningsRes.ok) setCourierEarnings(await earningsRes.json());
    } catch (e) {
      console.error('Sync error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleDuty = async () => {
    try {
      const newStatus = !isOnDuty;
      const res = await fetch(`/api/worker/${workerId}/duty?isOnDuty=${newStatus}`, { method: 'PUT' });
      if (res.ok) {
        setIsOnDuty(newStatus);
        syncData();
      }
    } catch {
      alert('Failed to update duty status.');
    }
  };

  const claimPickupRun = async (ticketId) => {
    const res = await fetch(`/api/tickets/${ticketId}/claim-pickup?workerId=${workerId}`, { method: 'POST' });
    if (res.ok) {
      setActiveTab('active');
      syncData();
    } else {
      alert((await res.text()) || 'Failed to claim pickup.');
    }
  };

  const claimReturnRun = async (ticketId) => {
    const res = await fetch(`/api/tickets/${ticketId}/claim-return?workerId=${workerId}`, { method: 'POST' });
    if (res.ok) {
      setActiveTab('active');
      syncData();
    } else {
      alert((await res.text()) || 'Failed to claim return.');
    }
  };

  const postAction = async (url) => {
    const res = await fetch(url, { method: 'POST' });
    if (res.ok) {
      syncData();
      return true;
    }
    alert((await res.text()) || 'Action failed.');
    return false;
  };

  const openOtp = (run, type) => {
    setCurrentJob(run);
    setOtpType(type);
    setOtpValue('');
    setOtpError('');
    setShowOtpModal(true);
  };

  const getCourierOtpToShow = () => {
    if (!currentJob) return '----';
    switch (otpType) {
      case 'HUB_LOANER': return currentJob.workerHubLoanerPickupOtp;
      case 'HUB_DROP': return currentJob.workerHubDeviceDropOtp;
      case 'HUB_REPAIRED': return currentJob.workerHubRepairedPickupOtp;
      case 'CUSTOMER_PICKUP': return currentJob.workerPickupOtp;
      case 'CUSTOMER_DELIVERY': return currentJob.workerDeliveryOtp;
      default: return '----';
    }
  };

  const getOtpEndpoint = () => {
    const id = currentJob.ticketId;
    switch (otpType) {
      case 'HUB_LOANER': return `/api/worker/jobs/${id}/verify-hub-loaner-pickup?otp=${otpValue}`;
      case 'HUB_DROP': return `/api/worker/jobs/${id}/verify-hub-device-drop?otp=${otpValue}`;
      case 'HUB_REPAIRED': return `/api/worker/jobs/${id}/verify-hub-repaired-pickup?otp=${otpValue}`;
      case 'CUSTOMER_PICKUP': return `/api/worker/jobs/${id}/verify-pickup?otp=${otpValue}`;
      case 'CUSTOMER_DELIVERY': return `/api/worker/jobs/${id}/verify-delivery?otp=${otpValue}`;
      default: return '';
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    setProcessingOtp(true);
    try {
      const res = await fetch(getOtpEndpoint(), { method: 'POST' });
      if (res.ok) {
        setShowOtpModal(false);
        setOtpValue('');
        setCurrentJob(null);
        syncData();
      } else {
        setOtpError('Invalid OTP. Ask the partner hub or customer for the correct code.');
      }
    } catch {
      setOtpError('Server error verifying OTP.');
    } finally {
      setProcessingOtp(false);
    }
  };

  const renderRunActions = (run) => {
    const s = run.status;
    const isReturnCourier = run.returnDeliveryPartner?.workerId === workerId
      || (run.returnDeliveryPartner && String(run.returnDeliveryPartner.workerId) === workerId);

    if (isReturnCourier || s === 'RETURNING' || s === 'REPAIRED_COLLECTED_AT_HUB') {
      if (s === 'RETURNING') {
        return (
          <button onClick={() => openOtp(run, 'HUB_REPAIRED')} style={btnPrimary}>
            <Building2 size={20} /> At Hub: Verify OTP & Pick Repaired Device
          </button>
        );
      }
      if (s === 'REPAIRED_COLLECTED_AT_HUB' && !run.deliveryOtp) {
        return (
          <button onClick={() => postAction(`/api/worker/jobs/${run.ticketId}/dispatch-return-to-customer`)} style={btnPrimary}>
            <ArrowRight size={20} /> Navigate to Customer with Repaired Device
          </button>
        );
      }
      if (s === 'REPAIRED_COLLECTED_AT_HUB' && run.deliveryOtp) {
        return (
          <button onClick={() => openOtp(run, 'CUSTOMER_DELIVERY')} style={btnGreen}>
            <ShieldCheck size={20} /> At Customer: Verify Return Delivery OTP
          </button>
        );
      }
      return null;
    }

    // Pickup leg
    if (s === 'TECH_DISPATCHED') {
      return (
        <button onClick={() => openOtp(run, 'HUB_LOANER')} style={btnPrimary}>
          <Building2 size={20} /> At Partner Hub: Verify OTP & Collect Loaner
        </button>
      );
    }
    if (s === 'LOANER_COLLECTED_AT_HUB') {
      return (
        <button onClick={() => postAction(`/api/worker/jobs/${run.ticketId}/dispatch-to-customer`)} style={btnPrimary}>
          <ArrowRight size={20} /> Loaner Secured — Go to Customer
        </button>
      );
    }
    if (s === 'EN_ROUTE_TO_CUSTOMER') {
      return (
        <button onClick={() => openOtp(run, 'CUSTOMER_PICKUP')} style={btnPrimary}>
          <ShieldCheck size={20} /> At Customer: Verify OTP, Give Loaner & Collect Device
        </button>
      );
    }
    if (s === 'LOANER_GIVEN') {
      return (
        <button onClick={() => postAction(`/api/worker/jobs/${run.ticketId}/start-hub-device-drop`)} style={btnBlue}>
          <Building2 size={20} /> Broken Device Collected — Return to Partner Hub
        </button>
      );
    }
    if (s === 'EN_ROUTE_TO_HUB_DROP') {
      return (
        <button onClick={() => openOtp(run, 'HUB_DROP')} style={btnPrimary}>
          <Building2 size={20} /> At Hub: Verify OTP & Drop Broken Device
        </button>
      );
    }
    if (s === 'DROPPED_AT_HUB') {
      return (
        <p style={{ color: '#10B981', fontSize: 14, fontWeight: 700, textAlign: 'center', margin: 0 }}>
          Pickup leg complete. Hub will repair the device.
        </p>
      );
    }
    return null;
  };

  const btnPrimary = { width: '100%', background: '#F59E0B', color: '#000', border: 'none', padding: 18, borderRadius: 16, fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' };
  const btnGreen = { ...btnPrimary, background: '#10B981', color: '#fff' };
  const btnBlue = { ...btnPrimary, background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff' };

  return (
    <div style={{ minHeight: '100vh', background: '#090D1A', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", paddingBottom: 100 }}>
      <header style={{ background: '#111827', padding: '20px 24px', borderBottom: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 800, textTransform: 'uppercase' }}>Delivery Partner</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{workerName || 'Courier'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={syncData} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={() => { deliverySession.clear(); navigate('/delivery/login'); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#FCA5A5', padding: '0 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ margin: '24px', background: isOnDuty ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#1E293B', padding: 24, borderRadius: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{isOnDuty ? 'ON SHIFT' : 'OFF SHIFT'}</h2>
          <p style={{ color: isOnDuty ? '#FEF3C7' : '#94A3B8', fontSize: 14, margin: 0 }}>Hub → Customer → Hub (mutual OTP each stop)</p>
        </div>
        <button onClick={toggleDuty} style={{ width: 60, height: 60, borderRadius: '50%', background: isOnDuty ? '#fff' : '#0F172A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Power size={28} color={isOnDuty ? '#D97706' : '#94A3B8'} />
        </button>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 24, gap: 16 }}>
          <button onClick={() => setActiveTab('active')} style={{ background: 'transparent', border: 'none', color: activeTab === 'active' ? '#F59E0B' : '#94A3B8', fontWeight: 800, padding: '12px 16px', cursor: 'pointer', borderBottom: activeTab === 'active' ? '3px solid #F59E0B' : '3px solid transparent' }}>
            Active Runs ({activeRuns.length})
          </button>
          <button onClick={() => setActiveTab('available')} style={{ background: 'transparent', border: 'none', color: activeTab === 'available' ? '#F59E0B' : '#94A3B8', fontWeight: 800, padding: '12px 16px', cursor: 'pointer', borderBottom: activeTab === 'available' ? '3px solid #F59E0B' : '3px solid transparent' }}>
            Available ({availablePickups.length + availableReturns.length})
          </button>
          <button onClick={() => setActiveTab('earnings')} style={{ background: 'transparent', border: 'none', color: activeTab === 'earnings' ? '#F59E0B' : '#94A3B8', fontWeight: 800, padding: '12px 16px', cursor: 'pointer', borderBottom: activeTab === 'earnings' ? '3px solid #F59E0B' : '3px solid transparent' }}>
            Earnings
          </button>
        </div>

        {activeTab === 'earnings' ? (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
              <p style={{ color: '#FEF3C7', fontSize: 13, margin: '0 0 8px', fontWeight: 700 }}>Total courier earnings (paid jobs)</p>
              <h2 style={{ color: '#fff', fontSize: 36, fontWeight: 900, margin: 0 }}>
                ₹{courierEarnings.reduce((sum, inv) => sum + Number(inv.courierPickupPayout || 0) + Number(inv.courierReturnPayout || 0), 0).toLocaleString('en-IN')}
              </h2>
            </div>
            {courierEarnings.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', background: '#111827', borderRadius: 16, color: '#6B7280' }}>Complete delivery runs to see payouts here.</div>
            ) : (
              courierEarnings.map((inv) => (
                <div key={inv.invoiceId} style={{ background: '#1F2937', borderRadius: 16, padding: 20, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: '#fff', fontWeight: 800, margin: '0 0 4px' }}>{inv.applianceProduct}</p>
                  <p style={{ color: '#64748B', fontSize: 13, margin: '0 0 12px' }}>#{inv.ticketShortId} • {inv.paymentStatus}</p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {Number(inv.courierPickupPayout) > 0 && (
                      <span style={{ color: '#F59E0B', fontWeight: 700 }}>Pickup leg: ₹{Number(inv.courierPickupPayout).toLocaleString('en-IN')}</span>
                    )}
                    {Number(inv.courierReturnPayout) > 0 && (
                      <span style={{ color: '#10B981', fontWeight: 700 }}>Return leg: ₹{Number(inv.courierReturnPayout).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'active' ? (
          activeRuns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: '#111827', borderRadius: 24, color: '#6B7280' }}>No active runs. Claim a job from Available.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {activeRuns.map(run => (
                <div key={run.ticketId} style={{ background: '#1F2937', borderRadius: 24, border: '1px solid rgba(245, 158, 11, 0.2)', overflow: 'hidden' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '14px 20px', borderBottom: '1px solid rgba(245, 158, 11, 0.15)' }}>
                    <div style={{ color: '#F59E0B', fontSize: 12, fontWeight: 800 }}>{STEP_LABELS[run.status] || run.status}</div>
                  </div>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 16px' }}>{run.applianceProduct} ({run.applianceBrand})</h3>
                    <div style={{ background: '#111827', padding: 16, borderRadius: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <Building2 size={18} color="#EA580C" />
                        <div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Partner Hub (visit first)</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{run.shop?.shopName || 'Service Shop'}</div>
                          <div style={{ fontSize: 13, color: '#64748B' }}>{run.shop?.address}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                        <MapPin size={18} color="#F59E0B" />
                        <div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Customer (after hub)</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{run.customerAddress || 'Customer location'}</div>
                        </div>
                      </div>
                    </div>
                    {renderRunActions(run)}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          !isOnDuty ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#FCA5A5' }}>Turn ON SHIFT to claim jobs.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <section>
                <h3 style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>PICKUP RUNS — Hub first, then customer</h3>
                {availablePickups.map(item => (
                  <div key={item.ticketId} style={{ background: '#1F2937', padding: 20, borderRadius: 20, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 800 }}>{item.applianceProduct}</h4>
                      <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>Hub: {item.shop?.shopName}</p>
                    </div>
                    <button onClick={() => claimPickupRun(item.ticketId)} style={{ background: '#F59E0B', color: '#000', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Claim</button>
                  </div>
                ))}
              </section>
              <section>
                <h3 style={{ color: '#9CA3AF', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>RETURN RUNS — Hub pickup, then customer</h3>
                {availableReturns.map(item => (
                  <div key={item.ticketId} style={{ background: '#1F2937', padding: 20, borderRadius: 20, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 800 }}>{item.applianceProduct}</h4>
                      <p style={{ color: '#9CA3AF', fontSize: 13, margin: '4px 0 0' }}>Hub: {item.shop?.shopName}</p>
                    </div>
                    <button onClick={() => claimReturnRun(item.ticketId)} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Claim Return</button>
                  </div>
                ))}
              </section>
            </div>
          )
        )}
      </div>

      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1F2937', width: '100%', maxWidth: 500, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '36px 28px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Mutual OTP Verification</h2>
            <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 20 }}>
              {otpType.startsWith('HUB')
                ? 'Tell this OTP to the Partner Hub staff, then enter the OTP they give you.'
                : 'Tell this OTP to the customer, then enter the OTP they give you.'}
            </p>
            <div style={{ background: '#111827', padding: 20, borderRadius: 16, textAlign: 'center', marginBottom: 20 }}>
              <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 6 }}>YOUR OTP (share with them)</span>
              <span style={{ color: '#fff', fontSize: 32, fontWeight: 900, letterSpacing: 6 }}>{getCourierOtpToShow()}</span>
            </div>
            <label style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 700 }}>Enter their OTP:</label>
            <input type="text" maxLength={4} placeholder="0000" value={otpValue} onChange={e => setOtpValue(e.target.value)}
              style={{ width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', padding: 18, borderRadius: 16, color: '#fff', fontSize: 28, fontWeight: 900, textAlign: 'center', letterSpacing: 12, margin: '8px 0 16px', boxSizing: 'border-box' }} />
            {otpError && <p style={{ color: '#FCA5A5', fontSize: 13, textAlign: 'center' }}>{otpError}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={() => setShowOtpModal(false)} style={{ flex: 1, padding: 16, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, color: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleVerifyOtp} disabled={otpValue.length < 4 || processingOtp} style={{ flex: 2, padding: 16, background: '#F59E0B', border: 'none', borderRadius: 14, color: '#000', fontWeight: 800, cursor: 'pointer', opacity: otpValue.length < 4 ? 0.5 : 1 }}>
                {processingOtp ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
