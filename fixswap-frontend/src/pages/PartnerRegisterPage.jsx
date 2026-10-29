import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Wrench, ArrowRight, Phone, Mail, Lock, FileText, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PartnerRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    shopName: '',
    taxId: '',
    address: ''
  });

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      alert("Please enter a valid business email address.");
      return;
    }
    setStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      alert("Please enter the 4-digit verification code.");
      return;
    }
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.shopName,
          phoneNumber: formData.phone,
          email: formData.email,
          password: formData.password,
          role: 'SHOP_OWNER',
          customerType: 'HOUSEHOLD', // Default for now, as role dictates access
          taxId: formData.taxId,
          address: formData.address
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Registration failed');
      }
      
      alert('Partner KYC Completed Successfully! Welcome to FixSwap.');
      navigate('/partner/login');
    } catch (err) {
      alert(err.message);
      setStep(1);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* Left Info Panel */}
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', padding: 60, background: 'linear-gradient(135deg, #0B1120 0%, #1E293B 100%)', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', '@media (min-width: 1024px)': { display: 'flex' } }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(234, 88, 12, 0.1) 0%, transparent 70%)' }} />
        <div style={{ zIndex: 1, marginTop: 'auto', marginBottom: 'auto' }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1px' }}>
            Service Partner Onboarding.
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 18, maxWidth: 400, lineHeight: 1.5, marginBottom: 40 }}>
            Join the elite network of appliance professionals and get guaranteed SLA work orders.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#CBD5E1', fontSize: 15, fontWeight: 500 }}><CheckCircle2 size={20} color="#EA580C" /> Real-time Dispatch Radar</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#CBD5E1', fontSize: 15, fontWeight: 500 }}><CheckCircle2 size={20} color="#EA580C" /> Technician Fleet Management</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#CBD5E1', fontSize: 15, fontWeight: 500 }}><CheckCircle2 size={20} color="#EA580C" /> High-Paying Corporate SLAs</div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', marginBottom: 20 }}>
              <Building size={28} color="#fff" />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-1px' }}>
              {step === 1 && "Create Partner Account"}
              {step === 2 && "Business KYC Details"}
              {step === 3 && "Identity Verification"}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 16 }}>
              {step === 1 && "Step 1: Admin Access Details"}
              {step === 2 && "Step 2: Shop Identity & Taxation"}
              {step === 3 && `Step 3: Secure code sent to ${formData.email}`}
            </p>
          </div>
          
          {step === 1 && (
            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Admin Credentials</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Admin Phone</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                      <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="9999999999" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Business Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="shop@domain.com" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Secure Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                    <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
              
              <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 24px rgba(234,88,12,0.3)' }}>
                Continue to Business KYC <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Shop Identity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Registered Shop Name</label>
                    <div style={{ position: 'relative' }}>
                      <Building size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                      <input type="text" required value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} placeholder="e.g. Metro Electronics" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Tax ID (GSTIN/VAT)</label>
                      <div style={{ position: 'relative' }}>
                        <FileText size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                        <input type="text" required value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} placeholder="Tax Number" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Primary Location</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                        <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="City, State" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, background: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.2)', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                  Back
                </button>
                <button type="submit" style={{ flex: 2, background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  Send OTP <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.2)', padding: 24, borderRadius: 16, textAlign: 'center' }}>
                <ShieldCheck size={36} color="#EA580C" style={{ marginBottom: 12 }} />
                <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Enter the 4-digit code (Use any 4 digits for demo)</p>
                <input 
                  type="text" 
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ width: 140, textAlign: 'center', letterSpacing: 10, background: '#0B1120', border: '2px solid #EA580C', padding: '16px', borderRadius: 12, color: '#fff', fontSize: 28, fontWeight: 900, outline: 'none' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(2)} style={{ flex: 1, background: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.2)', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                  Back
                </button>
                <button type="submit" style={{ flex: 2, background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(234,88,12,0.3)' }}>
                  Complete Registration
                </button>
              </div>
            </form>
          )}
          
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <p style={{ color: '#64748B', fontSize: 15 }}>
              Already registered? <button onClick={() => navigate('/partner/login')} style={{ background: 'none', border: 'none', color: '#EA580C', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Sign In</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
