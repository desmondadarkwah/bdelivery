import { useState, useRef, useEffect } from 'react'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

async function searchPlaces(query) {
  if (!query || query.length < 2) return []
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query + ' Ghana')}.json?access_token=${MAPBOX_TOKEN}&proximity=-0.1869,5.6037&limit=8&language=en`
    )
    const data = await res.json()
    return data.features || []
  } catch(e) { return [] }
}

async function getDistance(pickup, dropoff) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?access_token=${MAPBOX_TOKEN}`
    )
    const data = await res.json()
    if (data.routes?.[0]?.distance) {
      return parseFloat((data.routes[0].distance / 1000).toFixed(1))
    }
    return 0
  } catch(e) { return 0 }
}

function SearchInput({ label, icon, placeholder, accentColor, onSelect, onClear }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const debounce = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (selected) { setSelected(null); onClear() }
    setOpen(true)
    clearTimeout(debounce.current)
    if (val.length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounce.current = setTimeout(async () => {
      const res = await searchPlaces(val)
      setResults(res)
      setLoading(false)
      setOpen(true)
    }, 300)
  }

  const handleSelect = (feat) => {
    const name = feat.place_name
    const [lng, lat] = feat.center
    setQuery(name)
    setSelected(feat)
    setResults([])
    setOpen(false)
    onSelect(name, { lng, lat })
  }

  const handleClear = () => {
    setQuery('')
    setSelected(null)
    setResults([])
    setOpen(false)
    onClear()
  }

  const isSelected = !!selected

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'rgba(240,244,255,0.35)', marginBottom:7, display:'flex', alignItems:'center', gap:6 }}>
        <span>{icon}</span>{label}
      </div>
      <div style={{ position:'relative' }}>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => { if(query.length >= 2 && results.length > 0) setOpen(true) }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          style={{
            width:'100%', padding:'13px 48px 13px 16px',
            background: isSelected ? `rgba(${accentColor},0.07)` : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${isSelected ? `rgba(${accentColor},0.45)` : 'rgba(255,255,255,0.1)'}`,
            borderRadius:12, fontSize:14, color:'#fff', outline:'none',
            fontFamily:"'Inter',sans-serif", transition:'all 0.2s',
            boxSizing:'border-box',
          }}
          onFocusCapture={e => { e.target.style.borderColor = `rgba(${accentColor},0.6)` }}
          onBlurCapture={e => { e.target.style.borderColor = isSelected ? `rgba(${accentColor},0.45)` : 'rgba(255,255,255,0.1)' }}
        />
        <div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', gap:4 }}>
          {loading && <span style={{ fontSize:13, animation:'spin 1s linear infinite' }}>⏳</span>}
          {isSelected && (
            <button type="button" onClick={handleClear} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(240,244,255,0.4)', fontSize:16, padding:0, lineHeight:1, display:'flex', alignItems:'center' }}>✕</button>
          )}
          {!loading && !isSelected && <span style={{ fontSize:15, opacity:0.4 }}>🔍</span>}
        </div>
      </div>

      {isSelected && (
        <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:6, padding:'7px 12px', background:`rgba(${accentColor},0.08)`, borderRadius:8 }}>
          <span style={{ fontSize:13 }}>{icon}</span>
          <span style={{ fontSize:12, color:`rgb(${accentColor})`, fontWeight:500, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {query.split(',')[0]}
          </span>
          <span style={{ fontSize:11, color:'rgba(240,244,255,0.3)', flexShrink:0 }}>✓ Set</span>
        </div>
      )}

      {open && results.length > 0 && !isSelected && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:1000,
          background:'#111828', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:14, overflow:'hidden',
          boxShadow:'0 12px 40px rgba(0,0,0,0.6)',
        }}>
          {results.map((feat, i) => {
            const parts  = feat.place_name.split(',')
            const main   = parts[0]
            const detail = parts.slice(1, 3).join(',').trim()
            return (
              <div
                key={feat.id || i}
                onClick={() => handleSelect(feat)}
                style={{
                  padding:'12px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:12,
                  borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition:'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width:32, height:32, background:`rgba(${accentColor},0.12)`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                  {icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{main}</div>
                  {detail && <div style={{ fontSize:11, color:'rgba(240,244,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{detail}</div>}
                </div>
                <div style={{ fontSize:11, color:`rgba(${accentColor},0.6)`, flexShrink:0 }}>Select →</div>
              </div>
            )
          })}
        </div>
      )}

      {open && !loading && query.length >= 2 && results.length === 0 && !isSelected && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:1000, background:'#111828', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:'16px', textAlign:'center', color:'rgba(240,244,255,0.35)', fontSize:13 }}>
          No results found for "{query}"
        </div>
      )}
    </div>
  )
}

export default function LocationPicker({ onPickupChange, onDropoffChange, onDistanceChange }) {
  const [pickupCoords, setPickupCoords]   = useState(null)
  const [dropoffCoords, setDropoffCoords] = useState(null)
  const [distance, setDistance]           = useState(null)
  const [calculating, setCalculating]     = useState(false)

  const handlePickup = async (name, coords) => {
    setPickupCoords(coords)
    onPickupChange(name, coords)
    setDistance(null)
    onDistanceChange(0)
    if (dropoffCoords) await calcDistance(coords, dropoffCoords)
  }

  const handleDropoff = async (name, coords) => {
    setDropoffCoords(coords)
    onDropoffChange(name, coords)
    setDistance(null)
    onDistanceChange(0)
    if (pickupCoords) await calcDistance(pickupCoords, coords)
  }

  const clearPickup = () => {
    setPickupCoords(null)
    setDistance(null)
    onPickupChange('', null)
    onDistanceChange(0)
  }

  const clearDropoff = () => {
    setDropoffCoords(null)
    setDistance(null)
    onDropoffChange('', null)
    onDistanceChange(0)
  }

  const calcDistance = async (pickup, dropoff) => {
    setCalculating(true)
    const km = await getDistance(pickup, dropoff)
    setDistance(km)
    onDistanceChange(km)
    setCalculating(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <SearchInput
        label="Pickup Location"
        icon="📍"
        placeholder="e.g. Madina, Lapaz, Accra Mall..."
        accentColor="249,115,22"
        onSelect={handlePickup}
        onClear={clearPickup}
      />

      {pickupCoords && dropoffCoords && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 8px' }}>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
          <div style={{ fontSize:18, opacity:0.4 }}>↕</div>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
        </div>
      )}

      <SearchInput
        label="Drop-off Location"
        icon="🎯"
        placeholder="e.g. East Legon, Tema, Osu..."
        accentColor="34,197,94"
        onSelect={handleDropoff}
        onClear={clearDropoff}
      />

      {/* Distance Result */}
      {calculating && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'rgba(255,255,255,0.03)', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize:16 }}>⏳</span>
          <span style={{ fontSize:13, color:'rgba(240,244,255,0.4)' }}>Calculating distance...</span>
        </div>
      )}

      {distance !== null && !calculating && (
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(249,115,22,0.05))', border:'1px solid rgba(249,115,22,0.25)', borderRadius:14, animation:'fadeIn 0.3s ease' }}>
          <div style={{ width:40, height:40, background:'rgba(249,115,22,0.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>📏</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:'rgba(240,244,255,0.35)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.06em' }}>Distance</div>
            <div style={{ fontSize:20, fontWeight:800, color:'#f97316', fontFamily:"'Syne',sans-serif", lineHeight:1 }}>{distance} km</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:'rgba(240,244,255,0.3)', marginBottom:2 }}>Est. fee added</div>
            <div style={{ fontSize:13, color:'#f97316', fontWeight:600 }}>+GHS {(distance * 2).toFixed(0)}</div>
          </div>
        </div>
      )}

      {/* Helper tip */}
      {(!pickupCoords || !dropoffCoords) && (
        <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 14px', background:'rgba(255,255,255,0.02)', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize:14, flexShrink:0 }}>💡</span>
          <span style={{ fontSize:12, color:'rgba(240,244,255,0.35)', lineHeight:1.6 }}>
            Type at least 2 characters to search for a location in Ghana. Select from the dropdown to confirm.
          </span>
        </div>
      )}
    </div>
  )
}