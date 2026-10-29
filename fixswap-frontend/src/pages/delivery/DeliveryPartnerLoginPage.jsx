import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Phone, Lock, LogIn, ShieldAlert,
  Eye, EyeOff, ArrowRight, Zap
} from 'lucide-react';
import { deliverySession, clearLegacySharedAuth } from '../../auth/session';

export default function DeliveryPartnerLoginPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword]       = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim(), password: password.trim(), type: 'DELIVERY_COURIER' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.message === 'Invalid password') {
          throw new Error('Invalid password. Use phone 6665554443 with password password123');
        }
        throw new Error(data.message || 'Invalid credentials or account not found.');
      }

      // Role guard: reject field technicians who hit this portal
      if (data.role === 'RESCUE_WORKER' && data.workerType === 'FIELD_TECHNICIAN') {
        throw new Error('This account is a Field Technician. Please use the Technician Portal.');
      }

      clearLegacySharedAuth();
      deliverySession.setAuth({
        workerId: data.userId,
        workerName: data.fullName || 'Delivery Partner',
        workerType: data.workerType || 'DELIVERY_COURIER',
      });
      navigate('/delivery/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '17px 18px 17px 52px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 16,
    color: '#F8FAFC',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.25s, box-shadow 0.25s',
    fontFamily: "'Inter', sans-serif",
  };

  const focusStyle = { borderColor: '#F59E0B', boxShadow: '0 0 0 3px rgba(245,158,11,0.13)' };
  const blurStyle  = { borderColor: 'rgba(255,255,255,0.09)', boxShadow: 'none' };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080C18',
      display: 'flex',
      fontFamily: "'Inter', sans-serif",
      color: '#F8FAFC',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.5} 70%{transform:scale(1.55);opacity:0} 100%{transform:scale(1.55);opacity:0} }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .float-icon { animation: float 3.5s ease-in-out infinite; }
        input::placeholder { color: #475569; }
        .login-btn { transition: transform 0.2s, box-shadow 0.2s; }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(245,158,11,0.35) !important; }
        .text-link { transition: color 0.2s; }
        .text-link:hover { color: #FCD34D !important; }
      `}</style>

      {/* ── LEFT DECORATIVE PANEL ── */}
      <div style={{
        width: 420, flexShrink: 0,
        background: 'linear-gradient(160deg, #111827 0%, #0D1420 100%)',
        borderRight: '1px solid rgba(245,158,11,0.08)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 48px', position: 'relative', overflow: 'hidden'
      }}>
        {/* ambient orbs */}
        <div style={{ position:'absolute', top:-120, right:-120, width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-80, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:56 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg, #F59E0B, #D97706)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 20px rgba(245,158,11,0.4)' }}>
            <Truck size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight:900, fontSize:18 }}>FixSwap Fleet</div>
            <div style={{ fontSize:11, color:'#F59E0B', fontWeight:800, textTransform:'uppercase', letterSpacing:'1.5px' }}>Courier Partner</div>
          </div>
        </div>

        {/* Floating Truck Icon */}
        <div className="float-icon" style={{ position:'relative', display:'inline-block', width:160, height:160, margin:'0 auto 40px' }}>
          <div style={{ position:'absolute', inset:-20, borderRadius:'50%', border:'2px solid rgba(245,158,11,0.18)', animation:'pulse-ring 2.8s ease-out infinite' }} />
          <div style={{ position:'absolute', inset:-20, borderRadius:'50%', border:'2px solid rgba(245,158,11,0.1)', animation:'pulse-ring 2.8s ease-out 1s infinite' }} />
          <div style={{ width:160, height:160, borderRadius:'50%', background:'linear-gradient(135deg, #F59E0B, #92400E)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 60px rgba(245,158,11,0.3)' }}>
            <Truck size={70} color="#fff" strokeWidth={1.5} />
          </div>
        </div>

        <h2 style={{ fontSize:30, fontWeight:900, lineHeight:1.2, marginBottom:14, letterSpacing:'-0.8px' }}>
          Welcome Back,<br />
          <span style={{ background:'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Courier Partner
          </span>
        </h2>
        <p style={{ color:'#475569', fontSize:14, lineHeight:1.7 }}>
          Log in to view live delivery runs, claim pickups, and track your active swaps in real time.
        </p>

        {/* Quick stats strip */}
        <div style={{ display:'flex', gap:16, marginTop:40 }}>
          {[['₹800+', 'Avg Daily'], ['4.9★', 'Rating'], ['<3 min', 'Claim Time']].map(([v, l]) => (
            <div key={l} style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'14px 12px', textAlign:'center' }}>
              <div style={{ fontWeight:900, fontSize:17, color:'#F59E0B' }}>{v}</div>
              <div style={{ fontSize:11, color:'#475569', fontWeight:600, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 48px' }}>
        <div className="fade-up" style={{ width:'100%', maxWidth:440 }}>

          {/* Back to landing */}
          <button onClick={() => navigate('/delivery')} style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'none', color:'#475569', fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:36, padding:0 }}>
            ← Delivery Partner Portal
          </button>

          <div style={{ marginBottom:36 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:100, padding:'5px 14px', marginBottom:16 }}>
              <Zap size={13} color="#F59E0B" />
              <span style={{ color:'#F59E0B', fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.8px' }}>Courier Login</span>
            </div>
            <h1 style={{ fontSize:40, fontWeight:900, letterSpacing:'-1.2px', marginBottom:8 }}>Sign In</h1>
            <p style={{ color:'#64748B', fontSize:15, lineHeight:1.6 }}>Enter your registered phone number and password to access your delivery dashboard.</p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.22)',
              color:'#FCA5A5', padding:'14px 18px', borderRadius:14, marginBottom:24,
              fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:10
            }}>
              <ShieldAlert size={18} style={{ flexShrink:0, color:'#EF4444' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Phone */}
            <div style={{ position:'relative' }}>
              <Phone size={19} color="#475569" style={{ position:'absolute', top:'50%', left:18, transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input
                type="tel"
                placeholder="Registered Phone Number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e  => Object.assign(e.target.style, blurStyle)}
              />
            </div>

            {/* Password */}
            <div style={{ position:'relative' }}>
              <Lock size={19} color="#475569" style={{ position:'absolute', top:'50%', left:18, transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Your Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight:52 }}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e  => Object.assign(e.target.style, blurStyle)}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position:'absolute', top:'50%', right:18, transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', color:'#475569', display:'flex', padding:0 }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
              style={{
                width:'100%', padding:'18px',
                background: loading ? '#78350F' : 'linear-gradient(135deg, #F59E0B, #D97706)',
                color:'#fff', border:'none', borderRadius:16,
                fontSize:16, fontWeight:800, cursor: loading ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                marginTop:8, boxShadow:'0 8px 20px rgba(245,158,11,0.25)',
                opacity: loading ? 0.75 : 1, transition:'all 0.25s'
              }}
            >
              {loading
                ? <><span style={{ display:'inline-block', width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }} /> Authenticating…</>
                : <><LogIn size={20} /> Sign In & Start Runs <ArrowRight size={18} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:14, margin:'28px 0' }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
            <span style={{ color:'#374151', fontSize:13, fontWeight:600 }}>or</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Sign up link */}
          <div style={{ textAlign:'center' }}>
            <p style={{ color:'#475569', fontSize:14, marginBottom:4 }}>New to the FixSwap Fleet?</p>
            <button
              onClick={() => navigate('/delivery/signup')}
              style={{
                width:'100%', padding:'16px',
                background:'transparent', border:'1px solid rgba(245,158,11,0.3)',
                borderRadius:16, color:'#F59E0B', fontSize:15, fontWeight:800,
                cursor:'pointer', transition:'background 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = 'rgba(245,158,11,0.07)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              Create Partner Account →
            </button>
          </div>

          {/* Other portals */}
          <div style={{ marginTop:32, padding:'16px 20px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14 }}>
            <p style={{ color:'#374151', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10 }}>Other Portals</p>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {[['Field Technician', '/worker/login'], ['Partner Hub', '/partner/login'], ['Customer', '/login']].map(([label, path]) => (
                <button key={path} onClick={() => navigate(path)} className="text-link" style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.08)', color:'#64748B', padding:'7px 14px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
