import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, Download, Sparkles } from 'lucide-react';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InvoiceModal({ invoice, onClose, onPaid, showPayButton = true, title = 'Invoice' }) {
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('UPI');
  const [localInvoice, setLocalInvoice] = useState(invoice);

  if (!localInvoice) return null;

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/invoices/${localInvoice.invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setLocalInvoice(updated);
      onPaid?.(updated);
      alert('Payment successful! Receipt saved.');
    } catch (e) {
      alert('Payment failed: ' + e.message);
    } finally {
      setPaying(false);
    }
  };

  const isPaid = localInvoice.paymentStatus === 'PAID';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ background: '#1E293B', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: '#06B6D4', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>FixSwap Invoice</p>
            <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: 0 }}>{title}</h2>
            <p style={{ color: '#64748B', fontSize: 13, margin: '6px 0 0' }}>#{localInvoice.ticketShortId} • {localInvoice.pricingModelVersion}</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div style={{ padding: '20px 28px' }}>
          <div style={{ background: '#0B1120', borderRadius: 16, padding: 16, marginBottom: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 8px' }}>Device serviced</p>
            <p style={{ color: '#fff', fontWeight: 800, margin: '0 0 4px' }}>{localInvoice.applianceProduct} ({localInvoice.applianceBrand})</p>
            <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>{localInvoice.applianceCategory} • Model {localInvoice.applianceModel || '—'} • Year {localInvoice.purchaseYear || '—'}</p>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 8 }}>Partner: {localInvoice.shopName}</p>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>Issue: {localInvoice.issueDescription}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#A78BFA', fontSize: 12, fontWeight: 700 }}>
            <Sparkles size={14} /> Dynamic pricing based on product profile & delivery path
          </div>

          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Line items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {(localInvoice.lineItems || []).map((line) => (
              <div key={line.code} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>{line.label}</p>
                  <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>{line.description}</p>
                </div>
                <span style={{ color: '#06B6D4', fontWeight: 800, whiteSpace: 'nowrap' }}>{fmt(line.amount)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row label="Subtotal" value={fmt(localInvoice.subtotal)} />
            {Number(localInvoice.b2bDiscount) > 0 && <Row label="B2B discount" value={`− ${fmt(localInvoice.b2bDiscount)}`} green />}
            <Row label="GST (18%)" value={fmt(localInvoice.gstAmount)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>Total due</span>
              <span style={{ color: '#10B981', fontWeight: 900, fontSize: 22 }}>{fmt(localInvoice.finalTotal)}</span>
            </div>
          </div>

          {(localInvoice.shopPayout > 0 || localInvoice.courierPickupPayout > 0) && (
            <div style={{ marginTop: 20, padding: 14, background: 'rgba(59,130,246,0.08)', borderRadius: 12, fontSize: 12, color: '#94A3B8' }}>
              <strong style={{ color: '#93C5FD' }}>Payout split:</strong> Shop {fmt(localInvoice.shopPayout)}
              {Number(localInvoice.courierPickupPayout) > 0 && ` • Pickup courier ${fmt(localInvoice.courierPickupPayout)}`}
              {Number(localInvoice.courierReturnPayout) > 0 && ` • Return courier ${fmt(localInvoice.courierReturnPayout)}`}
              {` • Platform ${fmt(localInvoice.platformFee)}`}
            </div>
          )}

          {showPayButton && (
            <div style={{ marginTop: 24 }}>
              {isPaid ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, background: 'rgba(16,185,129,0.1)', borderRadius: 12, color: '#10B981', fontWeight: 800 }}>
                  <CheckCircle2 size={20} /> Paid
                </div>
              ) : (
                <>
                  <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 12 }}>Select payment method</p>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {['UPI', 'CARD', 'WALLET'].map((m) => (
                      <button key={m} type="button" onClick={() => setMethod(m)} style={{ flex: 1, padding: 12, borderRadius: 10, border: method === m ? '2px solid #06B6D4' : '1px solid rgba(255,255,255,0.1)', background: method === m ? 'rgba(6,182,212,0.1)' : '#0B1120', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{m}</button>
                    ))}
                  </div>
                  <button onClick={handlePay} disabled={paying} style={{ width: '100%', background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <CreditCard size={20} /> {paying ? 'Processing...' : `Pay ${fmt(localInvoice.finalTotal)}`}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, green }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: '#94A3B8' }}>{label}</span>
      <span style={{ color: green ? '#10B981' : '#fff', fontWeight: 700 }}>{value}</span>
    </div>
  );
}
