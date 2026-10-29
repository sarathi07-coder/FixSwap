import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Building, Eye, EyeOff, ArrowRight, Wrench } from 'lucide-react';
import { partnerSession, clearLegacySharedAuth } from '../auth/session';

export default function PartnerLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.message === 'Invalid password') {
          throw new Error('Invalid password. Use shop@test.com with password password123');
        }
        throw new Error(data.message || data.error || 'Invalid email or password');
      }
      
      // Strict role check for partner login
      if (data.role !== 'SHOP_OWNER') {
        throw new Error('This login is for Partners only. Please use the Customer Login.');
      }

      clearLegacySharedAuth();
      partnerSession.setAuth({
        userId: data.userId,
        userName: data.fullName,
        role: data.role,
      });
      navigate('/partner/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* Left side info */}
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'space-between', padding: 60, background: 'linear-gradient(135deg, #0B1120 0%, #1E293B 100%)', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', '@media (min-width: 1024px)': { display: 'flex' } }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(234, 88, 12, 0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)' }} />
        
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 60 }} onClick={() => navigate('/')}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={24} color="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 26, letterSpacing: '-0.5px', color: '#fff' }}>
              FixSwap <span style={{ color: '#EA580C' }}>Partners</span>
            </span>
          </div>
          
          <h1 style={{ fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px' }}>
            The Ultimate <br/>Dispatch Center.
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 20, maxWidth: 400, lineHeight: 1.5 }}>
            Receive high-paying SLAs, deploy your technicians, and manage inventory with our real-time radar system.
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-1px' }}>Partner Login</h2>
            <p style={{ color: '#94A3B8', fontSize: 16 }}>Access the Service Partner Command Center.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', padding: '16px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ display: 'block', color: '#CBD5E1', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Business Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="#64748B" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  required
                  placeholder="shop@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 16px 16px 48px', borderRadius: 12, fontSize: 16, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#EA580C'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#CBD5E1', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="#64748B" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type={showPwd ? 'text' : 'password'} 
                  required
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 48px 16px 48px', borderRadius: 12, fontSize: 16, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#EA580C'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748B' }}>
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8, boxShadow: '0 8px 24px rgba(234,88,12,0.3)', transition: 'all 0.2s' }}>
              {loading ? 'Authenticating...' : 'Access Command Center'} <ArrowRight size={20} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 32, color: '#94A3B8' }}>
            Need to register a new shop?{' '}
            <span onClick={() => navigate('/partner/register')} style={{ color: '#EA580C', fontWeight: 700, cursor: 'pointer' }}>
              Complete KYC Wizard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
