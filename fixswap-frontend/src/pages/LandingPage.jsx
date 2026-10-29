import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, ChevronDown, ArrowRight, Zap, ShieldCheck, Clock, Monitor, 
  Droplet, Tv, Smartphone, Fan, Search, Star, Users, MapPin, CheckCircle2, Building2 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'appliances', name: 'Large Appliances', desc: 'Refrigerators, Washers, Ovens', img: '/images/cat_appliances.png', icon: Fan },
  { id: 'hvac', name: 'HVAC Systems', desc: 'ACs, Central Air, Heaters', img: '/images/cat_hvac.png', icon: Zap },
  { id: 'plumbing', name: 'Plumbing & Hardware', desc: 'Faucets, Pipes, Sinks', img: '/images/cat_plumbing.png', icon: Droplet },
  { id: 'electrical', name: 'Electrical & Smart Home', desc: 'Wiring, Switches, Lighting', img: '/images/cat_electrical.png', icon: Monitor },
  { id: 'entertainment', name: 'Entertainment Systems', desc: 'LED TVs, Home Theaters', img: '/images/cat_entertainment.png', icon: Tv },
  { id: 'smartdevices', name: 'Smart Devices', desc: 'Laptops, Mobiles, Tablets', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', icon: Smartphone }
];

const QUICK_FIXES = [
  { name: 'AC Gas Charge', price: '₹1499', rating: '4.8', time: '45 mins' },
  { name: 'Washing Machine Repair', price: '₹499', rating: '4.9', time: '60 mins' },
  { name: 'Water Purifier Service', price: '₹399', rating: '4.7', time: '30 mins' },
  { name: 'Smart TV Installation', price: '₹699', rating: '4.9', time: '45 mins' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", overflowX: 'hidden', scrollBehavior: 'smooth' }}>
      
      {/* ── HEADER ── */}
      <header style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, width: '100%', background: 'rgba(11, 17, 32, 0.85)', backdropFilter: 'blur(20px)', zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)' }}>
            <Wrench size={24} color="#fff" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 26, letterSpacing: '-0.5px', color: '#fff' }}>
            Fix<span style={{ color: '#06B6D4' }}>Swap</span>
          </span>
        </div>
        
        <nav style={{ display: 'none', gap: 36, alignItems: 'center', '@media (min-width: 1024px)': { display: 'flex' } }}>
          <a href="#" onClick={(e)=>{e.preventDefault(); window.scrollTo(0,0)}} style={{ color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Home</a>
          <a href="#services" style={{ color: '#CBD5E1', fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#06B6D4'} onMouseLeave={e=>e.target.style.color='#CBD5E1'}>Services</a>
          <a href="#how-it-works" style={{ color: '#CBD5E1', fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#06B6D4'} onMouseLeave={e=>e.target.style.color='#CBD5E1'}>How it Works</a>
          <a href="#about" style={{ color: '#CBD5E1', fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#06B6D4'} onMouseLeave={e=>e.target.style.color='#CBD5E1'}>About Us</a>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
          <a href="/partner" style={{ color: '#CBD5E1', fontSize: 15, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 6 }} onMouseEnter={e=>e.target.style.color='#8B5CF6'} onMouseLeave={e=>e.target.style.color='#CBD5E1'}>
            <ShieldCheck size={16} /> Partner With Us
          </a>
        </nav>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', position: 'relative' }}>
          <div 
            onMouseEnter={() => setShowLoginMenu(true)} 
            onMouseLeave={() => setShowLoginMenu(false)}
            style={{ position: 'relative' }}
          >
            <button style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }} onMouseEnter={e=>e.target.style.borderColor='rgba(255,255,255,0.5)'} onMouseLeave={e=>e.target.style.borderColor='rgba(255,255,255,0.2)'}>
              Log In <ChevronDown size={16} />
            </button>
            
            {showLoginMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 8, width: 240, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 200 }}>
                <button onClick={() => navigate('/login')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                  Household Customer B2C
                </button>
                <button onClick={() => navigate('/corporate/login')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#06B6D4', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e=>e.target.style.background='rgba(6,182,212,0.1)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                  Corporate / Hotel B2B
                </button>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                <button onClick={() => navigate('/partner/login')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#EA580C', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e=>e.target.style.background='rgba(234,88,12,0.1)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                  Service Partner Hub B2B
                </button>
                <button onClick={() => navigate('/worker/login')} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#10B981', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e=>e.target.style.background='rgba(16,185,129,0.1)'} onMouseLeave={e=>e.target.style.background='transparent'}>
                  Technician Rescue Portal
                </button>
              </div>
            )}
          </div>
          
          <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #06B6D4, #0284C7)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 100, fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)', transition: 'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
            Book a Service
          </button>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section style={{ position: 'relative', paddingTop: 180, paddingBottom: 100, paddingLeft: 40, paddingRight: 40, textAlign: 'center', overflow: 'hidden' }}>
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: '-20%', left: '10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '8px 20px', borderRadius: 100, marginBottom: 32 }}>
            <Zap size={16} color="#06B6D4" fill="#06B6D4" />
            <span style={{ color: '#06B6D4', fontSize: 13, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>India's #1 Zero Downtime Repair Network</span>
          </div>
          
          <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px' }}>
            Home services, <br />
            <span style={{ background: 'linear-gradient(to right, #06B6D4, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>redefined for the future.</span>
          </h1>
          
          <p style={{ fontSize: 20, color: '#94A3B8', maxWidth: 700, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 500 }}>
            From high-end smart fridges to luxury plumbing. Book expert technicians and get a temporary replacement unit delivered in 45 minutes.
          </p>
          
          {/* Search Bar (UrbanCompany Style) */}
          <div style={{ background: '#fff', padding: 8, borderRadius: 100, display: 'flex', alignItems: 'center', maxWidth: 600, margin: '0 auto 48px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderRight: '1px solid #E2E8F0', cursor: 'pointer' }}>
              <MapPin size={20} color="#64748B" />
              <span style={{ color: '#0F172A', fontWeight: 600, fontSize: 15 }}>Bengaluru</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px' }}>
              <Search size={20} color="#94A3B8" />
              <input 
                type="text" 
                placeholder="Search for 'AC Repair', 'Plumber'..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: 16, color: '#0F172A', background: 'transparent' }} 
              />
            </div>
            <button onClick={() => navigate('/register')} style={{ background: '#0B1120', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 100, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              Search
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, color: '#CBD5E1', fontSize: 14, fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Star size={18} color="#F59E0B" fill="#F59E0B" /> 4.9/5 Average Rating</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} color="#06B6D4" /> 50,000+ Customers</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18} color="#10B981" /> Background Verified</div>
          </div>
        </div>
      </section>

      {/* ── QUICK FIXES / MOST BOOKED ── */}
      <section style={{ padding: '60px 40px', background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 12, height: 24, background: '#06B6D4', borderRadius: 4 }} /> Most Booked Services
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {QUICK_FIXES.map((fix, i) => (
              <div key={i} style={{ background: '#1E293B', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden' }}
                   onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                   onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', maxWidth: '70%' }}>{fix.name}</h3>
                  <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#FCD34D', padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} fill="#FCD34D" /> {fix.rating}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 4 }}>Starts at</p>
                    <p style={{ fontSize: 20, fontWeight: 900, color: '#06B6D4' }}>{fix.price}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                    <Clock size={14} /> {fix.time} arrival
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPREHENSIVE SERVICES GRID ── */}
      <section id="services" style={{ padding: '100px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>Everything we fix.</h2>
          <p style={{ fontSize: 18, color: '#94A3B8' }}>Comprehensive home and enterprise care across major verticals.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.id} onClick={() => navigate('/register')} style={{ borderRadius: 24, overflow: 'hidden', background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', cursor: 'pointer' }}>
              <div style={{ height: 260, width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseEnter={e=>e.target.style.transform='scale(1.05)'} onMouseLeave={e=>e.target.style.transform='scale(1)'} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1E293B 0%, transparent 100%)', pointerEvents: 'none' }} />
              </div>
              <div style={{ padding: '0 32px 32px', position: 'relative', top: -30 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(6,182,212,0.3)', marginBottom: 20, boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                  <cat.icon size={28} color="#06B6D4" />
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>{cat.name}</h3>
                <p style={{ fontSize: 16, color: '#94A3B8', fontWeight: 500, marginBottom: 16 }}>{cat.desc}</p>
                <div style={{ color: '#06B6D4', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Explore Services <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '120px 40px', background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, letterSpacing: '-1px' }}>The FixSwap Experience.</h2>
            <p style={{ fontSize: 18, color: '#94A3B8' }}>We don't just repair. We keep your life running without interruption.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
            {[
              { icon: Smartphone, title: '1. Book in 30 Seconds', desc: 'Select your appliance, snap a photo, and share your location. Our AI matches you instantly with a verified technician.', color: '#06B6D4' },
              { icon: ShieldCheck, title: '2. The 45-Min Swap', desc: 'A verified tech arrives with a working temporary replacement unit. Zero disruption to your household or business.', color: '#10B981' },
              { icon: Wrench, title: '3. Fixed & Returned', desc: 'We securely transport and repair your original device at our high-tech hub and return it to you perfectly working.', color: '#8B5CF6' }
            ].map((f, i) => (
              <div key={i} style={{ padding: 40, borderRadius: 32, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s', position: 'relative' }}
                   onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                   onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px solid ${f.color}40` }}>
                  <f.icon size={32} color={f.color} />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12, color: '#fff' }}>{f.title}</h3>
                <p style={{ color: '#94A3B8', lineHeight: 1.6, fontSize: 16, fontWeight: 500 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / ENTERPRISE SECTION ── */}
      <section id="about" style={{ padding: '120px 40px', background: '#0B1120' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 80, alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 400 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '8px 20px', borderRadius: 100, marginBottom: 24 }}>
              <Building2 size={16} color="#8B5CF6" />
              <span style={{ color: '#8B5CF6', fontSize: 13, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>B2B & Enterprise Solutions</span>
            </div>
            <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 24, letterSpacing: '-1px', lineHeight: 1.1 }}>Powering India's Top Hotels & Offices.</h2>
            <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.6, marginBottom: 32 }}>
              We understand that for businesses, appliance downtime means lost revenue. FixSwap Enterprise provides dedicated SLA-backed repair contracts, bulk asset management, and guaranteed 30-minute replacement swaps for commercial spaces.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Priority 30-minute dispatch routing', 'Dedicated account manager & ledger', 'Volume discounts & quarterly maintenance'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#CBD5E1', fontWeight: 500 }}>
                  <CheckCircle2 size={20} color="#10B981" /> {item}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/corporate/login')} style={{ background: '#fff', color: '#0F172A', border: 'none', padding: '16px 36px', borderRadius: 100, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              Go to Corporate Hub <ArrowRight size={18} />
            </button>
          </div>
          
          <div style={{ flex: 1, minWidth: 400, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -20, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))', filter: 'blur(40px)', borderRadius: '50%', zIndex: 0 }} />
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80" alt="Enterprise Office" style={{ width: '100%', borderRadius: 32, position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.1)' }} />
            
            {/* Floating Stat Card */}
            <div style={{ position: 'absolute', bottom: -30, left: -30, background: '#1E293B', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', zIndex: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={28} color="#10B981" />
              </div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>99.9%</p>
                <p style={{ fontSize: 14, color: '#94A3B8', fontWeight: 600 }}>SLA Uptime Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0B1120', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '80px 40px 40px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 60, marginBottom: 80 }}>
          <div style={{ maxWidth: 350 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={20} color="#fff" />
              </div>
              <span style={{ fontWeight: 900, fontSize: 24, color: '#fff' }}>Fix<span style={{ color: '#06B6D4' }}>Swap</span></span>
            </div>
            <p style={{ color: '#94A3B8', lineHeight: 1.6, fontSize: 15, marginBottom: 24 }}>The world's first appliance-as-a-service and zero-downtime repair platform for households and enterprise.</p>
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Social placeholders */}
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>X</span></div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>in</span></div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>fb</span></div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 80, flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 800, marginBottom: 24, fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>Services</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: '#94A3B8', fontSize: 15, fontWeight: 500 }}>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#94A3B8'}>Large Appliances</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#94A3B8'}>HVAC & Cooling</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#94A3B8'}>Smart Devices</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#94A3B8'}>Plumbing & Electrical</span>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 800, marginBottom: 24, fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: '#94A3B8', fontSize: 15, fontWeight: 500 }}>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/login')} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#94A3B8'}>Household Login</span>
                <span style={{ cursor: 'pointer', color: '#06B6D4' }} onClick={() => navigate('/corporate/login')}>Corporate B2B Hub</span>
                <span style={{ cursor: 'pointer', color: '#8B5CF6' }} onClick={() => navigate('/partner')}>Partner / Shop Owner</span>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 800, marginBottom: 24, fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: '#94A3B8', fontSize: 15, fontWeight: 500 }}>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#94A3B8'}>About Us</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#94A3B8'}>Careers</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#94A3B8'}>Privacy & Terms</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', color: '#475569', fontSize: 14, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 40, fontWeight: 500 }}>
          © 2026 FixSwap Enterprise Platforms. All rights reserved. Masterclass UI/UX.
        </div>
      </footer>
    </div>
  );
}
