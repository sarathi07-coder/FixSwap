import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ChevronRight, Check } from 'lucide-react';

export default function WorkerSignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', phoneNumber: '', email: '', password: '',
    idCardNo: '', drivingLicenseNo: '', vehicleType: 'BIKE', aadharReference: '',
    workerType: 'FIELD_TECHNICIAN'
  });
  
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const sendOtp = async () => {
    if (formData.phoneNumber.length < 10) return alert("Enter valid phone number");
    setLoading(true);
    try {
      await fetch(`/api/worker-onboarding/send-otp?phone=${formData.phoneNumber}`, { method: 'POST' });
      setOtpSent(true);
    } catch(e) { alert("Failed to send OTP"); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/worker-onboarding/verify-otp?phone=${formData.phoneNumber}&otp=${otp}`, { method: 'POST' });
      if (res.ok) {
        setOtpVerified(true);
        setStep(2);
      } else {
        alert("Invalid OTP");
      }
    } catch(e) { alert("Failed to verify OTP"); }
    finally { setLoading(false); }
  };

  const registerWorker = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/worker-onboarding/register-independent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        navigate('/worker/login?registered=true');
      } else {
        const err = await res.text();
        alert("Registration failed: " + err);
      }
    } catch(e) { alert("Server error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", display: 'flex' }}>
      {/* Left Banner */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #14B8A6, #0D9488)', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }} />
        <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 24, position: 'relative', zIndex: 1 }}>Join the FixSwap Fleet</h1>
        <p style={{ fontSize: 18, color: '#CCFBF1', lineHeight: 1.6, position: 'relative', zIndex: 1, maxWidth: 400 }}>
          Complete your KYC verification in 3 simple steps and start earning on your own schedule.
        </p>
        
        <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: step >= 1 ? 1 : 0.5 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: step > 1 ? '#fff' : 'transparent', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {step > 1 ? <Check size={16} color="#0D9488" /> : <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>1</span>}
            </div>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Phone Verification</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: step >= 2 ? 1 : 0.5 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: step > 2 ? '#fff' : 'transparent', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {step > 2 ? <Check size={16} color="#0D9488" /> : <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>2</span>}
            </div>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Personal Details</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: step >= 3 ? 1 : 0.5 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: step > 3 ? '#fff' : 'transparent', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {step > 3 ? <Check size={16} color="#0D9488" /> : <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>3</span>}
            </div>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Document Upload (KYC)</span>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div style={{ flex: 1.2, padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#0F172A' }}>
        
        {step === 1 && (
          <div className="fade-in-up">
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Let's get started</h2>
            <p style={{ color: '#94A3B8', marginBottom: 40 }}>Enter your mobile number to begin verification.</p>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Mobile Number</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="text" placeholder="10-digit number" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} disabled={otpSent} style={{ flex: 1, background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', fontSize: 16 }} />
                {!otpSent && (
                  <button onClick={sendOtp} disabled={loading} style={{ background: '#14B8A6', color: '#fff', border: 'none', padding: '0 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {otpSent && !otpVerified && (
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Enter 4-digit OTP</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input type="number" placeholder="0000" value={otp} onChange={e => setOtp(e.target.value)} style={{ flex: 1, background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', fontSize: 24, letterSpacing: '8px', fontWeight: 800 }} />
                  <button onClick={verifyOtp} disabled={loading} style={{ background: '#14B8A6', color: '#fff', border: 'none', padding: '0 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 32 }}>Already registered? <span onClick={() => navigate('/worker/login')} style={{ color: '#14B8A6', cursor: 'pointer', fontWeight: 600 }}>Login here</span></p>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in-up">
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Personal Details</h2>
            <p style={{ color: '#94A3B8', marginBottom: 40 }}>Set up your basic profile.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Full Name (As per ID)</label>
                <input type="text" placeholder="e.g. Rahul Kumar" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Email Address</label>
                <input type="email" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Create Password</label>
                <input type="password" placeholder="At least 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <button onClick={() => setStep(3)} disabled={!formData.fullName || !formData.password} style={{ width: '100%', background: 'linear-gradient(135deg, #14B8A6, #0D9488)', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (!formData.fullName || !formData.password) ? 0.5 : 1 }}>
              Next: KYC Documents <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in-up">
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>KYC & Vehicle Details</h2>
            <p style={{ color: '#94A3B8', marginBottom: 40 }}>Mandatory government ID and vehicle registration.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Aadhaar or PAN Number</label>
                <input type="text" placeholder="Government ID Reference" value={formData.idCardNo} onChange={e => setFormData({...formData, idCardNo: e.target.value, aadharReference: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Registration Role</label>
                <select value={formData.workerType} onChange={e => setFormData({...formData, workerType: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}>
                  <option value="FIELD_TECHNICIAN">Independent Field Repair Technician</option>
                  <option value="DELIVERY_COURIER">Logistics & Delivery Partner (Zomato/Swiggy Style)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Driving License Number</label>
                <input type="text" placeholder="Valid DL No." value={formData.drivingLicenseNo} onChange={e => setFormData({...formData, drivingLicenseNo: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Vehicle Type</label>
                <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="BIKE">Motorbike / Scooter</option>
                  <option value="CYCLE">Bicycle</option>
                </select>
              </div>
            </div>

            <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: 16, borderRadius: 12, border: '1px solid rgba(20, 184, 166, 0.2)', marginBottom: 32 }}>
              <p style={{ color: '#14B8A6', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} /> By submitting, you agree to a background verification check.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 16, borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>Back</button>
              <button onClick={registerWorker} disabled={!formData.idCardNo || !formData.drivingLicenseNo || loading} style={{ flex: 2, background: 'linear-gradient(135deg, #14B8A6, #0D9488)', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (!formData.idCardNo || !formData.drivingLicenseNo) ? 0.5 : 1 }}>
                {loading ? 'Submitting...' : 'Submit KYC & Apply'} <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
