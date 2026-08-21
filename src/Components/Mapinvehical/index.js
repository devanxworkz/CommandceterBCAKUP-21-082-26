import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
  Circle
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* Fix Leaflet marker icons */
const vehicleIcon = new L.Icon({
  iconUrl:
    "https://image2url.com/r2/bucket1/images/1766578509361-ef3335af-97c7-4ad0-8751-85d2c3620c1e.png",
  iconSize: [55,45],     // width = height
  iconAnchor: [32, 32],   // popup position
});


const INDIA_BOUNDS = [
  [6.4627, 68.1097],   // Southwest corner
  [35.5133, 97.3954]   // Northeast corner
];


/* ================= MAP SEARCH CONTROLLER ================= */
function SearchController({ place, setBoundary, setFallbackCircle }) {
  const map = useMap();

  useEffect(() => {
    if (!place || !map) return;

    const lat = Number(place.lat);
    const lon = Number(place.lon);

    try {
      // ✅ If polygon exists
      if (
        place.geojson &&
        (place.geojson.type === "Polygon" ||
          place.geojson.type === "MultiPolygon")
      ) {
        setFallbackCircle(null);
        setBoundary(place.geojson);

        const geoLayer = L.geoJSON(place.geojson);
        const bounds = geoLayer.getBounds();

        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [20, 20],
            duration: 1.2
          });
        }
      } else {
        // ✅ Fallback circle
        setBoundary(null);

        const circle = L.circle([lat, lon], { radius: 15000 });
        const bounds = circle.getBounds();

        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [20, 20],
            duration: 1.2
          });
        }

        setFallbackCircle({
          center: [lat, lon],
          radius: 15000
        });
      }
    } catch (err) {
      console.error("Map zoom error:", err);

      // emergency fallback
      map.setView([lat, lon], 10);
    }
  }, [place, map, setBoundary, setFallbackCircle]);

  return null;
}

/* ================= MAIN ================= */
export default function Mapinvehical({ onVehicleSelect }) {
  const navigate = useNavigate();
  const wsRef = useRef(null);

  const [vehicles, setVehicles] = useState({});
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [boundary, setBoundary] = useState(null);
  const [fallbackCircle, setFallbackCircle] = useState(null);
  const searchTimeout = useRef(null);
  /* -------- SEARCH -------- */
const fetchPlaces = async (text) => {
  if (text.length < 3) {
    setSuggestions([]);
    return;
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&addressdetails=1&` +
      `q=${encodeURIComponent(text)}&countrycodes=in&limit=5`
    );

    const data = await res.json();
    setSuggestions(data);
  } catch (err) {
    console.error(err);
    setSuggestions([]);
  }
};



const selectPlace = async (place) => {
  setQuery(place.display_name);
  setSuggestions([]);
  setHighlightIndex(-1);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&polygon_geojson=1&addressdetails=1&` +
      `q=${encodeURIComponent(place.display_name)}&countrycodes=in&limit=1`
    );

    const data = await res.json();

    if (data.length && data[0].geojson) {
      setSelectedPlace(data[0]);
    } else {
      setSelectedPlace(place);
    }
  } catch {
    setSelectedPlace(place);
  }
};


  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      selectPlace(
        highlightIndex >= 0 ? suggestions[highlightIndex] : suggestions[0]
      );
    }
  };

  

  useEffect(() => {
  fetch("https://commandcenter.rivotmotors.com/api/vehicles")
    .then(res => res.json())
    .then(data => {
      const obj = {};
      data.forEach(v => {
        const lat = Number(v.latitude ?? v.lat);
        const lng = Number(v.longitude ?? v.lng);
        if (!lat || !lng) return;

        obj[v.vin || v.vinnumber] = {
          vinnumber: v.vin || v.vinnumber,
          ownername: v.owner || v.ownername || "Unknown",
          phonenumber: v.phonenumber || "Not Available",  // 🔥 ADD THIS
          lat,
          lng
        };
      });
      setVehicles(obj);
    });
}, []);


  const clearSearch = () => {
  setQuery("");
  setSuggestions([]);
  setHighlightIndex(-1);
  setSelectedPlace(null);
  setBoundary(null);
  setFallbackCircle(null);
};

  useEffect(() => {
    wsRef.current = new WebSocket("wss://commandcenter.rivotmotors.com/live");
    wsRef.current.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.type === "vehicle_location") {
        setVehicles(prev => ({
          ...prev,
          [msg.vin]: {
            ...prev[msg.vin],
            lat: Number(msg.lat),
            lng: Number(msg.lng)
          }
        }));
      }
    };
    return () => wsRef.current?.close();
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
           background: "#0b0b0b",
      padding: 12,
      position: "relative",
    zIndex: 20,
    zIndex: 10000,
          }}
      >

  <div style={{ width: 420, position: "relative" }}>
  <div style={{ display: "flex", position: "relative" }}>
  <input
    value={query}
   onChange={(e) => {
  const value = e.target.value;
  setQuery(value);

  if (searchTimeout.current) {
    clearTimeout(searchTimeout.current);
  }

  searchTimeout.current = setTimeout(() => {
    fetchPlaces(value);
  }, 400);
}}


    onKeyDown={handleKeyDown}
    placeholder="Search city / district"
    style={{
      flex: 1,
      padding: "10px 40px 10px 16px", 
      borderRadius: "20px 0 0 20px",
      border: "1px solid #444",
      background: "#111",
      color: "#fff",
      outline: "none"
    }}
  />

  {query && (
    <button
      onClick={clearSearch}
      style={{
        position: "absolute",
        right: 60,
        top: "50%",
        transform: "translateY(-50%)",
        background: "transparent",
        border: "none",
        color: "#aaa",
        cursor: "pointer",
        fontSize: 16
      }}
      title="Clear"
    >
      ✕
    </button>
  )}

  <button
    onClick={() => {
      if (suggestions.length) selectPlace(suggestions[0]);
    }}
    style={{
      width: 50,
      borderRadius: "0 20px 20px 0",
      border: "1px solid #444",
      background: "#1e1e1e",
      color: "#fff",
      cursor: "pointer",
      paddingLeft:"15px"
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
</svg>
  </button>
</div>
          {/* 🔽 DROPDOWN FLOATS OVER MAP */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 54,
                left: 0,
                width: "100%",
                background: "#111",
                borderRadius: 12,
                maxHeight: 280,
                overflowY: "auto",
                zIndex: 9999,
                boxShadow: "0 10px 30px rgba(0,0,0,0.7)"
              }}
            >
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => selectPlace(s)}
                  style={{
                    padding: 12,
                    cursor: "pointer",
                    background:
                      i === highlightIndex ? "#2a2a2a" : "transparent",
                    color: "#ddd"
                  }}
                >
                  {s.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <MapContainer
          center={[22.9734, 78.6569]}
          zoom={5}
          minZoom={4}
          maxBounds={INDIA_BOUNDS}
          maxBoundsViscosity={1}
          
          style={{ height: "100%", width: "100%" }}

        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <SearchController
            place={selectedPlace}
            setBoundary={setBoundary}
            setFallbackCircle={setFallbackCircle}
          />

          {boundary && boundary.type !== "Point" && (
          <GeoJSON
            key={JSON.stringify(boundary)}
            data={boundary}
            style={{
              color: "#ff9800",
              weight: 3,
              fillOpacity: 0.08
            }}
          />
        )}
            {fallbackCircle && (
            <Circle
              center={fallbackCircle.center}
              radius={fallbackCircle.radius}
              pathOptions={{ color: "#ff9800", fillOpacity: 0.05 }}
            />
          )}

        {Object.values(vehicles).map(v => (
      <Marker
        key={v.vinnumber}
        position={[v.lat, v.lng]}
        icon={vehicleIcon}
        eventHandlers={{
          mouseover: (e) => {
            e.target.openPopup();
          },
          mouseout: (e) => {
            e.target.closePopup();
          },
          click: () => {
      onVehicleSelect(v.vinnumber);
    }
        }}
      >
    <Popup
  closeButton={false}
  className="custom-popup"
>
  <div className="popup-card">
    <div className="popup-header">
      {v.ownername}
    </div>

    <div className="popup-body">
      <div><span>VIN:</span> {v.vinnumber}</div>
      <div><span>Phone:</span> {v.phonenumber}</div>
    </div>
  </div>
</Popup>

  </Marker>
))}
        </MapContainer>
      </div>
    </div>
  );
}
