import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, TrendingUp, Users, ShieldCheck, ArrowRight, Zap, Target, ArrowUpRight } from 'lucide-react';

export default function PartnerLandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      
      {/* ── HEADER ── */}
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, width: '100%', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <Building size={24} color="#fff" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px', color: '#fff' }}>
            FixSwap <span style={{ color: '#3B82F6', fontWeight: 500 }}>for Business</span>
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button onClick={() => navigate('/partner/login')} style={{ background: 'transparent', color: '#fff', border: 'none', padding: '10px 20px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
            Partner Login
          </button>
          <button onClick={() => navigate('/partner/register')} style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 100, fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            Complete KYC
          </button>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section style={{ paddingTop: 160, paddingBottom: 100, paddingLeft: 40, paddingRight: 40, maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '8px 16px', borderRadius: 100, marginBottom: 32 }}>
            <TrendingUp size={16} color="#3B82F6" />
            <span style={{ color: '#3B82F6', fontSize: 13, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>0% Commission for 3 Months</span>
          </div>
          
          <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-2.5px' }}>
            Grow your repair shop <br />
            <span style={{ color: '#3B82F6' }}>at scale.</span>
          </h1>
          
          <p style={{ fontSize: 22, color: '#94A3B8', maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 500 }}>
            Join FixSwap's premium partner network. Get verified leads, manage technicians with our dispatch software, and rent out your inventory for extra revenue.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <button onClick={() => navigate('/partner/register')} style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '20px 48px', borderRadius: 100, fontSize: 18, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>
              Register Your Business <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ── METRICS SECTION ── */}
      <section style={{ padding: '0 40px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            { value: '300+', label: 'Daily Service Requests', icon: Zap },
            { value: '₹50k+', label: 'Avg Monthly Additional Revenue', icon: TrendingUp },
            { value: '15k+', label: 'Verified FixSwap Customers', icon: Users }
          ].map((m, i) => (
            <div key={i} style={{ background: '#1E293B', padding: 40, borderRadius: 32, border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <m.icon size={24} color="#3B82F6" />
              </div>
              <h3 style={{ fontSize: 40, fontWeight: 900 }}>{m.value}</h3>
              <p style={{ color: '#94A3B8', fontSize: 16, fontWeight: 600 }}>{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── KYC PROCESS ── */}
      <section style={{ padding: '100px 40px', background: '#1E293B', borderTop: '1px solid #334155' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 80 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 24, letterSpacing: '-1px' }}>Simple, transparent<br/>KYC onboarding.</h2>
            <p style={{ color: '#94A3B8', fontSize: 18, lineHeight: 1.6, marginBottom: 40 }}>
              We ensure high-quality service by verifying all partners. Complete your profile in 5 minutes and start receiving tickets within 24 hours.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                'Submit shop details and GST/PAN',
                'Verify your bank account for payouts',
                'Add your initial temporary appliance inventory',
                'Get listed as a verified FixSwap Partner'
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, background: '#0F172A', padding: 60, borderRadius: 40, border: '1px solid #334155' }}>
            <ShieldCheck size={80} color="#3B82F6" style={{ marginBottom: 32 }} />
            <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>100% Secure</h3>
            <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.6 }}>Your business data is encrypted and secure. We handle customer disputes, payments, and invoice generation automatically.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
