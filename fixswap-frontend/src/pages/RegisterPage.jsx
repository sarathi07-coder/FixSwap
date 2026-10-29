import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowRight, User, Phone, Mail, Lock, ShieldCheck } from 'lucide-react';
import { customerSession, clearLegacySharedAuth } from '../auth/session';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: ''
  });

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      alert("Please enter the 4-digit OTP.");
      return;
    }
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phoneNumber: formData.phone,
          email: formData.email,
          password: formData.password,
          role: 'CUSTOMER'
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Registration failed');
      }
      
      // Auto-login after registration could go here, but let's just route to dashboard
      const data = await res.json();
      clearLegacySharedAuth();
      customerSession.setAuth({
        userId: data.userId,
        userName: data.fullName,
        userRole: data.role,
        userEmail: formData.email,
      });
      navigate('/dashboard');
      
    } catch (err) {
      alert(err.message);
      setStep(1); // Go back to let them fix it
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', marginBottom: 20 }}>
              <Wrench size={28} color="#fff" />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-1px' }}>
              {step === 1 ? "Create Account" : "Verify Email"}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 16 }}>
              {step === 1 ? "Join the zero-downtime repair network." : `We sent an OTP to ${formData.email}`}
            </p>
          </div>
          
          {step === 1 ? (
            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="John Doe" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="9999999999" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="you@example.com" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 18 }} />
                  <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 44px', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              
              <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', color: '#fff', border: 'none', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 24px rgba(6,182,212,0.3)' }}>
                Continue to Verify <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)', padding: 20, borderRadius: 16, textAlign: 'center' }}>
                <ShieldCheck size={32} color="#06B6D4" style={{ marginBottom: 12 }} />
                <p style={{ color: '#fff', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Enter the 4-digit code (Use any 4 digits for demo)</p>
                <input 
                  type="text" 
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ width: 120, textAlign: 'center', letterSpacing: 8, background: '#0B1120', border: '2px solid #06B6D4', padding: '16px', borderRadius: 12, color: '#fff', fontSize: 24, fontWeight: 900, outline: 'none' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, background: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.2)', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                  Back
                </button>
                <button type="submit" style={{ flex: 2, background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', color: '#fff', border: 'none', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(6,182,212,0.3)' }}>
                  Verify & Register
                </button>
              </div>
            </form>
          )}
          
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <p style={{ color: '#64748B', fontSize: 15 }}>
              Already have an account? <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#06B6D4', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Log In</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
