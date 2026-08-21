import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon warnings
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function useLeafletMap() {
  const map = useMap();
  return map;
}

// ---------- AUTO ZOOM ----------
function AutoZoom({ targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.flyTo(map.getCenter(), targetZoom, { duration: 1.5 });
  }, [map, targetZoom]);
  return null;
}
// ---------- AUTO PAN ----------
function AutoPanMap({ position }) {
  const map = useMap();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!position) return;

    if (isFirstLoad.current) {
      map.setView(position, 18);
      isFirstLoad.current = false;
      return;
    }

    map.panTo(position, { animate: true, duration: 0.5 });
  }, [position]);

  return null;
}

// ---------- HEADING CALCULATOR (FIXED) ----------
function getHeading(start, end) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;

  const lat1 = toRad(start.lat);
  const lat2 = toRad(end.lat);
  const dLon = toRad(end.lng - start.lng);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let brng = toDeg(Math.atan2(y, x));

  return (brng + 360) % 360; // normalize 0–360
}

// ---------- SCOOTER MARKER (Smooth & Stable) ----------
function SmoothMarker({  position, onHover, onLeave  }) {
  const markerRef = useRef();
 
const lastPos = useRef(position);
  const lastAngle = useRef(0);
  const [angle, setAngle] = useState(0);
  const [turnDiff, setTurnDiff] = useState(0);
const IMAGE_OFFSET = 0;

  useEffect(() => {
    if (!position || !position.lat || !position.lng) return;
    

    const isSame =
    lastPos.current &&
    Math.abs(position.lat - lastPos.current.lat) < 0.000001 &&
    Math.abs(position.lng - lastPos.current.lng) < 0.000001;

  if (isSame) {
    return; // 🚫 STOP everything (no move, no rotate)
  }

    if (
  lastPos.current &&
  position.lat === lastPos.current.lat &&
  position.lng === lastPos.current.lng
) {
  // ❌ No movement → do NOTHING
  return;
}

    const start = lastPos.current || position;
    const end = position;

    // const angleDiff = Math.abs(((targetAngle - lastAngle.current + 540) % 360) - 180);

// 🔥 dynamic duration
// const duration = Math.max(400, Math.min(1000, angleDiff * 5));
    let startTime = null;

const distance = Math.sqrt(
  Math.pow(end.lat - start.lat, 2) +
  Math.pow(end.lng - start.lng, 2)
);

// 👉 calculate target direction FIRST
let targetAngle = lastAngle.current;

if (distance >= 0.00005) {
  targetAngle = getHeading(start, end);
}

// 👉 now safe to calculate difference
const diff = turnDiff;
setTurnDiff(diff); // ✅ ONLY ONCE here

const angleDiff = Math.abs(diff);

// 🔥 realistic turning duration
const duration = Math.max(400, Math.min(1000, angleDiff * 6));


    const animate = (time) => {
  if (!startTime) startTime = time;

  const t = Math.min((time - startTime) / duration, 1);
  const progress = 1 - Math.pow(1 - t, 3);

  const lat = start.lat + (end.lat - start.lat) * progress;
  const lng = start.lng + (end.lng - start.lng) * progress;

  // ✅ FIX: prevent angle change when movement is tiny
let angle;

if (distance < 0.00001) {
  angle = lastAngle.current;
} else {
  let diff = targetAngle - lastAngle.current;

  // normalize (-180 to +180)
  diff = ((diff + 540) % 360) - 180;

 

  // ease-in-out for natural turning
const turnProgress = 0.5 - Math.cos(progress * Math.PI) / 2;

// slight overshoot effect (real steering feel)
const overshoot = diff * 0.15 * Math.sin(progress * Math.PI);

angle = lastAngle.current + diff * turnProgress + overshoot;
}

// 🔥 THIS LINE WAS MISSING
setAngle(angle);

      if (markerRef.current) {
        const marker = markerRef.current;
        marker.setLatLng([lat, lng]);

//         
              }
if (progress < 1) {
  requestAnimationFrame(animate); // 🔥 KEEP ANIMATING
} else {
  lastPos.current = end;

  if (distance >= 0.000005) {
    lastAngle.current = targetAngle;
  }
}

    };

    requestAnimationFrame(animate);
  }, [position]);


const createScooterIcon = (angle, turnDiff) => {
  const lean = Math.max(-10, Math.min(10, turnDiff * 0.3));

  return L.divIcon({
    className: "scooter-icon",
    html: `
      <div style="
        transform: rotate(${angle + IMAGE_OFFSET}deg) skewX(${lean}deg);
        transition: transform 0.15s linear;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <img 
          src="https://image2url.com/r2/bucket1/images/1766578509361-ef3335af-97c7-4ad0-8751-85d2c3620c1e.png" 
          style="width:55px;height:45px;"
        />
      </div>
    `,
    iconSize: [55, 45],
    iconAnchor: [27, 22],
  });
};


  return <Marker
    ref={markerRef}
     position={position}
    icon={createScooterIcon(angle, turnDiff)}
    eventHandlers={{
      mouseover: onHover,
      mouseout: onLeave,
      mousemove: onHover,
    }}
  />
}

// ---------- MAIN COMPONENT ----------
export default function LiveTracker({ vin, liveData,selectedOptions }) {
  // console.log("Live websocket data:", liveData);
  const [angle, setAngle] = useState(0);
 

  const [points, setPoints] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const tooltipRef = useRef(null);
  const mapRef = useRef();
  const animationRef = useRef(null);

  const parseExtraData = (dataStr) => {
  if (!dataStr) return {};

  const obj = {};

  dataStr.split(",").forEach((item) => {
    const [key, value] = item.split("=");
    if (key && value) obj[key.trim()] = value.trim();
  });

  return obj;
};


const parsePowerState = (str) => {
  if (!str) return {};

  const obj = {};
  str.split(",").forEach((item) => {
    if (item.includes("=")) {
      const [k, v] = item.split("=");
      obj[k.trim()] = v.trim();
    } else {
      obj.state = item.trim();
    }
  });

  return obj;
};

 const generateTooltipHTML = () => {
  if (!liveData) return "";

  const extra = parseExtraData(liveData.data);
  const power = parsePowerState(liveData.ev_power_state);

  const fields = {
    "Speed (km/h)": liveData.speed_kmph,
    "Trip (km)": liveData.tripkm,
    "inah_by_charger" : liveData.inah_by_charger,
    "inah_by_regen" : liveData.inah_by_regen,
    "Battery voltage (V)": liveData.batvoltage,
    "SOC (%)": liveData.soc,
    "APU SOC": liveData.apusoc,
    "Motor temp (°C)": liveData.motortemp,
    "Controller mosfet temp (°C)": liveData.controllermostemp,
    "BMS mosfet temp (°C)": liveData.bmsmostemp,
    "Inah (Ah)": liveData.inah,
    "Outah (Ah)": liveData.outah,
    "Remaining capacity (Ah)": liveData.remainingcapacity_ah,
    "Current consumption (A)": liveData.currentconsumption,
    "Rider Status": liveData.currentrider,
    "Power State": power.state,
    "Current Gear": power.CurrentGear,
    "Range": extra.Range,
    "Reco Engine": extra.recoEngine,
    "Tire Pressure": liveData.tirepressure,
    "Time": liveData.time,
    "Lat-long": liveData.lat_long,
  };

  return `
    <div style="
      background: rgba(0,0,0,0.85);
      color: white;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12px;
      max-width: 260px;
    ">
      ${selectedOptions
        .map(
          (key) =>
            `<div><b>${key}:</b> ${fields[key] ?? "-"}</div>`
        )
        .join("")}
    </div>
  `;
};

 useEffect(() => {
  if (!liveData?.lat_long) return;

  const parts = liveData.lat_long.split(",");

  if (parts.length !== 2) return;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  // ❗ VERY IMPORTANT CHECK
  if (isNaN(lat) || isNaN(lng)) return;

  const newPoint = { lat, lng };

  setPoints((prev) => {
    if (
      !prev.length ||
      prev[prev.length - 1].lat !== lat ||
      prev[prev.length - 1].lng !== lng
    ) {
      return [...prev, newPoint];
    }
    return prev;
  });

  setCurrentPos((prev) => {
  if (
    prev &&
    Math.abs(prev.lat - lat) < 0.000001 &&
    Math.abs(prev.lng - lng) < 0.000001
  ) {
    return prev; // ✅ NO UPDATE → no re-render
  }
  return newPoint;
});
}, [liveData]); 


  return (
    <div style={{ height: "100%", width: "100%" }}>
      <style>
        {`
          .leaflet-marker-icon {
            z-index: 9999 !important;
          }
        `}
      </style>

      <MapContainer
        center={currentPos || [20.5937, 78.9629]}
        zoom={17}
        minZoom={3}
        maxZoom={21}
        scrollWheelZoom={true}
        zoomControl={true}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoZoom targetZoom={18} />
        <AutoPanMap position={currentPos} />

        {points.length > 1 && (
          <Polyline positions={points} color="#00BFFF" weight={4} opacity={0.9} />
        )}
{currentPos && (
      <SmoothMarker
  position={currentPos}
  
onHover={(e) => {
  if (!tooltipRef.current || !e?.originalEvent) return;

  tooltipRef.current.innerHTML = generateTooltipHTML();
  tooltipRef.current.style.display = "block";

  const mapContainer = e.target._map.getContainer();
  const mapRect = mapContainer.getBoundingClientRect();

  tooltipRef.current.style.left =
    e.originalEvent.clientX - mapRect.left + 15 + "px";

  tooltipRef.current.style.top =
    e.originalEvent.clientY - mapRect.top + 10 + "px";
}}

  onLeave={() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = "none";
    }
  }}
/>
)}
      </MapContainer>
     <div
  ref={tooltipRef}
  style={{
    position: "absolute",
    display: "none",
    zIndex: 9999,
    pointerEvents: "none",
  }}
/>
    </div>
  );
}
