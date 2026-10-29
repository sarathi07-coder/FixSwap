import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Lock, Mail, Wrench } from 'lucide-react';
import { corporateSession, clearLegacySharedAuth } from '../auth/session';

export default function CorporateLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password, type: 'HOTEL_B2B' })
      });
      if (res.ok) {
        const data = await res.json();
        // Just standard user dashboard, but they are a B2B customer under the hood
        clearLegacySharedAuth();
        corporateSession.setAuth({
          userId: data.userId,
          userName: data.fullName,
          userRole: data.role,
          userEmail: data.email || email.trim(),
        });
        navigate('/corporate/dashboard');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Invalid Corporate credentials');
      }
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* Left side info */}
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'space-between', padding: 60, background: 'linear-gradient(135deg, #0B1120 0%, #1E293B 100%)', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', '@media (min-width: 1024px)': { display: 'flex' } }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)' }} />
        
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 60 }} onClick={() => navigate('/')}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} color="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 26, letterSpacing: '-0.5px', color: '#fff' }}>
              FixSwap <span style={{ color: '#06B6D4' }}>Corporate</span>
            </span>
          </div>
          
          <h1 style={{ fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px' }}>
            Enterprise Grade <br/>Appliance Care.
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 20, maxWidth: 400, lineHeight: 1.5 }}>
            SLA-backed repairs and zero downtime for hotels, offices, and large estates. Log in to manage your corporate assets.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-1px' }}>Corporate Login</h2>
            <p style={{ color: '#94A3B8', fontSize: 16 }}>Secure access to your enterprise dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Corporate Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="#64748B" style={{ position: 'absolute', left: 16, top: 16 }} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@yourcompany.com"
                  style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 48px', borderRadius: 12, color: '#fff', fontSize: 16, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  onFocus={e=>e.target.style.borderColor='#06B6D4'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Master Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="#64748B" style={{ position: 'absolute', left: 16, top: 16 }} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 16px 16px 48px', borderRadius: 12, color: '#fff', fontSize: 16, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  onFocus={e=>e.target.style.borderColor='#06B6D4'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>
            </div>
            
            <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #06B6D4, #0284C7)', color: '#fff', border: 'none', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 24px rgba(6,182,212,0.3)' }}>
              Access Dashboard <ArrowRight size={18} />
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <p style={{ color: '#64748B', fontSize: 15 }}>
              New enterprise client? <button onClick={() => navigate('/corporate/register')} style={{ background: 'none', border: 'none', color: '#06B6D4', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Request Access</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
