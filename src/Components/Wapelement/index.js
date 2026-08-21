import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const startIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const endIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],

});

function AutoFitMap({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 21);
    else {
      const bounds = L.latLngBounds(points);
      map.flyToBounds(bounds, {
  padding: [50, 50],
  maxZoom: 18, 
});
    }
  }, [points, map]);
  return null;
}

const getCurrentSplit = (nearest) => {

  const raw = nearest?.currentconsumption;
  const num = raw === null || raw === undefined ? NaN : parseFloat(raw);
  if (Number.isNaN(num) || num === 0) {
    return { consumption: "-", generation: "-" };
  }

  if (num < 0) {
    return { consumption: Math.abs(num).toFixed(2), generation: "-" };
  } else {
    return { consumption: "-", generation: num.toFixed(2) };
  }
};

function DirectionArrows({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length < 2) return;
    map.eachLayer((layer) => {
      if (layer.options && layer.options.className === "arrow-decorator") {
        map.removeLayer(layer);
      }
    });
    const decorator = L.polylineDecorator(L.polyline(positions), {
      patterns: [
        {
          offset: 20,
          repeat: 60,
          symbol: L.Symbol.arrowHead({
            pixelSize: 8,
            polygon: true,
            pathOptions: { color: "yellow", weight: 2, opacity: 0.9 },
          }),
        },
      ],
    });
    decorator.options.className = "arrow-decorator";
    decorator.addTo(map);
  }, [positions, map]);
  return null;
}

function TooltipHandler({ points, rawData, tooltipRef, selectedOptions }) {
  const map = useMap();

  const generateTooltipHTML = (nearest) => {
    if (!nearest) return "";
  const { consumption, generation } = getCurrentSplit(nearest);

  const fields = {
    speed_kmph: `<b>Speed (km/h):</b> ${nearest.speed_kmph ?? "-"}`,
    batvoltage: `<b>Battery voltage (V):</b> ${nearest.batvoltage ?? "-"}`,
    soc: `<b>SOC (%):</b> ${nearest.soc ?? "-"}`,
    apusoc: `<b>APU SOC (%):</b> ${nearest.apusoc ?? "-"}`,
    tripkm: `<b>Trip (km):</b> ${nearest.tripkm ?? "-"}`,
    lat_long: `<b>Location:</b> ${nearest.lat ?? "-"}, ${nearest.lng ?? "-"}`,
    currentconsumption: `<b>Current consumption (A):</b> ${
      nearest.currentconsumption && nearest.currentconsumption !== "0"
        ? parseFloat(nearest.currentconsumption).toFixed(2) + " A"
        : "-"
    }`,
    motortemp: `<b>Motor temp (°C):</b> ${nearest.motortemp ?? "-"}`,
    controllermostemp: `<b>Controller mosfet temp (°C):</b> ${nearest.controllermostemp ?? "-"}`,
    bmsmostemp: `<b>BMS mosfet temp (°C):</b> ${nearest.bmsmostemp ?? "-"}`,
    inah: `<b>Inah (Ah):</b> ${nearest.inah ?? "-"}`,
    outah: `<b>Outah (Ah):</b> ${nearest.outah ?? "-"}`,
    inah_by_charger: `<b>Inah by charger (Ah):</b> ${nearest.inah_by_charger ?? "-"}`,
    inah_by_regen: `<b>Inah by regen (Ah):</b> ${nearest.inah_by_regen ?? "-"}`,
    remainingcapacity_ah: `<b>Remaining capacity (Ah):</b> ${nearest.remainingcapacity_ah ?? "-"}`,
    currentrider: `<b>Rider Status:</b> ${nearest.currentrider ?? "-"}`,
    ev_power_state: `<b>Power State:</b> ${nearest.ev_power_state ?? "-"}`,
    tirepressure : `<b>Tire Pressure:</b> ${nearest.tirepressure ?? "-"}`,
    time: `<b>Time:</b> ${nearest.time ?? "-"}`
};

   const toDisplay = selectedOptions && selectedOptions.length > 0 ? [...selectedOptions, "time", "lat_long"] : [];
    if (toDisplay.length === 0) return "";
    return `
      <div style="
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 6px 10px;
        border-radius: 8px;
        font-size: 12px;
        max-width: 250px;
      ">
        ${toDisplay.map((key) => fields[key]).filter(Boolean).join("<br/>")}
      </div>
    `;
  };

  useEffect(() => {
    if (!map || !points || points.length < 2) return;

    const handleMouseMove = (e) => {
      if (!tooltipRef.current) return;
      const latlng = e.latlng;
      let nearest = null;
      let minDist = Infinity;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = L.latLng(points[i]);
        const p2 = L.latLng(points[i + 1]);
        const dist = L.LineUtil.pointToSegmentDistance(
          map.latLngToLayerPoint(latlng),
          map.latLngToLayerPoint(p1),
          map.latLngToLayerPoint(p2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = rawData[i];
        }
      }

      if (nearest && minDist < 20) {
        tooltipRef.current.innerHTML = generateTooltipHTML(nearest);
        tooltipRef.current.style.display = "block";
        const mapRect = map.getContainer().getBoundingClientRect();
        tooltipRef.current.style.left = e.originalEvent.clientX - mapRect.left + 15 + "px";
        tooltipRef.current.style.top = e.originalEvent.clientY - mapRect.top + 10 + "px";
      } else {
        tooltipRef.current.style.display = "none";
      }
    };

    map.on("mousemove", handleMouseMove);
    map.on("mouseout", () => {
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
    });

    return () => map.off("mousemove", handleMouseMove);
  }, [map, points, rawData, selectedOptions]);

  return null;
}

export default function Wapelement({ vin, start, end, applyFilter,setSelectedOptions, selectedOptions = [] }) {
  const [points, setPoints] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const tooltipRef = useRef(null);

// ✅ Copy only Lat-Long on Ctrl + C when tooltip is visible
useEffect(() => {
  const handleCopyLatLong = (e) => {
    if (e.ctrlKey && e.code === "KeyC" && tooltipRef.current && tooltipRef.current.style.display === "block") {
      const tooltipText = tooltipRef.current.innerText;
      const match = tooltipText.match(/Location:\s*([\d.\-]+),\s*([\d.\-]+)/);
      if (match) {
        const latlon = `${match[1]}, ${match[2]}`;
        navigator.clipboard.writeText(latlon)
          .then(() => {
            console.log(`✅ Copied Lat,Lng: ${latlon}`);
          })
          .catch((err) => console.error("❌ Copy failed:", err));
      } else {
        console.log("No Lat-Long found in tooltip");
      }
    }
  };

  window.addEventListener("keydown", handleCopyLatLong);
  return () => window.removeEventListener("keydown", handleCopyLatLong);
}, []);

  useEffect(() => {
    if (!vin || !start || !end) {
      setPoints([]);
      return;
    }

    setLoading(true);

const fetchRoute = async () => {
  try {
    let allData = [];
    let page = 1;
    const limit = 5000;

    while (true) {
      const res = await fetch(
        `https://commandcenter.rivotmotors.com/geolocationhistory.php?vin=${vin}&start=${encodeURIComponent(
          start
        )}&end=${encodeURIComponent(end)}&page=${page}&limit=${limit}`
      );

      const json = await res.json();

      if (!json.data || json.data.length === 0) break;

      allData = [...allData, ...json.data];

      page++;

      // safety break (avoid infinite loop)
      if (page > 50) break;
    }

    const extractMOS = (ntcArray) => {
      if (!Array.isArray(ntcArray)) return [];

      const mosIndex = ntcArray.findIndex(
        (v) => typeof v === "string" && v.includes("MOS=")
      );
      if (mosIndex === -1) return [];

      const first = Number(ntcArray[mosIndex].split("MOS=")[1]);
      const rest = ntcArray.slice(mosIndex + 1, mosIndex + 4).map(Number);

      return [first, ...rest].map((v) =>
        v === 1 ? "ON" : v === 0 ? "OFF" : "-"
      );
    };

    const extractNTC = (ntcArray) => {
      if (!Array.isArray(ntcArray)) return [];

      const ntcIndex = ntcArray.findIndex(
        (v) => typeof v === "string" && v.includes("ntc=")
      );
      if (ntcIndex === -1) return [];

      const ntcVals = ntcArray.slice(ntcIndex, ntcIndex + 4);

      if (typeof ntcVals[0] === "string" && ntcVals[0].includes("ntc=")) {
        ntcVals[0] = Number(ntcVals[0].split("ntc=")[1]);
      }

      return ntcVals;
    };

    // ---- Parse Data ----
    if (allData.length > 0) {
      const route = allData
        .map((p) => {
          const ntcArray = p.ntc_array || p.ntc || [];

          const mosVals = extractMOS(ntcArray);
          const ntcVals = extractNTC(ntcArray);

          const currentValue = Number(p.currentconsumption) || 0;
          const currentGeneration = currentValue > 0 ? currentValue : 0;
          const currentConsumption = currentValue < 0 ? Math.abs(currentValue) : 0;

         return {
  lat: parseFloat(p.lat),
  lng: parseFloat(p.lng),

  speed_kmph: p.speed_kmph,
  tripkm: p.tripkm,

  batvoltage: p.batvoltage,

  soc: p.soc,
  apusoc: p.apusoc,

  motortemp: p.motortemp,
  controllermostemp: p.controllermostemp,
  bmsmostemp: p.bmsmostemp,

  inah: p.inah,
  outah: p.outah,

  inah_by_charger: p.inah_by_charger,
  inah_by_regen: p.inah_by_regen,

  remainingcapacity_ah: p.remainingcapacity_ah,

  currentconsumption: p.currentconsumption,

  currentrider: p.currentrider,

  ev_power_state: p.ev_power_state,

  tirepressure: p.tirepressure,

  time: p.time,

  currentGeneration,
  currentConsumption,

  mos: {
    mainCharge: mosVals[0] ?? "-",
    mainDischarge: mosVals[1] ?? "-",
    apuCharge: mosVals[2] ?? "-",
    apuDischarge: mosVals[3] ?? "-",
  },

  ntc: {
    posTerminal: ntcVals[0] ?? "-",
    cell20: ntcVals[1] ?? "-",
    cell28: ntcVals[2] ?? "-",
    negTerminal: ntcVals[3] ?? "-",
  },
};
        })
        .filter((p) => p.lat && p.lng);

      setPoints(route.map((p) => ({ lat: p.lat, lng: p.lng })));
      setRawData(route);
    } else {
      setPoints([]);
      setRawData([]);
    }
  } catch (err) {
    console.error(err);
    setPoints([]);
    setRawData([]);
  } finally {
    setLoading(false);
  }
};
    fetchRoute();
  }, [vin, start, end, 
    
  ]);

const center = points.length > 0
  ? points[0]
  : { lat: 22.3511, lng: 78.6677 }; // India center

const handleCheckboxChange = (item) => {
  if (item === "Lat-long") return;
  if (selectedOptions.includes(item)) {
    setSelectedOptions(selectedOptions.filter((i) => i !== item));
  } else {
    setSelectedOptions([...selectedOptions, item]);
  }
};
  return (
    <div className = "mt-2" style={{ height: "calc(100vh - 225px)", width: "100%" }}>
      {loading && <div className="text-white p-4">Loading route...</div>}

      <MapContainer
        center={center}
        zoom={5}
        minZoom={5}
      maxZoom={25}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitMap points={points} />
        {points.length > 0 && (
          <>
            <Polyline positions={points} pathOptions={{ color: "blue", weight: 5, opacity: 0.9 }} />
            <DirectionArrows positions={points} />
            <Marker position={points[0]} icon={startIcon} />
            <Marker position={points[points.length - 1]} icon={endIcon} />
          </>
        )}
        <TooltipHandler
          points={points}
          rawData={rawData}
          tooltipRef={tooltipRef}
          selectedOptions={selectedOptions}
          
        />
      </MapContainer>

      {/* Floating tooltip */}
      <div
        className="absolute text-xs sm:text-sm md:text-base max-w-[220px] sm:max-w-[250px] md:max-w-[300px] shadow-lg"
        ref={tooltipRef}
        style={{
          position: "absolute",
          pointerEvents: "none",
          display: "none",
          zIndex: 9999,
        }}
      />
    </div>
  );
}