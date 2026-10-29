import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Phone, Lock, LogIn } from 'lucide-react';
import { workerSession, clearLegacySharedAuth } from '../../auth/session';

export default function WorkerLoginPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedPhone = phoneNumber.trim();
    const trimmedPassword = password.trim();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: trimmedPhone, password: trimmedPassword, roleType: 'RESCUE_WORKER' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.message === 'Invalid password') {
          throw new Error('Invalid password. Sarathi uses worker123 (not password123).');
        }
        throw new Error(data.message || 'Invalid technician credentials');
      }
      clearLegacySharedAuth();
      workerSession.setAuth({
        workerId: data.userId,
        workerName: data.fullName || 'Technician',
        shopId: data.shopId || '',
      });
      navigate('/worker/dashboard');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#1E293B', padding: '40px', borderRadius: 24, border: '1px solid rgba(20, 184, 166, 0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #14B8A6, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(20, 184, 166, 0.4)' }}>
          <Wrench size={32} color="#fff" />
        </div>
        
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.5px' }}>Technician Portal</h1>
        <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 32 }}>Enter your FixSwap credentials to start your shift.</p>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 700 }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <Phone size={20} color="#94A3B8" style={{ position: 'absolute', top: 16, left: 16 }} />
            <input 
              type="text" 
              placeholder="Phone Number" 
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value)} 
              required
              style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#14B8A6'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock size={20} color="#94A3B8" style={{ position: 'absolute', top: 16, left: 16 }} />
            <input 
              type="password" 
              placeholder="Secure Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
              style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#14B8A6'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #14B8A6, #0F766E)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            <LogIn size={20} /> Login & Start Shift
          </button>
        </form>
        
        <p style={{ marginTop: 24, fontSize: 12, color: '#64748B' }}>
          Not registered? Ask your Shop Owner to onboard you via the Partner Command Center.
        </p>
      </div>
    </div>
  );
}
