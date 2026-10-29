import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, CheckCircle2, Box, Navigation, Wrench, ShieldCheck, Zap } from 'lucide-react';
import { workerSession } from '../../auth/session';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const workerId = workerSession.get('workerId');
  const workerName = workerSession.get('workerName');
  const shopId = workerSession.get('shopId');
  
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // OTP Modals
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpType, setOtpType] = useState(''); // 'PICKUP' or 'DELIVERY'
  const [currentJob, setCurrentJob] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (!workerId) {
      navigate('/worker/login');
      return;
    }
    // Set initial duty status in a real app via API, here defaulting to false
    fetchJobs();
  }, [workerId]);

  const toggleDuty = async () => {
    try {
      const newStatus = !isOnDuty;
      await fetch(`/api/worker/${workerId}/duty?isOnDuty=${newStatus}`, { method: 'PUT' });
      setIsOnDuty(newStatus);
    } catch (e) {
      alert("Failed to update duty status.");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/worker/${workerId}/tickets/active`);
      if (res.ok) {
        const myJobs = await res.json();
        setActiveJobs(myJobs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const advanceJobState = async (ticketId, action) => {
    try {
      // 'dispatch' means leaving shop to pickup
      if (action === 'dispatch') {
        await fetch(`/api/tickets/${ticketId}/dispatch`, { method: 'POST' });
      } else if (action === 'loaner') {
        await fetch(`/api/worker/jobs/${ticketId}/handover-loaner?assetId=00000000-0000-0000-0000-000000000000`, { method: 'POST' }); // Dummy UUID for now
      } else if (action === 'start_repair') {
        await fetch(`/api/tickets/${ticketId}/status`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'IN_REPAIR' })
        });
      } else if (action === 'repair_done') {
        await fetch(`/api/tickets/${ticketId}/status`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REPAIR_DONE' })
        });
      } else if (action === 'return_transit') {
        await fetch(`/api/tickets/${ticketId}/status`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'RETURNING' })
        });
      }
      fetchJobs();
    } catch (e) {
      alert("Action failed: " + e.message);
    }
  };

  const verifyOtp = async () => {
    setOtpError('');
    try {
      let endpoint = '';
      if (otpType === 'PICKUP') {
        endpoint = `/api/worker/jobs/${currentJob.ticketId}/verify-pickup?otp=${otpValue}`;
      } else {
        endpoint = `/api/worker/jobs/${currentJob.ticketId}/verify-delivery?otp=${otpValue}`;
      }
      
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        setShowOtpModal(false);
        setOtpValue('');
        setCurrentJob(null);
        fetchJobs();
      } else {
        setOtpError("Invalid OTP. Try again.");
      }
    } catch (e) {
      setOtpError("Server error verifying OTP.");
    }
  };

  const logout = () => {
    workerSession.clear();
    navigate('/worker/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", paddingBottom: 100 }}>
      {/* App Bar */}
      <div style={{ background: '#0F172A', padding: '20px 24px', borderBottom: '1px solid rgba(20, 184, 166, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: '#14B8A6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Technician</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{workerName || 'Worker'}</div>
        </div>
        <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: 14, fontWeight: 700 }}>Log Out</button>
      </div>

      {/* Duty Toggle Card */}
      <div style={{ margin: '24px', background: isOnDuty ? 'linear-gradient(135deg, #14B8A6, #0D9488)' : '#1E293B', padding: 24, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: isOnDuty ? '0 10px 25px rgba(20, 184, 166, 0.4)' : 'none', transition: 'all 0.3s' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{isOnDuty ? 'You are ON DUTY' : 'You are OFF DUTY'}</h2>
          <p style={{ color: isOnDuty ? '#CCFBF1' : '#94A3B8', fontSize: 14 }}>{isOnDuty ? 'Searching for nearby rescue jobs...' : 'Toggle to start receiving jobs'}</p>
        </div>
        <button onClick={toggleDuty} style={{ width: 64, height: 64, borderRadius: '50%', background: isOnDuty ? '#fff' : '#0F172A', border: isOnDuty ? 'none' : '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
          <Power size={32} color={isOnDuty ? '#0D9488' : '#94A3B8'} />
        </button>
      </div>

      {/* Jobs Feed */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>Active Dispatch Assignments</h3>
          <button onClick={fetchJobs} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: 100, fontSize: 12 }}>Refresh</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#14B8A6' }}>Syncing...</div>
        ) : activeJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0F172A', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Box size={40} color="#334155" style={{ marginBottom: 16 }} />
            <h4 style={{ fontSize: 16, color: '#fff', marginBottom: 4 }}>No Active Jobs</h4>
            <p style={{ color: '#64748B', fontSize: 14 }}>Enjoy your coffee break!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeJobs.map(job => (
              <div key={job.ticketId} style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(20, 184, 166, 0.3)', overflow: 'hidden' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '12px 20px', borderBottom: '1px solid rgba(20, 184, 166, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#14B8A6', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{job.status}</span>
                  <span style={{ color: '#94A3B8', fontSize: 12 }}>ID: {job.ticketId.substring(0,8)}</span>
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{job.applianceProduct} ({job.applianceBrand})</h3>
                  <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 16 }}>{job.issueDescription}</p>
                  
                  <div style={{ background: '#0F172A', padding: 12, borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
                    <MapPin size={18} color="#14B8A6" style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>Customer Location</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{job.customerAddress}</div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS BASED ON STATE */}
                  {job.status === 'ACCEPTED' && (
                    <button onClick={() => advanceJobState(job.ticketId, 'dispatch')} style={{ width: '100%', background: '#14B8A6', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Box size={18} /> Pick up Loaner from Hub & Navigate to Customer
                    </button>
                  )}
                  {job.status === 'TECH_DISPATCHED' && (
                    <button onClick={() => { setCurrentJob(job); setOtpType('PICKUP'); setShowOtpModal(true); }} style={{ width: '100%', background: '#F59E0B', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <ShieldCheck size={18} /> Arrived: Enter Pickup OTP (1234)
                    </button>
                  )}
                  {job.status === 'ITEM_COLLECTED' && (
                    <button onClick={() => advanceJobState(job.ticketId, 'loaner')} style={{ width: '100%', background: '#14B8A6', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <CheckCircle2 size={18} /> Handover Loaner to Customer
                    </button>
                  )}
                  {job.status === 'LOANER_GIVEN' && (
                    <button onClick={() => advanceJobState(job.ticketId, 'start_repair')} style={{ width: '100%', background: '#3B82F6', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Wrench size={18} /> Start Repair
                    </button>
                  )}
                  {job.status === 'IN_REPAIR' && (
                    <button onClick={() => advanceJobState(job.ticketId, 'repair_done')} style={{ width: '100%', background: '#10B981', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <CheckCircle2 size={18} /> Mark Repair Done
                    </button>
                  )}
                  {job.status === 'REPAIR_DONE' && (
                    <button onClick={() => advanceJobState(job.ticketId, 'return_transit')} style={{ width: '100%', background: '#14B8A6', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Navigation size={18} /> Start Navigation (Return)
                    </button>
                  )}
                  {job.status === 'RETURNING' && (
                    <button onClick={() => { setCurrentJob(job); setOtpType('DELIVERY'); setShowOtpModal(true); }} style={{ width: '100%', background: '#F59E0B', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <ShieldCheck size={18} /> Enter Delivery OTP (1234)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1E293B', width: '100%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, borderTop: '1px solid rgba(20, 184, 166, 0.3)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{otpType} Mutual Verification</h2>
            
            {/* Display Worker's OTP for Customer to verify */}
            <div style={{ background: '#0F172A', padding: 16, borderRadius: 16, border: '1px solid rgba(20, 184, 166, 0.2)', marginBottom: 20 }}>
              <span style={{ color: '#14B8A6', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Your Verification OTP (Tell the Customer)</span>
              <span style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '4px' }}>
                {otpType === 'PICKUP' ? currentJob.workerPickupOtp : currentJob.workerDeliveryOtp}
              </span>
            </div>

            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 12 }}>Enter the Customer's 4-digit OTP shown on their dashboard:</p>
            
            <input 
              type="number" 
              placeholder="0000" 
              value={otpValue} 
              onChange={e => setOtpValue(e.target.value)}
              style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: 16, color: '#fff', fontSize: 32, fontWeight: 900, textAlign: 'center', letterSpacing: '12px', marginBottom: 16, outline: 'none' }} 
            />
            
            {otpError && <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>{otpError}</p>}
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setShowOtpModal(false); setOtpValue(''); setOtpError(''); }} style={{ flex: 1, padding: 16, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontWeight: 700 }}>Cancel</button>
              <button onClick={verifyOtp} disabled={otpValue.length < 4} style={{ flex: 2, padding: 16, background: 'linear-gradient(135deg, #14B8A6, #0D9488)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, opacity: otpValue.length < 4 ? 0.5 : 1 }}>Verify Customer OTP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
