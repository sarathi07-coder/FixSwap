import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Phone, MessageSquare, User, Mail, Lock,
  CreditCard, Car, ShieldCheck, Check, ChevronRight,
  CheckCircle2, ArrowLeft
} from 'lucide-react';

const STEP_LABELS = ['Phone', 'Profile', 'KYC & Vehicle'];

const InputField = ({ icon: Icon, label, type = 'text', placeholder, value, onChange, disabled, style = {} }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon size={18} color="#475569" style={{ position: 'absolute', top: '50%', left: 18, transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%', padding: Icon ? '16px 16px 16px 50px' : '16px',
          background: disabled ? '#0D1526' : '#0F1B2D',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, color: disabled ? '#475569' : '#F8FAFC',
          fontSize: 15, outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.25s, box-shadow 0.25s',
          opacity: disabled ? 0.6 : 1, ...style
        }}
        onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
    <select
      value={value}
      onChange={onChange}
      style={{ width: '100%', padding: '16px', background: '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#F8FAFC', fontSize: 15, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
    >
      {children}
    </select>
  </div>
);

export default function DeliverySignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '', phoneNumber: '', email: '', password: '',
    idCardNo: '', drivingLicenseNo: '', vehicleType: 'BIKE',
    aadharReference: '', workerType: 'DELIVERY_COURIER'
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);

  const update = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  const sendOtp = async () => {
    if (formData.phoneNumber.length < 10) { setError('Please enter a valid 10-digit phone number.'); return; }
    setError('');
    setLoading(true);
    try {
      await fetch(`/api/worker-onboarding/send-otp?phone=${formData.phoneNumber}`, { method: 'POST' });
      setOtpSent(true);
    } catch (e) { setError('Failed to send OTP. Try again.'); }
    finally { setLoading(false); }
  };

  const handleOtpDigit = (idx, val) => {
    const digits = [...otpDigits];
    digits[idx] = val.replace(/\D/g, '').slice(-1);
    setOtpDigits(digits);
    setOtp(digits.join(''));
    if (val && idx < 3) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) { setError('Enter the complete 4-digit OTP.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/worker-onboarding/verify-otp?phone=${formData.phoneNumber}&otp=${otp}`, { method: 'POST' });
      if (res.ok) { setOtpVerified(true); setStep(2); }
      else { setError('Invalid OTP. Please check and try again.'); }
    } catch (e) { setError('Verification failed. Try again.'); }
    finally { setLoading(false); }
  };

  const registerPartner = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/worker-onboarding/register-independent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, aadharReference: formData.idCardNo })
      });
      if (res.ok) {
        setStep(4); // Success state
      } else {
        const msg = await res.text();
        setError('Registration failed: ' + msg);
      }
    } catch (e) { setError('Server error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080C18', color: '#F8FAFC', fontFamily: "'Inter', sans-serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .form-step { animation: fadeUp 0.4s ease both; }
        input::placeholder { color: #475569; }
        select option { background: #0F1B2D; }
      `}</style>

      {/* LEFT PANEL */}
      <div style={{ width: 380, background: 'linear-gradient(160deg, #111827, #0F172A)', borderRight: '1px solid rgba(245,158,11,0.1)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245,158,11,0.4)' }}>
              <Truck size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>FixSwap Fleet</div>
              <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Courier Partner</div>
            </div>
          </div>

          <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>
            Join India's Fastest<br />
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Device Rescue Network</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, marginBottom: 48 }}>
            Earn ₹800+ daily delivering repaired devices and picking up broken ones. Flexible hours, instant payouts.
          </p>

          {/* Steps tracker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: done ? '#F59E0B' : active ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${done ? '#F59E0B' : active ? '#F59E0B' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}>
                      {done
                        ? <Check size={16} color="#fff" />
                        : <span style={{ fontSize: 13, fontWeight: 800, color: active ? '#F59E0B' : '#475569' }}>{n}</span>
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: active || done ? '#F8FAFC' : '#475569', transition: 'color 0.3s' }}>{label}</div>
                      <div style={{ fontSize: 11, color: active ? '#F59E0B' : '#374151', fontWeight: 600 }}>
                        {active ? 'In Progress' : done ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div style={{ marginLeft: 17, width: 2, height: 28, background: done ? 'linear-gradient(to bottom, #F59E0B, rgba(245,158,11,0.2))' : 'rgba(255,255,255,0.05)', borderRadius: 99, margin: '4px 0 4px 17px' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom link */}
        <div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
            <p style={{ color: '#475569', fontSize: 13 }}>
              Already a partner?{' '}
              <span onClick={() => navigate('/delivery/login')} style={{ color: '#F59E0B', cursor: 'pointer', fontWeight: 700 }}>
                Log In Here
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div style={{ flex: 1, padding: '48px 64px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* Back to landing */}
          <button onClick={() => navigate('/delivery')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 40, padding: 0 }}>
            <ArrowLeft size={16} /> Back to Fleet Portal
          </button>

          {/* ─── STEP 1: PHONE VERIFICATION ─── */}
          {step === 1 && (
            <div className="form-step">
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 100, padding: '4px 14px', marginBottom: 16 }}>
                  <Phone size={12} color="#F59E0B" />
                  <span style={{ color: '#F59E0B', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step 1 of 3</span>
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>Verify Your Phone</h1>
                <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.6 }}>Enter your mobile number. We'll send a 4-digit OTP to confirm it's you.</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mobile Number</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Phone size={18} color="#475569" style={{ position: 'absolute', top: '50%', left: 18, transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={formData.phoneNumber}
                      onChange={e => update('phoneNumber', e.target.value)}
                      disabled={otpSent}
                      style={{ width: '100%', padding: '16px 16px 16px 50px', background: otpSent ? '#0D1526' : '#0F1B2D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: otpSent ? '#475569' : '#F8FAFC', fontSize: 16, outline: 'none', boxSizing: 'border-box', opacity: otpSent ? 0.6 : 1 }}
                    />
                  </div>
                  {!otpSent && (
                    <button onClick={sendOtp} disabled={loading || formData.phoneNumber.length < 10} style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', padding: '0 24px', borderRadius: 14, fontWeight: 800, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', opacity: formData.phoneNumber.length < 10 ? 0.5 : 1 }}>
                      {loading ? 'Sending…' : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: 11, fontWeight: 800, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    <MessageSquare size={12} style={{ display: 'inline', marginRight: 6 }} />
                    Enter 4-digit OTP sent to {formData.phoneNumber}
                  </label>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={e => handleOtpDigit(i, e.target.value)}
                        onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                        style={{
                          flex: 1, height: 64, textAlign: 'center', fontSize: 28, fontWeight: 900,
                          background: d ? 'rgba(245,158,11,0.1)' : '#0F1B2D',
                          border: `2px solid ${d ? '#F59E0B' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: 16, color: '#fff', outline: 'none',
                          transition: 'all 0.2s', caretColor: '#F59E0B'
                        }}
                      />
                    ))}
                  </div>
                  <button onClick={verifyOtp} disabled={otp.length < 4 || loading} style={{ width: '100%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', padding: 18, borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: otp.length < 4 ? 0.5 : 1 }}>
                    {loading ? 'Verifying…' : 'Verify & Continue →'}
                  </button>
                  <p style={{ color: '#475569', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
                    Didn't receive?{' '}
                    <span onClick={sendOtp} style={{ color: '#F59E0B', cursor: 'pointer', fontWeight: 700 }}>Resend OTP</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2: PROFILE ─── */}
          {step === 2 && (
            <div className="form-step">
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 100, padding: '4px 14px', marginBottom: 16 }}>
                  <User size={12} color="#F59E0B" />
                  <span style={{ color: '#F59E0B', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step 2 of 3</span>
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>Your Profile</h1>
                <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.6 }}>Set up your account details. This is how the platform identifies you.</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <InputField icon={User} label="Full Name (as on ID)" placeholder="e.g. Rahul Kumar" value={formData.fullName} onChange={e => update('fullName', e.target.value)} />
              <InputField icon={Mail} label="Email Address" type="email" placeholder="you@example.com" value={formData.email} onChange={e => update('email', e.target.value)} />
              <InputField icon={Lock} label="Create Password" type="password" placeholder="Minimum 6 characters" value={formData.password} onChange={e => update('password', e.target.value)} />

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', padding: 16, borderRadius: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={() => { if (!formData.fullName || !formData.password) { setError('Please fill in all fields.'); return; } setError(''); setStep(3); }} disabled={!formData.fullName || !formData.password} style={{ flex: 2, background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (!formData.fullName || !formData.password) ? 0.5 : 1 }}>
                  Next: KYC Docs <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: KYC & VEHICLE ─── */}
          {step === 3 && (
            <div className="form-step">
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 100, padding: '4px 14px', marginBottom: 16 }}>
                  <ShieldCheck size={12} color="#F59E0B" />
                  <span style={{ color: '#F59E0B', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step 3 of 3</span>
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>KYC & Vehicle</h1>
                <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.6 }}>Government ID and vehicle details are mandatory for background verification.</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <InputField icon={CreditCard} label="Aadhaar / PAN Number" placeholder="Government ID reference" value={formData.idCardNo} onChange={e => update('idCardNo', e.target.value)} style={{ textTransform: 'uppercase' }} />
              <InputField icon={CreditCard} label="Driving License Number" placeholder="Valid DL Number" value={formData.drivingLicenseNo} onChange={e => update('drivingLicenseNo', e.target.value)} style={{ textTransform: 'uppercase' }} />
              <SelectField label="Vehicle Type" value={formData.vehicleType} onChange={e => update('vehicleType', e.target.value)}>
                <option value="BIKE">🏍️ Motorbike / Scooter</option>
                <option value="CYCLE">🚲 Bicycle (Short range)</option>
              </SelectField>

              {/* KYC Consent box */}
              <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <ShieldCheck size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  By submitting you consent to a background KYC verification check. Your data is securely processed and never shared with third parties.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8', padding: 16, borderRadius: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={registerPartner} disabled={!formData.idCardNo || !formData.drivingLicenseNo || loading} style={{ flex: 2, background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (!formData.idCardNo || !formData.drivingLicenseNo || loading) ? 0.5 : 1, boxShadow: '0 6px 20px rgba(245,158,11,0.25)' }}>
                  {loading ? 'Submitting Application…' : <><CheckCircle2 size={20} /> Submit KYC & Join Fleet</>}
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 4: SUCCESS ─── */}
          {step === 4 && (
            <div className="form-step" style={{ textAlign: 'center' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 0 60px rgba(16,185,129,0.35)' }}>
                <CheckCircle2 size={52} color="#fff" />
              </div>
              <h1 style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-1px', marginBottom: 12 }}>You're In! 🎉</h1>
              <p style={{ color: '#64748B', fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 380, margin: '0 auto 40px' }}>
                Welcome to the FixSwap Courier Fleet. Your KYC application has been submitted and will be reviewed within 24 hours. Once approved, you can start claiming delivery runs.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => navigate('/delivery/login')} style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', padding: '18px 32px', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(245,158,11,0.3)' }}>
                  Go to Partner Login →
                </button>
                <button onClick={() => navigate('/delivery')} style={{ background: 'transparent', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 32px', borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Back to Fleet Portal
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
