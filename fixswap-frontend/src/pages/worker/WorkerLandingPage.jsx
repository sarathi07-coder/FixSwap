import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, DollarSign, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

export default function WorkerLandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Navbar */}
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #14B8A6, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="#fff" />
          </div>
          <div>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#fff', display: 'block' }}>FixSwap</span>
            <span style={{ fontSize: 11, color: '#14B8A6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Careers</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={() => navigate('/worker/login')} style={{ background: 'transparent', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', padding: '10px 20px' }}>Log In</button>
          <button onClick={() => navigate('/worker/signup')} style={{ background: '#fff', color: '#0F172A', border: 'none', padding: '10px 24px', borderRadius: 100, fontWeight: 800, cursor: 'pointer' }}>Apply Now</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(20, 184, 166, 0.1)', padding: '8px 16px', borderRadius: 100, color: '#14B8A6', fontWeight: 800, fontSize: 13, marginBottom: 24, border: '1px solid rgba(20, 184, 166, 0.2)' }}>
            <span className="pulse-dot" style={{ width: 8, height: 8, background: '#14B8A6', borderRadius: '50%', display: 'inline-block' }} />
            Hiring across 40+ Cities
          </div>
          <h1 style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px' }}>
            Be your own boss. <br/>
            <span style={{ color: '#14B8A6' }}>Earn on your schedule.</span>
          </h1>
          <p style={{ fontSize: 18, color: '#94A3B8', marginBottom: 40, lineHeight: 1.6, maxWidth: 500 }}>
            Join FixSwap's elite network of independent rescue technicians. Pick up SLA dispatches near you, manage your own time, and get paid weekly.
          </p>
          <button onClick={() => navigate('/worker/signup')} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg, #14B8A6, #0D9488)', color: '#fff', border: 'none', padding: '20px 40px', borderRadius: 100, fontSize: 18, fontWeight: 800, cursor: 'pointer', boxShadow: '0 20px 40px rgba(20, 184, 166, 0.3)' }}>
            Start Earning Today <ArrowRight size={20} />
          </button>
        </div>
        
        {/* Abstract Illustration */}
        <div style={{ position: 'relative', height: 500, background: '#1E293B', borderRadius: 40, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)' }} />
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: 30, backdropFilter: 'blur(10px)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Briefcase size={48} color="#14B8A6" />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>Independent Technician</h3>
            <p style={{ color: '#94A3B8' }}>Zero Fixed Hours. 100% Freedom.</p>
          </div>
        </div>
      </div>

      {/* Perks Section */}
      <div style={{ background: '#0B1120', padding: '100px 48px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginBottom: 16 }}>Why ride with FixSwap?</h2>
            <p style={{ color: '#94A3B8', fontSize: 18 }}>Everything you need to succeed as an independent professional.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            <div style={{ background: '#1E293B', padding: 40, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <DollarSign size={28} color="#10B981" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Weekly Payouts</h3>
              <p style={{ color: '#94A3B8', lineHeight: 1.6 }}>Get your earnings transferred directly to your bank account every Tuesday without fail. No waiting for the end of the month.</p>
            </div>
            <div style={{ background: '#1E293B', padding: 40, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <Clock size={28} color="#3B82F6" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Flexible Timing</h3>
              <p style={{ color: '#94A3B8', lineHeight: 1.6 }}>You are the boss. Simply toggle your status to "ON DUTY" in the app whenever you're ready to start receiving dispatch requests.</p>
            </div>
            <div style={{ background: '#1E293B', padding: 40, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <ShieldCheck size={28} color="#F59E0B" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Insurance Cover</h3>
              <p style={{ color: '#94A3B8', lineHeight: 1.6 }}>All verified technicians receive complimentary accidental and medical insurance while actively completing SLA dispatches on the platform.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
