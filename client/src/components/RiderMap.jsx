import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function RiderMap({ pickup, dropoff, pickupCoords, dropoffCoords }) {
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }

    // Default center — Accra
    const defaultCenter = [-0.1869, 5.6037]

    mapInstance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: defaultCenter,
      zoom: 11,
    })

    mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapInstance.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    }), 'top-right')

    mapInstance.current.on('load', async () => {
      // If we have coords from DB use them, else geocode from address
      let pCoords = pickupCoords
      let dCoords = dropoffCoords

      if (!pCoords && pickup) pCoords = await geocode(pickup)
      if (!dCoords && dropoff) dCoords = await geocode(dropoff)

      if (pCoords) {
        new mapboxgl.Marker({ color: '#f97316' })
          .setLngLat([pCoords.lng, pCoords.lat])
          .setPopup(new mapboxgl.Popup({ offset:25 }).setHTML(`
            <div style="font-family:Inter,sans-serif;padding:4px">
              <div style="font-size:11px;color:#f97316;font-weight:700;margin-bottom:3px">📍 PICKUP</div>
              <div style="font-size:12px;font-weight:600">${pickup}</div>
            </div>
          `))
          .addTo(mapInstance.current)
      }

      if (dCoords) {
        new mapboxgl.Marker({ color: '#22c55e' })
          .setLngLat([dCoords.lng, dCoords.lat])
          .setPopup(new mapboxgl.Popup({ offset:25 }).setHTML(`
            <div style="font-family:Inter,sans-serif;padding:4px">
              <div style="font-size:11px;color:#22c55e;font-weight:700;margin-bottom:3px">🎯 DROP-OFF</div>
              <div style="font-size:12px;font-weight:600">${dropoff}</div>
            </div>
          `))
          .addTo(mapInstance.current)
      }

      // Draw route if both coords exist
      if (pCoords && dCoords) {
        try {
          const res = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${pCoords.lng},${pCoords.lat};${dCoords.lng},${dCoords.lat}?geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
          )
          const data = await res.json()
          const route = data.routes?.[0]?.geometry

          if (route) {
            mapInstance.current.addSource('route', {
              type: 'geojson',
              data: { type:'Feature', properties:{}, geometry: route }
            })
            mapInstance.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: { 'line-join':'round', 'line-cap':'round' },
              paint: { 'line-color':'#f97316', 'line-width':4, 'line-opacity':0.85 }
            })
          }
        } catch(e) { console.error(e) }

        // Fit map to show both markers
        const bounds = new mapboxgl.LngLatBounds()
        bounds.extend([pCoords.lng, pCoords.lat])
        bounds.extend([dCoords.lng, dCoords.lat])
        mapInstance.current.fitBounds(bounds, { padding:60, maxZoom:14 })
      } else if (pCoords) {
        mapInstance.current.flyTo({ center:[pCoords.lng, pCoords.lat], zoom:14 })
      } else if (dCoords) {
        mapInstance.current.flyTo({ center:[dCoords.lng, dCoords.lat], zoom:14 })
      }
    })

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
  }, [pickup, dropoff, pickupCoords, dropoffCoords])

  return (
    <div style={{ position:'relative' }}>
      <div ref={mapRef} style={{ width:'100%', height:280, borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }} />
      <div style={{ position:'absolute', bottom:10, left:10, display:'flex', flexDirection:'column', gap:6, zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(11,15,26,0.85)', padding:'4px 10px', borderRadius:100, backdropFilter:'blur(6px)' }}>
          <div style={{ width:8, height:8, background:'#f97316', borderRadius:'50%' }} />
          <span style={{ fontSize:11, color:'#fff', fontFamily:'Inter,sans-serif' }}>Pickup</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(11,15,26,0.85)', padding:'4px 10px', borderRadius:100, backdropFilter:'blur(6px)' }}>
          <div style={{ width:8, height:8, background:'#22c55e', borderRadius:'50%' }} />
          <span style={{ fontSize:11, color:'#fff', fontFamily:'Inter,sans-serif' }}>Drop-off</span>
        </div>
      </div>
    </div>
  )
}

async function geocode(address) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address + ' Ghana')}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&proximity=-0.1869,5.6037&limit=1`
    )
    const data = await res.json()
    const feat = data.features?.[0]
    if (feat) return { lng: feat.center[0], lat: feat.center[1] }
    return null
  } catch(e) { return null }
}