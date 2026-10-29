import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Zap, ShieldCheck, Clock, IndianRupee, Package,
  ChevronRight, Star, ArrowRight, MapPin, Navigation
} from 'lucide-react';

const STATS = [
  { value: '₹800+', label: 'Avg Daily Earnings', icon: IndianRupee },
  { value: '4.9★', label: 'Partner Rating', icon: Star },
  { value: '<3 min', label: 'Job Claim Time', icon: Zap },
  { value: '24/7', label: 'Live Support', icon: Clock },
];

const STEPS = [
  { num: '01', title: 'Sign Up & KYC', desc: 'Register with your phone, upload your driving license and Aadhaar. Takes under 5 minutes.' },
  { num: '02', title: 'Go On Shift', desc: 'Toggle ON in the app whenever you\'re ready to earn. No fixed hours, complete freedom.' },
  { num: '03', title: 'Claim Runs', desc: 'Browse live pickup and return delivery requests near you and claim instantly.' },
  { num: '04', title: 'Verify & Earn', desc: 'Complete mutual OTP verification at pickup/delivery and get paid per trip.' },
];

const FEATURES = [
  { icon: ShieldCheck, color: '#10B981', bg: 'rgba(16,185,129,0.1)', title: 'Mutual OTP Security', desc: 'Two-way verification at every handoff ensures zero fraud and complete accountability.' },
  { icon: MapPin, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', title: 'Smart Job Matching', desc: 'Jobs are matched to your live location — no wasted trips, maximum efficiency.' },
  { icon: Package, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', title: 'Pickup + Return Runs', desc: 'Earn on both legs — pick up broken devices and return repaired ones to customers.' },
  { icon: Navigation, color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', title: 'Real-time Tracking', desc: 'Live status updates keep Partner Hubs and customers informed at every step.' },
];

export default function DeliveryLandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [animCount, setAnimCount] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    const t = setTimeout(() => setAnimCount(true), 300);
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(t); };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#080C18', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-18px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 70%{transform:scale(1.6);opacity:0} 100%{transform:scale(1.6);opacity:0} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .hero-card { animation: fadeUp 0.7s ease both; }
        .hero-card:nth-child(2) { animation-delay: 0.1s; }
        .hero-card:nth-child(3) { animation-delay: 0.2s; }
        .float-truck { animation: float 4s ease-in-out infinite; }
        .stat-card { transition: transform 0.25s, box-shadow 0.25s; }
        .stat-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(245,158,11,0.15); }
        .feature-card { transition: transform 0.25s, border-color 0.25s; }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(245,158,11,0.35) !important; }
        .cta-btn { transition: transform 0.2s, box-shadow 0.2s; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(245,158,11,0.35); }
        .nav-link { transition: color 0.2s; cursor: pointer; }
        .nav-link:hover { color: #F59E0B !important; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(8,12,24,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(245,158,11,0.12)' : 'none',
        transition: 'all 0.3s',
        padding: '16px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}>
            <Truck size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>FixSwap</div>
            <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Courier Fleet</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/delivery/login')} className="nav-link" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#CBD5E1', padding: '10px 22px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Log In
          </button>
          <button onClick={() => navigate('/delivery/signup')} className="cta-btn" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            Join Fleet
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '0%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Left: Text */}
          <div className="hero-card">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
              <Zap size={14} color="#F59E0B" />
              <span style={{ color: '#F59E0B', fontSize: 13, fontWeight: 700 }}>India's Fastest Device Courier Network</span>
            </div>

            <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.08, marginBottom: 24, letterSpacing: '-2px' }}>
              Deliver Smarter,{' '}
              <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Earn More.
              </span>
            </h1>

            <p style={{ color: '#94A3B8', fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 460 }}>
              Join FixSwap's courier fleet — pick up broken devices from customers, drop them at repair hubs, and return fixed ones. Flexible hours, instant pay.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/delivery/signup')} className="cta-btn" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', padding: '18px 32px', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(245,158,11,0.3)' }}>
                Start Earning Today <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/delivery/login')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.15)', padding: '18px 32px', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                Log In <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Right: Floating visual */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div className="float-truck" style={{ position: 'relative', width: 300, height: 300 }}>
              {/* Pulse rings */}
              <div style={{ position: 'absolute', inset: -30, borderRadius: '50%', border: '2px solid rgba(245,158,11,0.2)', animation: 'pulse-ring 2.5s ease-out infinite' }} />
              <div style={{ position: 'absolute', inset: -30, borderRadius: '50%', border: '2px solid rgba(245,158,11,0.15)', animation: 'pulse-ring 2.5s ease-out 0.8s infinite' }} />
              {/* Main circle */}
              <div style={{ width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #F59E0B, #92400E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 80px rgba(245,158,11,0.3), 0 30px 60px rgba(0,0,0,0.5)' }}>
                <Truck size={120} color="#fff" strokeWidth={1.5} />
              </div>
            </div>

            {/* Floating badges */}
            <div style={{ position: 'absolute', top: 10, right: -10, background: '#111827', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: '12px 16px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              <div style={{ color: '#10B981', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Earnings</div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>₹640</div>
            </div>
            <div style={{ position: 'absolute', bottom: 20, left: -20, background: '#111827', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: '12px 16px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              <div style={{ color: '#F59E0B', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Active Runs</div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>3 live</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '28px 20px', textAlign: 'center' }}>
              <Icon size={28} color="#F59E0B" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{animCount ? value : '—'}</div>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>Simple Process</div>
            <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1.5px' }}>How It Works</h2>
            <p style={{ color: '#64748B', fontSize: 16, marginTop: 12 }}>From signup to your first delivery in under 24 hours.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 22, left: '70%', width: '60%', height: 1, background: 'linear-gradient(to right, rgba(245,158,11,0.4), rgba(245,158,11,0.05))', zIndex: 0 }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 6px 20px rgba(245,158,11,0.3)' }}>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>{step.num}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#fff' }}>{step.title}</h3>
                  <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>Why FixSwap Fleet</div>
            <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1.5px' }}>Built for Couriers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="feature-card" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '32px' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={26} color={color} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: '#64748B', lineHeight: 1.7, fontSize: 15 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 32, padding: '60px 48px', textAlign: 'center' }}>
          <Truck size={56} color="#F59E0B" style={{ marginBottom: 24 }} />
          <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>
            Ready to Hit the Road?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 17, lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Join hundreds of delivery partners earning daily with FixSwap's zero-downtime device rescue network.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/delivery/signup')} className="cta-btn" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', padding: '18px 40px', borderRadius: 16, fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(245,158,11,0.35)' }}>
              Join the Fleet <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/delivery/login')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.15)', padding: '18px 40px', borderRadius: 16, fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>
              Already a Partner? Log In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={16} color="#fff" />
          </div>
          <span style={{ color: '#475569', fontSize: 14, fontWeight: 600 }}>FixSwap Courier Fleet © 2025</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <span onClick={() => navigate('/')} style={{ color: '#475569', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Main Portal</span>
          <span onClick={() => navigate('/worker')} style={{ color: '#475569', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Technicians</span>
          <span onClick={() => navigate('/partner')} style={{ color: '#475569', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Partner Hub</span>
        </div>
      </footer>
    </div>
  );
}
