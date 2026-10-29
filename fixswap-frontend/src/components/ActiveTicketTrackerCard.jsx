import React from 'react';
import { Truck, Map as MapIcon, CheckCircle2, XCircle } from 'lucide-react';
import {
  getTrackerSteps,
  getStepIndex,
  getStatusBanner,
  showsPickupOtpSection,
  showsDeliveryOtpSection,
  isDeliveryPartnerTicket,
} from '../utils/ticketTracker';

const LiveArrivalTimer = ({ createdAt, color = '#06B6D4' }) => {
  const [timeLeft, setTimeLeft] = React.useState('30:00');
  React.useEffect(() => {
    const update = () => {
      const diff = new Date(createdAt).getTime() + 30 * 60000 - Date.now();
      if (diff <= 0) {
        setTimeLeft('Arriving');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return <span style={{ color }}>{timeLeft}</span>;
};

const CancellationTimer = ({ createdAt, fineLabel }) => {
  const [timeLeft, setTimeLeft] = React.useState('');
  const [isFine, setIsFine] = React.useState(false);
  React.useEffect(() => {
    const update = () => {
      const diff = new Date(createdAt).getTime() + 10 * 60000 - Date.now();
      if (diff <= 0) {
        setIsFine(true);
        setTimeLeft('');
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
        setIsFine(false);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  if (isFine) {
    return (
      <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
        ⚠️ {fineLabel || 'Cancellation fine now applies (₹150)'}
      </div>
    );
  }
  return (
    <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
      Free cancellation ends in: {timeLeft}
    </div>
  );
};

/**
 * Shared rescue / work-order progress UI for B2C and B2B (same tracker logic, separate data).
 * @param {'b2c'|'b2b'} variant
 */
export default function ActiveTicketTrackerCard({
  ticket,
  variant = 'b2c',
  onCancel,
  workerPickupOtpInput,
  setWorkerPickupOtpInput,
  workerDeliveryOtpInput,
  setWorkerDeliveryOtpInput,
  otpErrorMsg,
  onVerifyPickupOtp,
  onVerifyDeliveryOtp,
}) {
  const isB2b = variant === 'b2b';
  const accent = isB2b ? '#10B981' : '#06B6D4';
  const accentSoft = isB2b ? 'rgba(16,185,129,0.3)' : 'rgba(6,182,212,0.3)';
  const progressGrad = isB2b ? 'linear-gradient(90deg, #10B981, #06B6D4)' : 'linear-gradient(90deg, #06B6D4, #8B5CF6)';
  const topBarGrad = isB2b ? 'linear-gradient(90deg, #10B981, #06B6D4)' : 'linear-gradient(90deg, #06B6D4, #8B5CF6)';

  const steps = getTrackerSteps(ticket);
  const stepIdx = getStepIndex(ticket);
  const banner = getStatusBanner(ticket);
  const isPending = ticket.status === 'PENDING';
  const showPickupOtp = showsPickupOtpSection(ticket);
  const showDeliveryOtp = showsDeliveryOtpSection(ticket);

  return (
    <div
      style={{
        background: '#1E293B',
        borderRadius: 24,
        border: `1px solid ${accentSoft}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: topBarGrad }} />

      {isPending ? (
        <div
          style={{
            height: 200,
            background: '#0B1120',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            className="pulsing-radar"
            style={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${isB2b ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.15)'} 0%, transparent 70%)`,
              border: `1px dashed ${isB2b ? 'rgba(16,185,129,0.3)' : 'rgba(6,182,212,0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              top: 30,
            }}
          >
            <Truck size={28} color={accent} />
            <div className="radar-wave-1" />
            <div className="radar-wave-2" />
          </div>
          <div style={{ textAlign: 'center', zIndex: 1, marginTop: 80 }}>
            <div
              style={{
                background: 'rgba(234, 88, 12, 0.1)',
                border: '1px solid #EA580C',
                padding: '6px 16px',
                borderRadius: 100,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span className="pulse-dot" style={{ width: 8, height: 8, background: '#EA580C', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>
                {isB2b ? 'Broadcasting SLA dispatch (8km radius)...' : 'Broadcasting Rescue Request (8km Radius)...'}
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>Awaiting acceptance from nearby service partners</p>
          </div>
        </div>
      ) : (
        <div
          style={{
            height: 200,
            background: '#0B1120',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <MapIcon size={100} color={isB2b ? 'rgba(16,185,129,0.05)' : 'rgba(6,182,212,0.05)'} style={{ position: 'absolute' }} />
          <div style={{ textAlign: 'center', zIndex: 1, padding: '0 24px' }}>
            {isDeliveryPartnerTicket(ticket) && (
              <span
                style={{
                  display: 'inline-block',
                  marginBottom: 10,
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  color: '#93C5FD',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 100,
                  textTransform: 'uppercase',
                }}
              >
                Delivery Partner Flow
              </span>
            )}
            <div
              style={{
                background: banner.tone === 'pending' ? 'rgba(234, 88, 12, 0.15)' : isB2b ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
                border: `1px solid ${banner.tone === 'pending' ? '#EA580C' : accent}`,
                padding: '10px 20px',
                borderRadius: 100,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: banner.tone === 'pending' ? '#EA580C' : accent,
                  boxShadow: `0 0 10px ${banner.tone === 'pending' ? '#EA580C' : accent}`,
                }}
              />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>
                {isB2b && !isPending ? 'Enterprise SLA: ' : ''}
                {banner.title}
                {ticket.status === 'TECH_DISPATCHED' && !isDeliveryPartnerTicket(ticket) && (
                  <>
                    {' '}
                    in <LiveArrivalTimer createdAt={ticket.createdAt} color={accent} />
                  </>
                )}
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>{banner.subtitle}</p>
            {isB2b && (
              <p style={{ color: '#64748B', fontSize: 12, margin: '8px 0 0' }}>
                Ticket ID: {ticket.ticketId?.substring(0, 8).toUpperCase()}
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: accent, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '1px' }}>
              {ticket.applianceCategory}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: '#fff' }}>
              {ticket.applianceProduct}
              {!isB2b && ticket.applianceBrand ? ` (${ticket.applianceBrand})` : ''}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 14 }}>
              {isB2b ? 'Reported Issue: ' : 'Issue: '}
              {ticket.issueDescription}
            </p>
            {(ticket.applianceModel || ticket.purchaseYear) && (
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                {isB2b
                  ? `Asset: ${ticket.applianceBrand || '—'} (${ticket.purchaseYear || 'N/A'})`
                  : `Model: ${ticket.applianceModel} • Year: ${ticket.purchaseYear}`}
              </p>
            )}

            {showPickupOtp && (
              <div style={{ marginTop: 20, padding: 20, background: 'rgba(234, 88, 12, 0.05)', borderRadius: 16, border: '1px solid rgba(234, 88, 12, 0.2)' }}>
                <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 12px' }}>
                  {isDeliveryPartnerTicket(ticket)
                    ? 'Courier is at your site — exchange loaner for the broken device.'
                    : 'Technician is on site — verify identity with mutual OTP.'}
                </p>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ color: '#EA580C', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Your Pickup OTP</span>
                    <span style={{ color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '2px', background: 'rgba(234,88,12,0.1)', padding: '6px 16px', borderRadius: 8, display: 'inline-block' }}>
                      {ticket.pickupOtp || 'Syncing...'}
                    </span>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 16, flex: 1, minWidth: 200 }}>
                    <span style={{ color: accent, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      {isDeliveryPartnerTicket(ticket) ? "Verify Courier OTP" : "Verify Technician OTP"}
                    </span>
                    {ticket.workerPickupOtpVerified ? (
                      <div style={{ color: '#10B981', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={16} /> Verified
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="OTP"
                          value={workerPickupOtpInput}
                          onChange={(e) => setWorkerPickupOtpInput(e.target.value)}
                          style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, color: '#fff', width: 100, fontSize: 16, fontWeight: 700, textAlign: 'center' }}
                        />
                        <button
                          type="button"
                          onClick={() => onVerifyPickupOtp(ticket.ticketId)}
                          style={{ background: 'linear-gradient(135deg, #FF5A1F, #EA580C)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {otpErrorMsg && showPickupOtp && (
                  <div style={{ color: '#EF4444', fontSize: 12, fontWeight: 600, marginTop: 8 }}>{otpErrorMsg}</div>
                )}
              </div>
            )}

            {showDeliveryOtp && (
              <div style={{ marginTop: 20, padding: 20, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 16, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 12px' }}>
                  {isDeliveryPartnerTicket(ticket)
                    ? 'Courier is returning your repaired device — verify delivery OTP.'
                    : 'Technician is delivering your repaired device.'}
                </p>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ color: '#10B981', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Your Delivery OTP</span>
                    <span style={{ color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '2px', background: 'rgba(16,185,129,0.1)', padding: '6px 16px', borderRadius: 8, display: 'inline-block' }}>
                      {ticket.deliveryOtp || 'Syncing...'}
                    </span>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 16, flex: 1, minWidth: 200 }}>
                    <span style={{ color: accent, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Verify {isDeliveryPartnerTicket(ticket) ? 'Courier' : 'Technician'} OTP
                    </span>
                    {ticket.workerDeliveryOtpVerified ? (
                      <div style={{ color: '#10B981', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={16} /> Delivery Verified
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="OTP"
                          value={workerDeliveryOtpInput}
                          onChange={(e) => setWorkerDeliveryOtpInput(e.target.value)}
                          style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, color: '#fff', width: 100, fontSize: 16, fontWeight: 700, textAlign: 'center' }}
                        />
                        <button
                          type="button"
                          onClick={() => onVerifyDeliveryOtp(ticket.ticketId)}
                          style={{ background: progressGrad, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={() => onCancel(ticket.ticketId)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#EF4444',
                padding: '8px 16px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <XCircle size={14} /> {isB2b ? 'Cancel SLA' : 'Cancel'}
            </button>
            <CancellationTimer
              createdAt={ticket.createdAt}
              fineLabel={isB2b ? 'SLA cancellation fine now applies (₹150)' : undefined}
            />
          </div>
        </div>

        <div style={{ background: '#0B1120', borderRadius: 16, padding: '24px 16px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1, minWidth: steps.length * 88 }}>
            <div style={{ position: 'absolute', top: 14, left: 24, right: 24, height: 4, background: 'rgba(255,255,255,0.05)', zIndex: -1, borderRadius: 2 }} />
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 24,
                width: steps.length > 1 ? `calc(${(Math.max(stepIdx, 0) / (steps.length - 1)) * 100}% - 48px)` : '0%',
                height: 4,
                background: progressGrad,
                zIndex: -1,
                transition: 'width 0.5s ease',
                borderRadius: 2,
              }}
            />
            {steps.map((step, idx) => {
              const isCompleted = idx <= stepIdx;
              const isActive = idx === stepIdx;
              return (
                <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1, minWidth: 72 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isCompleted ? accent : '#1E293B',
                      border: `3px solid ${isCompleted ? accentSoft : '#0B1120'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? `0 0 18px ${isB2b ? 'rgba(16,185,129,0.5)' : 'rgba(6,182,212,0.5)'}` : 'none',
                    }}
                  >
                    {isCompleted && <CheckCircle2 size={16} color="#fff" />}
                  </div>
                  <span
                    style={{
                      color: isActive ? '#fff' : '#64748B',
                      fontSize: 11,
                      fontWeight: isActive ? 800 : 600,
                      textAlign: 'center',
                      lineHeight: 1.3,
                      maxWidth: 76,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
