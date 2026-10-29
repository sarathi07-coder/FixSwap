import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader } from 'lucide-react';

export default function LocationPicker({ onLocationConfirm, accentColor = '#06B6D4' }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(true);

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  };

  // Auto-detect location on mount — silent, no prompts
  const detectLocation = async () => {
    setLocating(true);

    // 1. Try browser GPS (works on HTTPS / hosted servers)
    if ("geolocation" in navigator) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 6000,
          });
        });
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const addr = await reverseGeocode(lat, lon);
        setPosition([lat, lon]);
        setAddress(addr);
        onLocationConfirm({ lat, lon, address: addr });
        setLocating(false);
        return;
      } catch (e) {
        // GPS blocked on localhost — expected, continue to fallback
      }
    }

    // 2. IP Geolocation fallback (works everywhere)
    const apis = [
      { url: 'https://ipwho.is/', getLat: d => d.latitude, getLon: d => d.longitude, getCity: d => `${d.city}, ${d.region}, ${d.country}` },
      { url: 'https://freeipapi.com/api/json', getLat: d => d.latitude, getLon: d => d.longitude, getCity: d => `${d.cityName}, ${d.regionName}, ${d.countryName}` },
      { url: 'https://ipapi.co/json/', getLat: d => d.latitude, getLon: d => d.longitude, getCity: d => `${d.city}, ${d.region}, ${d.country_name}` },
    ];
    for (const api of apis) {
      try {
        const res = await fetch(api.url);
        if (!res.ok) continue;
        const data = await res.json();
        const lat = api.getLat(data);
        const lon = api.getLon(data);
        if (lat && lon) {
          const addr = api.getCity(data);
          setPosition([lat, lon]);
          setAddress(addr);
          onLocationConfirm({ lat, lon, address: addr });
          setLocating(false);
          return;
        }
      } catch { continue; }
    }

    // 3. Final fallback — use default coordinates (for demo/presentation)
    const defaultLat = 13.0827;
    const defaultLon = 80.2707;
    const defaultAddr = 'Chennai, Tamil Nadu, India';
    setPosition([defaultLat, defaultLon]);
    setAddress(defaultAddr);
    onLocationConfirm({ lat: defaultLat, lon: defaultLon, address: defaultAddr });
    setLocating(false);
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Google Maps embed URL
  const getGoogleMapUrl = () => {
    if (!position) return `https://maps.google.com/maps?q=India&z=5&output=embed`;
    return `https://maps.google.com/maps?q=${position[0]},${position[1]}&z=17&output=embed`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* LOADING STATE */}
      {locating && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: 20, background: '#0B1120', borderRadius: 16,
          border: `1px solid ${accentColor}30`,
        }}>
          <Loader size={20} color={accentColor} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: '#CBD5E1', fontSize: 15, fontWeight: 600 }}>Detecting your live location...</span>
        </div>
      )}

      {/* GOOGLE MAPS */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', height: 260,
        border: `2px solid ${position ? accentColor + '50' : 'rgba(255,255,255,0.1)'}`,
        transition: 'border 0.3s',
      }}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          loading="lazy"
          src={getGoogleMapUrl()}
        />
      </div>

      {/* DETECTED ADDRESS */}
      {address && (
        <div style={{
          background: '#0B1120', border: `1px solid ${accentColor}`,
          padding: 16, borderRadius: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <MapPin size={18} color={accentColor} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Dispatch Location</div>
              <div style={{ color: '#fff', fontSize: 14, lineHeight: 1.5 }}>{address}</div>
            </div>
          </div>
        </div>
      )}

      {/* RE-DETECT BUTTON */}
      <button
        onClick={detectLocation}
        disabled={locating}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'transparent', border: `1px solid ${accentColor}50`,
          color: accentColor, padding: '10px 16px', borderRadius: 10,
          fontWeight: 600, fontSize: 13, cursor: 'pointer',
          opacity: locating ? 0.5 : 1, transition: 'all 0.2s',
        }}
      >
        <Navigation size={14} /> Re-detect Location
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
