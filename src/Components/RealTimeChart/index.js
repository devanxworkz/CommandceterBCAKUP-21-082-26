import React, { useEffect, useMemo, useState,useRef,inputRef } from "react";
      import { useLocation } from "react-router-dom";
      import { createPortal } from "react-dom";
      import ReactECharts from "echarts-for-react";
      import { Calendar } from "lucide-react";
      import { CreditCard, User, Phone,FileText } from "lucide-react";
      import { Search } from "lucide-react"; 
      import { Zap, Power, BatteryCharging, Battery,MapPin } from "lucide-react";
      import Chart from "react-apexcharts";
      import { useNavigate } from "react-router-dom";
      import { Textfit } from "react-textfit";
      import { Home, BarChart2, Table,Map, Ticket, Command, Bus, Menu,Database,Locate , Car, X,ChevronLeft} from "lucide-react"; 
      import L from "leaflet";
      import { useMap } from "react-leaflet";
      import { Bookmark } from "lucide-react"; // Icon pack
      import { Bell } from "lucide-react";
      import {TileLayer, Polyline, Marker, Popup } from "react-leaflet";
      import "leaflet/dist/leaflet.css";

      import {
      ResponsiveContainer,
      CartesianGrid,
      XAxis,
      YAxis,
      Tooltip,
      Legend,
      LineChart,
      Line,
      ReferenceLine,
      } from "recharts";
     
      import SpeedGauge from "../SpeedGauge";
      import SpeedGaugesoc from "../Speedgaugesoc";
      import OnlyForSpeed from "../OnlyForSpeed";
      import ThreeQuarterGauge from "../ThreeQuarterGauge";
      import OnlyForsoc from '../OnlyForsoc'
      import "./index.css"
      import ThermometerCard from '../ThermometerCard'
      import CustomAlert  from "../CustomAlert";
      import Sidebar from "../Sidebar";
      import Wapelement from '../Wapelement';
      import LiveTracker from '../LiveTracker';
      import Worlelc from "../Worlelc";
      import FloatingBookmark from '../FloatingBookmark'
      import Tabledata from '../Tabledata'
      // import LiveAlerts from '../LiveAlerts'
      import TicketUi from '../TicketUi'
      import TelemetryDashboardCell from '../TelemetryDashboardCell';
      import SendCommand  from '../SendCommand';
      import Mapinvehical from '../Mapinvehical';
      import Nxdetails from '../Nxdetails';

      const fmt = {
      num(x, d = 2) {
        if (x === undefined || x === null || isNaN(Number(x))) return "--";
        const n = Number(x);
        return Math.abs(n) >= 1000 ? n.toFixed(0) : n.toFixed(d);
      },
      parseDate(t) {
        if (!t) return null;
        const d = new Date(t);
        return isNaN(d) ? null : d;
      },
      when(t) {
        const d = fmt.parseDate(t);
        return d ? `${d.toLocaleDateString()} ${d.toLocaleTimeString()}` : "";
      },
      };    
       const FOUR_HOURS = 4 * 60 * 60 * 1000;
      
      // ---------------------------------------------------------------------
      // Helper – enforce the "max 4‑hour" rule for the History Graph
      // (Copied from Worlelc – identical behaviour)
      // ---------------------------------------------------------------------
      function enforceFourHourWindow(start, end, editedSide) {
        // Ensure we have valid Date objects
        if (isNaN(start) || isNaN(end)) return { start, end };

        let diff = end - start; // ms (can be negative)

        // 1️⃣  Invalid range (Start >= End) → push the opposite side by exactly 4 h
        if (diff <= 0) {
          if (editedSide === 'start') {
            end = new Date(start.getTime() + FOUR_HOURS);
          } else {
            start = new Date(end.getTime() - FOUR_HOURS);
          }
          return { start, end };
        }

        // 2️⃣  Range > 4 h → move the *opposite* side so the window becomes 4 h
        if (diff > FOUR_HOURS) {
          if (editedSide === 'start') {
            // user changed start → keep start, move end forward
            end = new Date(start.getTime() + FOUR_HOURS);
          } else {
            // user changed end → keep end, move start backward
            start = new Date(end.getTime() - FOUR_HOURS);
          }
          return { start, end };
        }

        // 3️⃣  Valid range (≤ 4 h, > 0) → do nothing
        return { start, end };
      }

      const SectionTitle = ({ left, right }) => (
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-sm sm:text-base font-Kanit text-White">
          {left}
        </h3>
        {right}
      </div>
      );

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
      });

  const StatChip = ({ label, value, className = "", labelClassName = "" }) => (
  <div
    className={`rounded-xl p-3 flex flex-col gap-1
      bg-gradient-to-br from-black/60 via-neutral-950 to-neutral-900
      border border-white/10 shadow-md
      hover:border-orange-500/60 hover:shadow-orange-500/20
      transition-all duration-300 ${className}`}
  >
    {/* Label */}
    <span
      className={`text-[13px] sm:text-[14px] font-medium tracking-wide text-gray-400 transition-all duration-300 ${labelClassName}`}
    >
      {label}
    </span>

    {/* Value */}
    <span className="text-sm sm:text-base font-Kanit text-orange-300 truncate">
      {value}
    </span>
  </div>
);

      const StatCard = ({ label, value, icon: Icon, valueClassName }) => {
      return (
      <div
      className="flex flex-col justify-between 
                bg-gradient-to-br from-neutral-800 to-black                  
                text-white rounded-2xl p-4 
                border border-white/10 shadow-md
                hover:shadow-orange-500/20 transition
                hover:border-orange-500 
                transition-all duration-300"
      >
      {label && (
        <span className="text-sm sm:text-[14px] text-gray-400 mb-1 tracking-wide">
          {label}
        </span>
      )}
      <div className="flex items-start gap-3 text-sm sm:text-base font-Kanit">
        {Icon && (
          <div className="relative flex items-center justify-center">
            <Icon
              className="w-8 h-8 rounded-xl p-1.5
                        bg-gradient-to-br from-orange-600/30 to-orange-400/20 
                        border border-orange-500/20 
                        shadow-[0_0_15px_rgba(255,140,66,0.4)] 
                        text-orange-400"
            />
            <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/10 to-transparent opacity-40 pointer-events-none" />
          </div>
        )}
        <span
          className={`block leading-snug ${valueClassName || "whitespace-normal break-words w-full"}`}
          title={typeof value === "string" ? value : undefined}
        >
          {value}
        </span>
      </div>
      </div>
      );
      };

      
      async function getReadableLocation(lat_long) {
      if (!lat_long) return "N/A";

      let lat, lng;

      if (typeof lat_long === "object") {
      if (Array.isArray(lat_long)) {
      [lat, lng] = lat_long;
      } else {
      lat = lat_long.lat ?? lat_long.latitude;
      lng = lat_long.lng ?? lat_long.lon ?? lat_long.longitude;
      }
      } else if (typeof lat_long === "string" && lat_long.includes(",")) {
      [lat, lng] = lat_long.split(",").map((n) => parseFloat(n.trim()));
      }

      lat = parseFloat(lat);
      lng = parseFloat(lng);
      if (isNaN(lat) || isNaN(lng)) return "N/A";

      // ✅ LocalStorage cache
      const cacheKey = `loc:${lat.toFixed(5)},${lng.toFixed(5)}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;

      try {
      const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "User-Agent": "YourAppName/1.0 (your@email.com)",
          "Accept-Language": "en", 
        },
      }
      );
      const data = await res.json();
      const result = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      localStorage.setItem(cacheKey, result); // save for next time
      return result;
      } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
      }

      export function parseTirePressure(rawValue) {
      if (!rawValue || typeof rawValue !== "string") return null;

      // Match independently (order does NOT matter)
      const frontMatch = rawValue.match(/F(\d{2})(\d{2})/i);
      const rearMatch  = rawValue.match(/R(\d{2})(\d{2})/i);

      const parsed = {
      front: null,
      rear: null
      };

      if (frontMatch) {
      const [, pressure, temp] = frontMatch;
      parsed.front = {
      pressure: Number(pressure),
      temp: Number(temp),
      };
      }

      if (rearMatch) {
      const [, pressure, temp] = rearMatch;
      parsed.rear = {
      pressure: Number(pressure),
      temp: Number(temp),
      };
      }

      // If neither tire exists → null
      if (!parsed.front && !parsed.rear) return null;

      return parsed;
      }

      
      const CARD_BASE_TRANSPARENTs =
      "rounded-2xl border-2 border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),#0A0A23)] p-4 transition-colors duration-300 hover:border-[#3B82F6]";

      const CARD_BASE_TRANSPARENT =
      "rounded-2xl border-2 border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),#0A0A23)] p-4 transition-colors duration-300 hover:border-[#3B82F6]";

      const CARD_BASE = 
      "rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),#0A0A23)] p-4 transition-colors duration-300 hover:border-[#3B82F6]";

      const CARD_BASE_GLOW  =
      "rounded-2xl border border-[#3B82F6]/40 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),#0A0A23)] p-4 shadow-[0_0_18px_rgba(59,130,246,0.35)] hover:border-[#3B82F6] hover:shadow-[0_0_28px_rgba(59,130,246,0.65)] transition-colors duration-300";

      const CARD_BASE_FLAT =
      "rounded-2xl border border-white/20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.06),#0A0A23)] p-4 transition-colors duration-300 hover:border-[#3B82F6]";

      const CARD_MIN_H = "min-h-[220px]"; // same height across the grid

      const CARD_CLICK_OVERLAY =
      "absolute inset-0 rounded-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6]";

      // Wrap any content so the WHOLE card opens a modal when clicked
      function Svg({ title, children, minH = CARD_MIN_H, maxW = "max-w-5xl", glow = false }) {
      const [open, setOpen] = useState(false);
      return (
        <>
          <div
            className={`relative ${glow ? CARD_BASE_GLOW : CARD_BASE_FLAT} ${minH} 
                        transition-colors duration-300 hover:border-[#FF9913]`}
          >
            {/* Invisible overlay for click-to-expand */}
            <button
              type="button"
              className={CARD_CLICK_OVERLAY}
              aria-label={`Expand ${title || "card"}`}
              onClick={() => setOpen(true)}
            />
            <div className="relative z-10">{children}</div>
          </div>
        </>
      );
      }

      function AutoCenter({ position }) {
      const map = useMap();
      useEffect(() => {
      if (position) map.setView(position, 15);
      }, [position, map]);
      return null;
      }

      // cachekey for privent the 500+ nomintim requist 
      function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
      }

      export default function RealTimeChart({ vin: initialVin }) {
        const chartRef = useRef(null);
      const [vin, setVin] = useState(initialVin || "");
      const [vinList, setVinList] = useState([]);
      const [mode, setMode] = useState("realtime");
      const [details, setDetails] = useState([]);
      const [showInAHChart, setShowInAHChart] = useState(false);
      const [latestGauges, setLatestGauges] = useState(null);
      const [livedata, setLiveData] = useState([]); // ✅ start as empty array
      const [historyData, setHistoryData] = useState([]);
      const [showHistoryChart, setShowHistoryChart] = useState(false);
      const [ntcData, setNtcData] = useState(null);
      const [searchValue, setSearchValue] = useState("");
      const [suggestions, setSuggestions] = useState([]);
      const [showSuggestions, setShowSuggestions] = useState(false);
      const [highlightIndex, setHighlightIndex] = useState(-1);
      const [isSelecting, setIsSelecting] = useState(false);
      const [loading, setLoading] = useState(false);
      const [selectedVin, setSelectedVin] = useState(null);
      const [showMetrics1, setShowMetrics1] = useState(false);
      const [isSelected, setIsSelected] = useState(false); // ✅ new flag
      const [startDateTime, setStartDateTime] = useState(getCurrentDateTimeLocal(new Date(Date.now() - 4 * 60 * 60 * 1000)));
      const [endDateTime, setEndDateTime] = useState(getCurrentDateTimeLocal(new Date()));
      const [alertMessage, setAlertMessage] = useState("");
      const [userChanged, setUserChanged] = useState(false);
      const [locationName, setLocationName] = useState("");
      const [autoMode, setAutoMode] = useState(true); // ✅ controls auto-update
      const [editedSide, setEditedSide] = useState(null);
      const intervalRef = useRef(null);
      const [isOpen, setIsOpen] = useState(true);
      const toggleSidebar = () => setIsOpen(!isOpen);
      const [isScrolled, setIsScrolled] = useState(false);
      const inputRef = useRef(null);    
      const [locationMap, setLocationMap] = React.useState({});
      const [sidebarOpen, setSidebarOpen] = useState(false); 
      const [tick, setTick] = React.useState(0);
      const [history, setHistory] = useState([]);
      const [positions, setPositions] = useState([]); 
      const [latestPos, setLatestPos] = useState(null); 
      const [startTime, setStartTime] = useState("");
      const [endTime, setEndTime] = useState("");
      const [fetchParams, setFetchParams] = useState(null);
      const [activeTab, setActiveTab] = useState("history");
      const [loading1, setLoading1] = useState(false);
      const [autoMode1, setAutoMode1] = useState(true); 
      const [isOpens, setIsOpens] = useState(true);
      const [alerts, setAlerts] = useState([]);
      const [showAlertBox, setShowAlertBox] = useState(false);
      const prevFlags = useRef([]);
      const prevNTCs = useRef([]);
      const prevVoltage = useRef(null);
      const [isDragging, setIsDragging] = useState(false);
      const dragStartX = useRef(0);
      const [isAutoFollow, setIsAutoFollow] = useState(true);
      const [loadingHistory, setLoadingHistory] = useState(false);
      const [noData, setNoData] = useState(false);
      const [lastTenLiveData, setLastTenLiveData] = useState([]);
      const [currentData, setCurrentData] = useState(null);
      const [rawLiveData, setRawLiveData] = useState([]);
      const [liveDatawebstock, setLiveDataWebStock] = useState(null);
      const latestt = lastTenLiveData?.[lastTenLiveData.length - 1];
      const activeVinRef = useRef(null);
      const isMobile = window.innerWidth < 640;
      const WINDOW_SIZE = 50;
      const [deleteOpen, setDeleteOpen] = useState(false);
      const [noteToDelete, setNoteToDelete] = useState(null);
      const [noteOpen, setNoteOpen] = useState(false);
      const [notes, setNotes] = useState([]);
      const [newNote, setNewNote] = useState("");
      const [editingId, setEditingId] = useState(null);
      const [editingText, setEditingText] = useState("");
      const [loadingNotes, setLoadingNotes] = useState(false);
      const location = useLocation();
      const wsRef = useRef(null);
      const [vins, setVins] = useState(null);
      const [liveAllVinData, setLiveAllVinData] = useState(null);
      const [zoomSpan, setZoomSpan] = useState(100);

      const [fullData, setFullData] = useState([]);
      const [visibleRange, setVisibleRange] = useState({ start: 0, end: 120 });
      const [isLive, setIsLive] = useState(true);
       const echartsRef = useRef(null);
      

      const handleMouseDown = (e) => {
        e.preventDefault(); 
        setIsDragging(true);
        setIsLive(false);
        dragStartX.current = e.clientX;
      };

       useEffect(() => {
      if (!vin) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `https://commandcenter.rivotmotors.com/real_timedata1.php?vin=${vin}`
        );

        const json = await res.json();

        if (json.status === "success") {
          setLastTenLiveData(json.data);
        } else {
          setLastTenLiveData([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setLastTenLiveData([]);
      }
    };

  fetchHistory();
  }, [vin]);

  useEffect(() => {
      if (!vin) return;
      setFullData([]);
      setShowHistoryChart(false);

       setLiveAllVinData(null); 
      setDetails([]);          
      setLocationName("");      
    }, [vin]);

      useEffect(() => {
        if (!vin) return;
      
        let ws;
        let timer;
        if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
    }
        const connect = () => {
        ws = new WebSocket(`wss://commandcenter.rivotmotors.com/live`);

        wsRef.current = ws;

       ws.onmessage = (event) => {
     const message = JSON.parse(event.data);

  if (message.type === "allvin") {
    if (
      String(message.data.vinnumber).toUpperCase() !==
      String(activeVinRef.current).toUpperCase()
    ) {
      return;
    }

    setLiveAllVinData(message.data);
    return; 
  }

  const newRow = message;

  if (
    String(newRow.vinnumber).toUpperCase() !==
    String(activeVinRef.current).toUpperCase()
  ) {
    return;
  }

  if (newRow.time?.includes("T")) {
    newRow.time = newRow.time.replace("T", " ").replace("Z", "");
  }

 setLastTenLiveData((prev) => {
  // Prevent duplicate points by checking the timestamp of the last received point
  if (prev.length > 0 && prev[prev.length - 1].time === newRow.time) {
    return prev;
  }
  return [...prev, newRow];
});

  setRawLiveData((prev) => {
    const updated = [...prev, newRow];
    return updated.length > 500 ? updated.slice(-500) : updated;
  });
};

          ws.onerror = (err) => {
            console.error("WS error:", err);
            ws.close();
          };

          ws.onclose = () => {
            // console.log("🔴 WS disconnected, reconnecting in 3s...");
            timer = setTimeout(connect, 3000);
          };
        };

        connect();

        return () => {
          // console.log("🔴 Cleaning up WS for:", vin);
          clearTimeout(timer);
          if (ws) ws.close();
        };
      }, [vin]);

      const latestData =
      lastTenLiveData.length > 0
      ? lastTenLiveData[lastTenLiveData.length - 1]
      : null;
      
    const latestDataFORALLVIN =
          liveAllVinData ||
          details ||
          {};

      //  const evState = liveDatawebstock?.ev_power_state || "";

      // const evParts = evState.split(";");

      // const gear = (evParts[2] || "O").trim();

      const gear = (latestData?.gear || "O").trim();

      const gearMap = {
        F: "Forward",
        N: "Neutral",
        R: "Reverse",
        O: "Controller Off",
      };

const gearDisplay = gearMap[gear] || "Controller Off";

    
    const handleMouseMove = (e) => {
      if (!isDragging) return;

    const deltaX = e.clientX - dragStartX.current;
    const sensitivity = 3;
    const shift = Math.floor(deltaX / sensitivity);

    if (shift === 0) return;

    setVisibleRange((prev) => {
    let newStart = prev.start - shift;
    let newEnd = prev.end - shift;

    // LEFT boundary
    if (newStart < 0) {
      newStart = 0;
      newEnd = WINDOW_SIZE;
    }

    // RIGHT boundary
    if (newEnd > fullData.length) {
      newEnd = fullData.length;
      newStart = Math.max(0, fullData.length - WINDOW_SIZE);
    }

    // 🔥 KEY LOGIC (THIS FIXES YOUR ISSUE)
    if (newEnd >= fullData.length - 1) {
      setIsLive(true);   // back to live ONLY at edge
    } else {
      setIsLive(false);  // stay manual
    }

    return { start: newStart, end: newEnd };
  });

  dragStartX.current = e.clientX;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };


  function HomeDashboard({ vin }) {
        useEffect(() => {
          if (vin) {
            // console.log("Selected VIN:", vin);
          }
        }, [vin]);

        return (
          <div>
            <h2>Dashboard</h2>
            {vin ? <p>Vehicle VIN: {vin}</p> : <p>Select a vehicle</p>}
          </div>
        );
    }
    
      let rawData;
      if (typeof latestt === "string") {

      try {
      const parsed = JSON.parse(latestt);
      rawData = parsed?.data;
      } catch {
      rawData = undefined;
      }
      } else {
      rawData = latestt?.data;
      }
    
      const data1 = parseTirePressure(latestData?.tirepressure);
      const [lastUpdated, setLastUpdated] = useState("");
      const rideOSString = details?.rideosversion || "";
      const rideOSParts = details?.rideosversion?.split(";") || [];
      const rideOSPartss = details?.rideosversion?.split(";") || [];
      const simValue = rideOSPartss[3] || "No SIM detected";

      const aospVersion = rideOSParts[1] || "--";
      const mcuVersion = rideOSParts[2] || "--";
      const mucu_verstion = latestt?.data;
      const mapsFlag =
      mucu_verstion
      ?.split(",")
      ?.find(item => item.startsWith("maps="))
      ?.split("=")[1];
      const mapsaosp =
        mucu_verstion
      ?.split(",")
      ?.find(item => item.startsWith("AOSPv="))
      ?.split("=")[1];

      useEffect(() => {
      if (!details?.time) return;

      const d = new Date(details.time);
      if (isNaN(d)) return;

      setLastUpdated(d.toLocaleString());
      }, [details?.time]);

      let locationData = null;

      if (latestDataFORALLVIN?.lat_long){
      const [lat, lng] = latestDataFORALLVIN.lat_long
      .split(",")
      .map((n) => parseFloat(n.trim()));

      if (!isNaN(lat) && !isNaN(lng)) {
      const rawTime = latestDataFORALLVIN.time;

      let formattedTime = "N/A";

      if (rawTime) {
      const istTime = rawTime.replace("Z", "");

      formattedTime = new Date(istTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      }).replace(",", "");
      }

      locationData = {
      lat,
      lng,
      locationName,
      formattedTime,
      mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
      };
      }
      }

      // ✅ MOSFET alert logic
      // useEffect(() => {
      //   if (!details?.bmsmosstates) return;

      //   const flags = details.bmsmosstates
      //     .split(",")
      //     .map((v) => parseInt(v.trim(), 10));

      //   const [mainCharge, mainDischarge] = [flags[0], flags[1]];
      //   if (JSON.stringify(flags) === JSON.stringify(prevFlags.current)) return;
      //   prevFlags.current = flags;

      //   const latLong = details.lat_long || "";
      //   const [lat, lon] = latLong.split(",").map((v) => v?.trim() || "N/A");
      //   const time = new Date().toLocaleTimeString();

      //   const newAlerts = [];

      //   if (!mainCharge) {
      //     newAlerts.push({
      //       id: Date.now(),
      //       message: `⚠️ Main Charge MOSFET OFF at ${time} (Lat: ${lat}, Lon: ${lon})`,
      //     });
      //   }

      //   if (!mainDischarge) {
      //     newAlerts.push({
      //       id: Date.now() + 1,
      //       message: `⚠️ Main Discharge MOSFET OFF at ${time} (Lat: ${lat}, Lon: ${lon})`,
      //     });
      //   }

      //   if (newAlerts.length > 0) setAlerts((prev) => [...prev, ...newAlerts]);
      // }, [details?.bmsmosstates]);

      // ✅ NTC temperature alert logic
      // useEffect(() => {
      //   if (!ntcData?.ntc) return;

      //   const latLong = details.lat_long || "";
      //   const [lat, lon] = latLong.split(",").map((v) => v?.trim() || "N/A");
      //   const time = new Date().toLocaleTimeString();

      //   const match = ntcData.ntc.match(/ntc=([^ ]+)/i);
      //   const raw = match && match[1] ? match[1] : "";
      //   const arr = raw.split(",").map((v) => Number(v.trim()));

      //   if (JSON.stringify(arr) === JSON.stringify(prevNTCs.current)) return;
      //   prevNTCs.current = arr;

      //   const newAlerts = [];

      //   arr.forEach((val, i) => {
      //     if (val > 50) {
      //       newAlerts.push({
      //         id: Date.now() + i,
      //         message: `🔥 NTC${i + 1} temperature high (${val}°C) at ${time} (Lat: ${lat}, Lon: ${lon})`,
      //       });
      //     }
      //   });

      //   if (newAlerts.length > 0) setAlerts((prev) => [...prev, ...newAlerts]);
      // }, [ntcData?.ntc]);

      // ✅ Battery voltage alert logic
      // useEffect(() => {
      //   if (!latestGauges?.batvoltage) return;
      //   const voltage = Number(latestGauges.batvoltage);
      //   if (voltage === prevVoltage.current) return;
      //   prevVoltage.current = voltage;

      //   if (voltage < 65) {
      //     const latLong = details.lat_long || "";
      //     const [lat, lon] = latLong.split(",").map((v) => v?.trim() || "N/A");
      //     const time = new Date().toLocaleTimeString();

      //     setAlerts((prev) => [
      //       ...prev,
      //       {
      //         id: Date.now(),
      //         message: `🔋 Low Battery Voltage (${voltage.toFixed(
      //           1
      //         )} V) at ${time} (Lat: ${lat}, Lon: ${lon})`,
      //       },
      //     ]);
      //   }
      // }, [latestGauges?.batvoltage]);


      //   let minCellNumber = null;
      //   let maxCellNumber = null;

      // if (latestGauges?.ntc && latestGauges.ntc.includes("ICV=")) {
      //   const match = latestGauges.ntc.match(/ICV=(\w+)/);

      //   if (match) {
      //     const icv = match[1];

      //     maxCellNumber = parseInt(icv.slice(4, 6), 16);
      //     minCellNumber = parseInt(icv.slice(10, 12), 16);
      //   }
      // }

      // Example: Add alert (you can call this when BMS MOS goes OFF)

      const addAlert = (message) => {
      const newAlert = { id: Date.now(), message, time: new Date().toLocaleString() };
      setAlerts((prev) => [newAlert, ...prev]);
      };

      const [isOpensf, setIsOpensf] = useState(false);
      const bookmarkRef = useRef(null);

      useEffect(() => {
      const handleClickOutside = (event) => {
      if (bookmarkRef.current && !bookmarkRef.current.contains(event.target)) {
      setIsOpens(false);
      }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      const navigate = useNavigate();

      const handleLogout = () => {
      localStorage.removeItem("isLoggedIn");
      navigate("/");
      };

      // format date to yyyy-MM-ddTHH:mm
      const formatDateTimeLocals = (date) => date.toISOString().slice(0, 16);
      const setDefaultTimes = () => {
      const now = new Date();
      const past24 = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      setStartTime(formatDateTimeLocal(past24));
      setEndTime(formatDateTimeLocal(now));
      setAutoMode1(true);
      };

      useEffect(() => {
      const timer = setInterval(() => {
      if (autoMode) setDefaultTimes();
      }, 60000);
      return () => clearInterval(timer);
      }, [autoMode]);

      useEffect(() => {
      setDefaultTimes();
      }, []);

      // Handle start/end time change by user → stop auto update
      const handleStartChange1 = (value) => {
      setStartTime(value);
      setAutoMode1(false);
      };
      const handleEndChange1 = (value) => {
      setEndTime(value);
      setAutoMode1(false);
      };

      // Example fetch function — replace with your actual fetch
      const fetchData = async ({ start, end }) => {
      setLoading1(true);
      try {
      console.log("Fetching data for:", start, end);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setFetchParams({ start, end });
      setActiveTab("history");
      } catch (err) {
      console.error(err);
      } finally {
      setLoading1(false);
      }
      };

      const handleLoadHistory = () => {
      if (!startTime || !endTime) return;
      fetchData({ start: startTime, end: endTime });
      };

      const getStatusColor = (status) => {
      switch (status) {
      case "CRITICAL":
      return "text-red-500";
      case "HIGH":
      return "text-red-400";
      case "IDEAL":
      return "text-yellow-400";
      default:
      return "text-gray-400";
      }
      };     
   
      useEffect(() => {
      const interval = setInterval(() => {
      setTick((prev) => prev + 1); // 🔄 refresh every second
      }, 3000);
      return () => clearInterval(interval);
      }, []);

      const [activePage, setActivePage] = React.useState("home"); 

      const [isCollapsed, setIsCollapsed] = React.useState(true);

      // copy in graph of lat_long
      const [hoveredLatLong, setHoveredLatLong] = React.useState(null);

      React.useEffect(() => {
      const handleCopy = (e) => {
      if (e.ctrlKey && e.key === "c" && hoveredLatLong) {
      e.preventDefault(); 
      navigator.clipboard.writeText(hoveredLatLong);
      }
      };

      window.addEventListener("keydown", handleCopy);
      return () => window.removeEventListener("keydown", handleCopy);
      }, [hoveredLatLong]);

      const mainRef = useRef(null);

      useEffect(() => {
      const mainEl = mainRef.current;
      if (!mainEl) return;

      const handleScroll = () => {
      setIsScrolled(mainEl.scrollTop > 10); // ✅ now checks main scroll
      };
      mainEl.addEventListener("scroll", handleScroll);
      return () => mainEl.removeEventListener("scroll", handleScroll);
      }, []);


      const [apiUrl, setApiUrl] = useState("");

      useEffect(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
      }, []);

      const [coords, setCoords] = useState({ lat: null, lng: null });

      const rawLatLong =  liveAllVinData?.lat_long || "";

      useEffect(() => {
      if (!rawLatLong) return;

      const [lat, lng] = rawLatLong.split(",").map((n) => parseFloat(n.trim()));

      if (isNaN(lat) || isNaN(lng)) {
      setLocationName("Invalid location");
      return;
      }

      fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
      headers: {
      "User-Agent": "YourAppName/1.0 (your@email.com)", // required by Nominatim
      "Accept-Language": "en", // optional, force English response
      },
      }
      )
      .then((res) => res.json())
      .then((data) => {
      setLocationName(data.display_name || `${lat}, ${lng}`);
      })
      .catch(() => {
      setLocationName(`${lat}, ${lng}`);
      });
      }, [rawLatLong, latestData?.lat_long, liveAllVinData?.lat_long]);
      

      // Graph States
      const [livedatafor, setLivedatafor] = useState([]);
      const [metricsSelected, setMetricsSelected] = useState(["speed_kmph", "currentPositive", "currentNegative" ]);
      const [metricsSelected1, setMetricsSelected1] = useState(["speed_kmph","currentPositive", "currentNegative"]);
      const [showMetrics, setShowMetrics] = useState(false); // mobile dropdown toggle

      const cellMetricOptions = Array.from({ length: 23 }, (_, i) => ({
      key: `cell${i + 1}`,
      label: `Cell ${i + 1} voltage (V)`,
      color: "#22c55e"
      }));

      // 🔹 Base metrics
      const metricOptions = [
      { key: "currentPositive", label: "Current generation (A)", color: "#13ff23" },
      { key: "currentNegative", label: "Current consumption (A)", color: "#ff0000" },
      { key: "speed_kmph", label: "Speed (km/h)", color: "#05a2ebff" },
      { key: "motortemp", label: "Motor temp (°C)", color: "#f9c805ff" },
      { key: "controllermostemp", label: "Controller temp (°C)", color: "#fc5507ff" },
      { key: "soc", label: "SOC (%)", color: "#ffffff" },
      { key: "bmssoc", label: "BMSSOC (%)", color: "#04aef1" },
      { key: "inah", label: "Inah (Ah)", color: "#f6098fff" },
      { key: "outah", label: "Outah (Ah)", color: "#78c004ff" },
      { key: "batvoltage", label: "Battery voltage (V)", color: "#fef18aff" },
      { key: "chargingCurrent", label: "Charging Current (A)", color: "#00ffff" },
      { key: "inah_by_charger", label: "Inah by Charger (Ah)", color: "#22c55e" },
      { key: "inah_by_regen", label: "Inah by Regen (Ah)", color: "#06b6d4" },
      { key: "remainingcapacity_ah", label: "Remaining Capacity (Ah)", color: "#f97316" },
      { key: "currentrider", label: "Curren rider", color: "#e11d48" },
      
      // 🔹 NTC temperatures
      { key: "ntc1", label: "Positive terminal temp (°C)", color: "#a8f8ffff" },
      { key: "ntc2", label: "Cell no 20 temp (°C)", color: "#ee71fcff" },
      { key: "ntc3", label: "Cell no 50 temp (°C)", color: "#9b97f4ff" },
      { key: "ntc4", label: "Negative terminal temp (°C)", color: "#46f6bbff" },
      { key: "mos1", label: "Main charge mosfet", color: "#f97316" },
      { key: "mos2", label: "Main discharge mosfet", color: "#14b8a6" },
      { key: "mos3", label: "APU charge mosfet", color: "#8b5cf6" },
      { key: "mos4", label: "APU discharge mosfet", color: "#e11d48" }, 
      { key: "cpu1", label: "CPU_1", color: "#1d05f3" },
      // 🔹 23 Cell voltages
      { key: "cell1", label: "Cell 1 voltage (V)", color: "#22c55e" },
      { key: "cell2", label: "Cell 2 voltage (V)", color: "#22c55e" },
      { key: "cell3", label: "Cell 3 voltage (V)", color: "#22c55e" },
      { key: "cell4", label: "Cell 4 voltage (V)", color: "#22c55e" },
      { key: "cell5", label: "Cell 5 voltage (V)", color: "#22c55e" },
      { key: "cell6", label: "Cell 6 voltage (V)", color: "#22c55e" },
      { key: "cell7", label: "Cell 7 voltage (V)", color: "#22c55e" },
      { key: "cell8", label: "Cell 8 voltage (V)", color: "#22c55e" },
      { key: "cell9", label: "Cell 9 voltage (V)", color: "#22c55e" },
      { key: "cell10", label: "Cell 10 voltage (V)", color: "#22c55e" },
      { key: "cell11", label: "Cell 11 voltage (V)", color: "#22c55e" },
      { key: "cell12", label: "Cell 12 voltage (V)", color: "#22c55e" },
      { key: "cell13", label: "Cell 13 voltage (V)", color: "#22c55e" },
      { key: "cell14", label: "Cell 14 voltage (V)", color: "#22c55e" },
      { key: "cell15", label: "Cell 15 voltage (V)", color: "#22c55e" },
      { key: "cell16", label: "Cell 16 voltage (V)", color: "#22c55e" },
      { key: "cell17", label: "Cell 17 voltage (V)", color: "#22c55e" },
      { key: "cell18", label: "Cell 18 voltage (V)", color: "#22c55e" },
      { key: "cell19", label: "Cell 19 voltage (V)", color: "#22c55e" },
      { key: "cell20", label: "Cell 20 voltage (V)", color: "#22c55e" },
      { key: "cell21", label: "Cell 21 voltage (V)", color: "#22c55e" },
      { key: "cell22", label: "Cell 22 voltage (V)", color: "#22c55e" },
      { key: "cell23", label: "Cell 23 voltage (V)", color: "#22c55e" }
      ];

      const metricOptions1 = [
      { key: "currentPositive", label: "Current generation (A)", color: "#13ff23" },
      { key: "currentNegative", label: "Current consumption (A)", color: "#ff0000" },
      { key: "speed_kmph", label: "Speed (km/h)", color: "#05a2ebff" },
      { key: "motortemp", label: "Motor temp (°C)", color: "#f9c805ff" },
      { key: "controllermostemp", label: "Controller temp (°C)", color: "#fc5507ff" },
      { key: "soc", label: "SOC (%)", color: "#ffff" },
      { key: "bmssoc", label: "BMSSOC (%)", color: "#04aef1" },
      { key: "inah", label: "Inah (Ah)", color: "#f6098fff" },
      { key: "outah", label: "Outah (Ah)", color: "#78c004ff" },
      { key: "chargingCurrent", label: "Charging Current (A)", color: "#00ffff" },
      { key: "batvoltage", label: "Battery voltage (V)", color: "#fef18aff" },
      { key: "inah_by_charger", label: "Inah by Charger (Ah)", color: "#22c55e" },
      { key: "inah_by_regen", label: "Inah by Regen (Ah)", color: "#06b6d4" },
      { key: "remainingcapacity_ah", label: "Remaining Capacity (Ah)", color: "#f97316" },
      { key: "currentrider", label: "Curren rider", color: "#e11d48" },
      { key: "ntc1", label: "Positive terminal temp(°C)", color: "#a8f8ffff" },
      { key: "ntc2", label: "Cell no 20 temp (°C)", color: "#ee71fcff" },
      { key: "ntc3", label: "Cell no 50 temp (°C)", color: "#9b97f4ff" },
      { key: "ntc4", label: "Negative terminal temp(°C)", color: "#46f6bbff" },
      { key: "mos1", label: "Main charge mosfet", color: "#f97316" },
      { key: "mos2", label: "Main discharge mosfet", color: "#14b8a6" },
      { key: "mos3", label: "APU charge mosfet", color: "#8b5cf6" },
      { key: "mos4", label: "APU discharge mosfet", color: "#e11d48" }, 
      { key: "cpu1", label: "CPU_1", color: "#1d05f3" },
      { key: "cell1", label: "Cell 1 voltage (V)", color: "#22c55e" },
      { key: "cell2", label: "Cell 2 voltage (V)", color: "#22c55e" },
      { key: "cell3", label: "Cell 3 voltage (V)", color: "#22c55e" },
      { key: "cell4", label: "Cell 4 voltage (V)", color: "#22c55e" },
      { key: "cell5", label: "Cell 5 voltage (V)", color: "#22c55e" },
      { key: "cell6", label: "Cell 6 voltage (V)", color: "#22c55e" },
      { key: "cell7", label: "Cell 7 voltage (V)", color: "#22c55e" },
      { key: "cell8", label: "Cell 8 voltage (V)", color: "#22c55e" },
      { key: "cell9", label: "Cell 9 voltage (V)", color: "#22c55e" },
      { key: "cell10", label: "Cell 10 voltage (V)", color: "#22c55e" },
      { key: "cell11", label: "Cell 11 voltage (V)", color: "#22c55e" },
      { key: "cell12", label: "Cell 12 voltage (V)", color: "#22c55e" },
      { key: "cell13", label: "Cell 13 voltage (V)", color: "#22c55e" },
      { key: "cell14", label: "Cell 14 voltage (V)", color: "#22c55e" },
      { key: "cell15", label: "Cell 15 voltage (V)", color: "#22c55e" },
      { key: "cell16", label: "Cell 16 voltage (V)", color: "#22c55e" },
      { key: "cell17", label: "Cell 17 voltage (V)", color: "#22c55e" },
      { key: "cell18", label: "Cell 18 voltage (V)", color: "#22c55e" },
      { key: "cell19", label: "Cell 19 voltage (V)", color: "#22c55e" },
      { key: "cell20", label: "Cell 20 voltage (V)", color: "#22c55e" },
      { key: "cell21", label: "Cell 21 voltage (V)", color: "#22c55e" },
      { key: "cell22", label: "Cell 22 voltage (V)", color: "#22c55e" },
      { key: "cell23", label: "Cell 23 voltage (V)", color: "#22c55e" }
      ];

      const handleMetricChange = (key) => {
        if (metricsSelected.includes(key)) {
          setMetricsSelected(metricsSelected.filter((m) => m !== key));
        } else {
          setMetricsSelected([...metricsSelected, key]);
        }
      };

      const handleMetricChange1 = (key) => {
        setMetricsSelected1((prev) =>
          prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
      };
      
      useEffect(() => {
      if (!latestData) return;

      }, [latestData]);

      const latestNtc =
      latestData?.length > 0
      ? latestData[latestData.length - 1]?.ntc || []
      : [];

      function getStartCell(label) {
      if (label.includes("1to3")) return 1;
      const match = label.match(/cell(\d+)to(\d+)/);
      return match ? Number(match[1]) : null;
      }


      function parseCellVoltages(item) {
  const cells = [];

  const groups = [
    { key: "cell1to3", start: 1 },
    { key: "cell4to6", start: 4 },
    { key: "cell7to9", start: 7 },
    { key: "cell10to12", start: 10 },
    { key: "cell13to15", start: 13 },
    { key: "cell16to18", start: 16 },
    { key: "cell19to21", start: 19 },
    { key: "cell22to23", start: 22 },
  ];

  groups.forEach(({ key, start }) => {
    const value = item[key];

    if (!value) return;

    // Remove trailing "00"
    const clean = value.endsWith("00")
      ? value.slice(0, -2)
      : value;

    for (let i = 0; i < clean.length; i += 4) {
      const hex = clean.substr(i, 4);

      if (hex.length !== 4) continue;

      cells.push({
        cell: start + i / 4,
        voltage: parseInt(hex, 16) / 1000,
      });
    }
  });

  return cells.slice(0, 23);
}

      function parseNTCCells(ntc) {
      const cells = [];

      if (!Array.isArray(ntc)) return cells;

      const blocks = [];

      // First block is inside item.ntc[10]
      if (typeof ntc[10] === "string") {
        const parts = ntc[10].split(";");

        if (parts.length >= 7) {
          blocks.push(parts[6]);
        }
      }


        for (let i = 11; i < ntc.length; i++) {
          if (typeof ntc[i] === "string") {
            blocks.push(ntc[i]);
          }
        }

        let cellNumber = 1;

        blocks.forEach(block => {
          const clean = block.slice(0, -2);

          for (let i = 0; i < clean.length; i += 4) {
            const hex = clean.substr(i, 4);

            if (hex.length < 4) continue;

            const voltage = parseInt(hex, 16) / 1000;

            cells.push({
              cell: cellNumber++,
              voltage
            });
          }
        });

        return cells.slice(0, 23);
      }

      function parseLiveNTCCells(ntc) {
  const cells = [];

  if (typeof ntc !== "string") return cells;

  const parts = ntc.split(";");

  if (parts.length < 8) return cells;

  const blocks = parts[7].split(",");

  let cellNumber = 1;

  blocks.forEach((block) => {
    if (!block || block === "null") return;

    const clean = block.slice(0, -2);

    for (let i = 0; i < clean.length; i += 4) {
      const hex = clean.substr(i, 4);

      if (hex.length !== 4) continue;

      cells.push({
        cell: cellNumber++,
        voltage: parseInt(hex, 16) / 1000,
      });
    }
  });

  return cells.slice(0, 23);
}
            
      const processedData = Array.isArray(lastTenLiveData)
      ? lastTenLiveData.map((item) => {
      let ntcValues = [];
      let mosValues = [];
      let mainMinVoltage = null;
      let mainMaxVoltage = null;
      let mainMinCell = null;
      let mainMaxCell = null;

     let chargingCurrent = null;

    if (typeof item.ntc === "string") {
      const parts = item.ntc.split(";");

      if (parts.length > 2) {
        chargingCurrent = parseFloat(parts[2]);

        if (isNaN(chargingCurrent)) {
          chargingCurrent = null;
        }
      }
    }

      if (Array.isArray(item.ntc)) {
      // --- Extract MOS values ---
      const mosIndex = item.ntc.findIndex(
      (v) => typeof v === "string" && v.includes("MOS=")
      );

      if (mosIndex !== -1) {
      const mosString = item.ntc[mosIndex];
      const mosMatch = mosString.match(/MOS=([\d,]+)/);

      if (mosMatch) {
      mosValues = mosMatch[1].split(",").map(Number);
      }

      for (let i = mosIndex + 1; i < item.ntc.length; i++) {
      const val = parseInt(item.ntc[i]);
      if (!isNaN(val)) mosValues.push(val);
      else break;
      }

      mosValues = mosValues.map((v) =>
      v === 1 ? "ON" : v === 0 ? "OFF" : null
      );
      }

      const ntcIndex = item.ntc.findIndex(
      (v) => typeof v === "string" && v.includes("ntc=")
      );

      if (ntcIndex !== -1) {
      ntcValues = item.ntc.slice(ntcIndex).flatMap((v) => {
      if (typeof v === "string" && v.includes("ntc=")) {
      const match = v.match(/ntc=(-?\d+)/);
      return match ? [parseFloat(match[1])] : [];
      }
      const num = parseFloat(v);
      return isNaN(num) ? [] : [num];
      });
      }

      const icvItem = item.ntc.find(
      (v) => typeof v === "string" && v.includes("ICV=")
      );

      if (icvItem) {
      const match = icvItem.match(/ICV=(\w+)/);
      if (match) {
      const icv = match[1];

      const hexToDec = (hex) => parseInt(hex, 16);
      const hexToFloat = (hex) => parseInt(hex, 16) / 1000;

      mainMaxVoltage = hexToFloat(icv.slice(0, 4)).toFixed(3);
      mainMaxCell = hexToDec(icv.slice(4, 6));
      mainMinVoltage = hexToFloat(icv.slice(6, 10)).toFixed(3);
      mainMinCell = hexToDec(icv.slice(10, 12));
      }
      }
      }

     const decodedCells = parseCellVoltages(item);

      const cellVoltages = {};
      decodedCells.forEach((c) => {
        cellVoltages[`cell${c.cell}`] = c.voltage;
      });

      let cpu1 = null;
      if (item.data && typeof item.data === "string") {
        const pcbMatch = item.data.match(/PCB_temps\s*:\s*(.*)/);

        if (pcbMatch && pcbMatch[1]) {
          const tempsString = pcbMatch[1];
          const cpu1Match = tempsString.match(/cpu1=([-+]?\d*\.?\d+)/);
          cpu1 = cpu1Match ? parseFloat(cpu1Match[1]) : null;
        
        }
      }

      return {
      time: item.time,
      currentPositive:
      item.currentconsumption > 0 ? item.currentconsumption : 0,
      currentNegative:
      item.currentconsumption < 0
      ? Math.abs(item.currentconsumption)
      : 0,
      speed_kmph: item.speed_kmph,
      motortemp: item.motortemp,
      controllermostemp: item.controllermostemp,
      batvoltage: item.batvoltage,
      soc: item.soc,
      bmssoc: item.bmssoc,
      inah: item.inah,
      outah: item.outah,
       chargingCurrent:
        typeof item.chargingstatus === "string" &&
        item.chargingstatus.split(",").length > 1
      ? parseFloat(item.chargingstatus.split(",")[1])
      : null,

      lat_long: item.lat_long ?? null,
      tripkm: item.tripkm,
      inah_by_charger: item.inah_by_charger ?? null,
      inah_by_regen: item.inah_by_regen ?? null,
      remainingcapacity_ah: item.remainingcapacity_ah ?? null,
      currentrider: item.currentrider ?? null,

      mos1:
      typeof item.ntc === "string"
        ? (item.ntc.split(";")[0].split(",")[0] === "1" ? "ON" : "OFF")
        : null,

      mos2:
        typeof item.ntc === "string"
          ? (item.ntc.split(";")[0].split(",")[1] === "1" ? "ON" : "OFF")
          : null,

      mos3:
        typeof item.ntc === "string"
          ? (item.ntc.split(";")[0].split(",")[2] === "1" ? "ON" : "OFF")
          : null,

      mos4:
        typeof item.ntc === "string"
          ? (item.ntc.split(";")[0].split(",")[3] === "1" ? "ON" : "OFF")
          : null,
     
        cpu1:item.vcutemp,
  
 
     ntc1:
    typeof item.ntc === "string"
    ? parseFloat(item.ntc.split(",")[0])
    : null,

    ntc2:
      typeof item.ntc === "string"
        ? parseFloat(item.ntc.split(",")[1])
        : null,

    ntc3:
      typeof item.ntc === "string"
        ? parseFloat(item.ntc.split(",")[2])
        : null,

    ntc4:
      typeof item.ntc === "string"
        ? parseFloat(item.ntc.split(",")[3])
        : null,

    ntc5:
      typeof item.ntc === "string"
        ? parseFloat(item.ntc.split(",")[4])
        : null,

    ntc6:
      typeof item.ntc === "string"
        ? parseFloat(item.ntc.split(",")[5])
        : null,

    ntc7:
      typeof item.ntc === "string"
        ? parseFloat(item.ntc.split(",")[6])
        : null,

    ntc8:
      typeof item.ntc === "string"
        ? parseFloat(item.ntc.split(",")[7])
        : null,

      mainMinVoltage,
      mainMaxVoltage,
      mainMinCell,
      mainMaxCell,

      ...cellVoltages,
      };
      })
      : [];


   useEffect(() => {
  if (!processedData) return;

  setFullData(processedData);
}, [processedData]);

      useEffect(() => {
        const windowSize = WINDOW_SIZE;

        // ❗ Only follow when LIVE and NOT dragging
        if (!isLive || isDragging) return;

        if (fullData.length > windowSize) {
          setVisibleRange({
            start: fullData.length - windowSize,
            end: fullData.length,
          });
        }
      }, [fullData, isLive, isDragging]);

      const handleVehicleSelect = (vin) => {
        setVins(vin);
        setActivePage("home"); // 🔥 this must hide map
      };

      const allowedChargeCurrent = (() => {
        const raw = latestData?.data;
        if (!raw) return "0.0";

        return raw.split(";")[6] || "0.0";
      })();
  
    const maxVolt = (() => {
    const raw = latestData?.data;
    if (!raw) return "0.0";

    return raw.split(";")[5] || "0.0";
    })();

      const processedData1 = Array.isArray(historyData)
      ? historyData.map((item) => {
      let ntcValues = [];
      let mosValues = [];
      let mainMinVoltage = null;
      let mainMaxVoltage = null;
      let mainMinCell = null;
      let mainMaxCell = null;

      if (Array.isArray(item.ntc)) {
      // 1️⃣ --- Extract MOS values ---
      const mosIndex = item.ntc.findIndex(
      (v) => typeof v === "string" && v.includes("MOS=")
      );
      if (mosIndex !== -1) {
      const mosString = item.ntc[mosIndex];
      const mosMatch = mosString.match(/MOS=([\d,]+)/);
      if (mosMatch) {
      mosValues = mosMatch[1].split(",").map((n) => parseInt(n));
      }

      // Include next numeric values after MOS= if they exist
      for (let i = mosIndex + 1; i < item.ntc.length; i++) {
      const val = parseInt(item.ntc[i]);
      if (!isNaN(val)) mosValues.push(val);
      else break;
      }

      // 🟢 Convert MOS 1/0 to "ON"/"OFF"
      mosValues = mosValues.map((v) =>
      v === 1 ? "ON" : v === 0 ? "OFF" : null
      );
      }

      // 2️⃣ --- Extract NTC values ---
      const ntcIndex = item.ntc.findIndex(
      (v) => typeof v === "string" && v.includes("ntc=")
      );
      if (ntcIndex !== -1) {
      ntcValues = item.ntc.slice(ntcIndex).flatMap((v) => {
      if (typeof v === "string" && v.includes("ntc=")) {
      const match = v.match(/ntc=(-?\d+)/);
      return match ? [parseFloat(match[1])] : [];
      }
      const num = parseFloat(v);
      return isNaN(num) ? [] : [num];
      });
      }

      // 3️⃣ --- 🟢 Extract ICV data (Main Min/Max Voltage & Cell Numbers) ---
      const icvItem = item.ntc.find(
      (v) => typeof v === "string" && v.includes("ICV=")
      );
      if (icvItem) {
      const match = icvItem.match(/ICV=(\w+)/);
      if (match) {
      const icv = match[1];

      // Extract hex parts
      const maxValHex = icv.slice(0, 4);
      const maxNoHex = icv.slice(4, 6);
      const minValHex = icv.slice(6, 10);
      const minNoHex = icv.slice(10, 12);

      // Conversion helpers
      const hexToDec = (hex) => parseInt(hex, 16);
      const hexToFloat = (hex) => parseInt(hex, 16) / 1000;

      // Final decoded values
      mainMaxVoltage = hexToFloat(maxValHex).toFixed(3);
      mainMaxCell = hexToDec(maxNoHex);
      mainMinVoltage = hexToFloat(minValHex).toFixed(3);
      mainMinCell = hexToDec(minNoHex);
      }
      }
      }
 
 
    let chargingCurrent = null;

    if (Array.isArray(item.ntc)) {
      const ccItem = item.ntc.find(
        (v) => typeof v === "string" && v.includes("ChargingCurrent=")
      );

      if (ccItem) {
        const match = ccItem.match(/ChargingCurrent=([-+]?\d*\.?\d+)/);
        if (match) {
          chargingCurrent = parseFloat(match[1]);
        }
      }
    }
 
    const decodedCells =
    item.cell1to3
    ? parseCellVoltages(item)
    : Array.isArray(item.ntc)
      ? parseNTCCells(item.ntc)
      : parseLiveNTCCells(item.ntc);

      const cellVoltages = {};

      decodedCells.forEach((c) => {
        cellVoltages[`cell${c.cell}`] = c.voltage;
      });

      let cpu1 = null;

      if (item.data && typeof item.data === "string") {
        const pcbMatch = item.data.match(/PCB_temps\s*:\s*(.*)/);

        if (pcbMatch && pcbMatch[1]) {
          const tempsString = pcbMatch[1];

    const cpu1Match = tempsString.match(/cpu1=([-+]?\d*\.?\d+)/);
    cpu1 = cpu1Match ? parseFloat(cpu1Match[1]) : null;
  
  }
}
      return {
      time: item.time,
      currentPositive: item.currentconsumption > 0 ? item.currentconsumption : 0,
      currentNegative: item.currentconsumption < 0 ? Math.abs(item.currentconsumption) : 0,
      speed_kmph: item.speed_kmph,
      motortemp: item.motortemp,
      controllermostemp: item.controllermostemp,
      batvoltage: item.batvoltage,
      soc: item.soc,
      bmssoc: item.bmssoc,
      inah: item.inah,
      outah: item.outah,
      chargingCurrent:
      typeof item.chargingstatus === "string" &&
      item.chargingstatus.split(",").length > 1
    ? parseFloat(item.chargingstatus.split(",")[1])
    : null,
    
      lat_long: item.lat_long ?? null,
      tripkm: item.tripkm,
      inah_by_charger: item.inah_by_charger ?? null,
      inah_by_regen: item.inah_by_regen ?? null,
      remainingcapacity_ah: item.remainingcapacity_ah ?? null,
      currentrider: item.currentrider ?? null,

        mos1: item.bmsmos?.split(",")[0] === "1" ? "ON" : "OFF",

        mos2: item.bmsmos?.split(",")[1] === "1" ? "ON" : "OFF",

        mos3: item.bmsmos?.split(",")[2] === "1" ? "ON" : "OFF",

        mos4: item.bmsmos?.split(",")[3] === "1" ? "ON" : "OFF",

      ntc1:
        Array.isArray(item.ntc)
          ? item.ntc[0]
          : null,

      ntc2:
        Array.isArray(item.ntc)
          ? item.ntc[1]
          : null,

   
      ntc3:
        Array.isArray(item.ntc)
          ? item.ntc[2]
          : null,

      ntc4:
        Array.isArray(item.ntc)
          ? item.ntc[3]
          : null,

      ntc5:
        Array.isArray(item.ntc)
          ? item.ntc[4]
          : null,

      ntc6:
        Array.isArray(item.ntc)
          ? item.ntc[5]
          : null,

      ntc7:
        Array.isArray(item.ntc)
          ? item.ntc[6]
          : null,

      ntc8:
        Array.isArray(item.ntc)
          ? item.ntc[7]
          : null,

      // ✅ ICV decoded values
      mainMinVoltage,
      mainMaxVoltage,
      mainMinCell,
      mainMaxCell,

      cpu1:item.vcutemp,
      ...cellVoltages,
      
      };
      })
      : [];

      const onChartEvents = useMemo(
        () => ({
          dataZoom: (params) => {
            const start = params.batch ? params.batch[0].start : params.start;
            const end = params.batch ? params.batch[0].end : params.end;

            if (start !== undefined && end !== undefined) {
              setZoomSpan(end - start);
            }
          },
        }),
        []
      );

      const chartOptions = useMemo(() => {
        if (!processedData1 || processedData1.length === 0) {
          return {};
        }

        const times = processedData1.map((item) => item.time);

        const activeSeries = metricOptions1
          .map((opt) => {
            const isSelected = metricsSelected1.includes(opt.key);
            
            if (opt.key === "currentconsumption") {
              return [
                {
                  name: "Current + (A)",
                  type: "line",
                  showSymbol: false,
                  smooth: true,
                  lineStyle: { width: 1.8, color: "#13ff23ff" },
                  itemStyle: { color: "#13ff23ff" },
                  data: isSelected ? processedData1.map((item) => ({
                    value: item.currentPositive,
                    payload: item,
                  })) : [],
                },
                {
                  name: "Current - (A)",
                  type: "line",
                  showSymbol: false,
                  smooth: true,
                  lineStyle: { width: 1.8, color: "#ff0000ff" },
                  itemStyle: { color: "#ff0000ff" },
                  data: isSelected ? processedData1.map((item) => ({
                    value: item.currentNegative,
                    payload: item,
                  })) : [],
                },
              ];
            }

            return {
              name: opt.label,
              type: "line",
              showSymbol: false,
              smooth: true,
              lineStyle: { width: 1.8, color: opt.color },
              itemStyle: { color: opt.color },
              data: isSelected ? processedData1.map((item) => ({
                value: item[opt.key],
                payload: item,
              })) : [],
            };
          })
          .flat();

        if (activeSeries.length > 0) {
          activeSeries[0].markLine = {
            silent: true,
            symbol: ["none", "none"],
            lineStyle: {
              color: "#ffffff",
              type: "dashed",
              width: 1.2
            },
            data: [{ yAxis: 0 }]
          };
        }

        return {
          backgroundColor: "#000000",
          grid: {
              top: 40,
              right: 15,
              bottom: window.innerWidth < 768 ? 90 : 80,
              left: window.innerWidth < 768 ? 40 : 60,
            },
          xAxis: {
            type: "category",
            data: times,
           axisLabel: {
                  color: "#ffffff",
                  fontSize: window.innerWidth < 768 ? 9 : 11,
                  fontFamily: "Kanit, sans-serif",
                  formatter: (value) => {
  const date = new Date(value);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Show seconds only when zoomed in
  if (zoomSpan < 3) {
    return `${hours}:${minutes}:${seconds}`;
  }

  return `${hours}:${minutes}`;
},
                  rotate: window.innerWidth < 768 ? -30 : 0,
                  interval: "auto",
                  hideOverlap: true,
                },
            axisLine: {
              lineStyle: {
                color: "#FF9913",
              },
            },
            axisTick: {
              show: false,
            },
            axisPointer: {
              label: {
                show: false,
              },
            },
          },
          yAxis: {
            type: "value",
            scale: true,
            axisLabel: {
              color: "#ffffff",
              fontSize: window.innerWidth < 768 ? 9 : 11,
              fontFamily: "Kanit, sans-serif",
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "#FF9913",
              },
            },
            splitLine: {
              lineStyle: {
                color: "#33415540",
                type: "dashed",
              },
            },
          },
          tooltip: {
            trigger: "axis",
            backgroundColor: "#000000",
            borderColor: "#FF9913",
            borderWidth: 1,
            borderRadius: 12,
            shadowColor: "#FF991355",
            shadowBlur: 15,
            textStyle: {
              fontSize: window.innerWidth < 768 ? 10 : 11,
              color: "#ffffff",
            },
            axisPointer: {
              type: "cross",
              label: {
                  backgroundColor: "#000000",
                  borderColor: "#FF9913",
                  borderWidth: 1,
                  shadowBlur: 0,
                },
            },
            formatter: (params) => {
              if (!params || params.length === 0) return "";
              const firstDataPoint = params[0].data;
              const payload = firstDataPoint ? firstDataPoint.payload : null;
              if (!payload) return "";

              const date = new Date(payload.time);
              const formattedTime =
                `${date.getFullYear()}:` +
                `${String(date.getMonth() + 1).padStart(2, "0")}:` +
                `${String(date.getDate()).padStart(2, "0")} ` +
                `${String(date.getHours()).padStart(2, "0")}:` +
                `${String(date.getMinutes()).padStart(2, "0")}:` +
                `${String(date.getSeconds()).padStart(2, "0")}`;

              const tripkm = payload.tripkm ?? "0.00";
              const lat_long = payload.lat_long;

              if (Array.isArray(lat_long) && lat_long.length === 2) {
                setHoveredLatLong(`${lat_long[0].toFixed(5)}, ${lat_long[1].toFixed(5)}`);
              } else {
                setHoveredLatLong(null);
              }

              let mapLinkHtml = "";
              if (Array.isArray(lat_long) && lat_long.length === 2) {
                mapLinkHtml = `<a href="https://www.google.com/maps?q=${lat_long[0]},${lat_long[1]}"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="color: #00FFCC; font-weight: bold; text-decoration: underline; cursor: pointer; display: inline-block; margin-top: 4px;"
                >
                  Lat/Long: ${lat_long[0].toFixed(5)}, ${lat_long[1].toFixed(5)}
                </a>`;
              }

              let seriesHtml = params
                .map((p) => {
                  const val = p.value !== undefined ? p.value : "";
                  return `<div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 2px;">
                  <span style="color: ${p.color};">${p.seriesName}:</span>
                  <span style="color: ${p.color}; font-weight: 600;">${val}</span>
                </div>`;
                })
                .join("");

              return `<div style="font-family: Kanit, sans-serif; line-height: 1.4;">
                <div>${formattedTime}</div>
                <div style="color: #FFD700; font-weight: bold;">Trip (km): ${tripkm}</div>
                ${mapLinkHtml}
                <div style="margin-top: 4px; border-top: 1px solid #33415580; padding-top: 4px;">
                  ${seriesHtml}
                </div>
              </div>`;
            },
          },
          legend: {
            show: true,
            bottom: window.innerWidth < 768 ? 5 : 5,
            left: "center",
            textStyle: {
              color: "#ffffff",
              fontSize: window.innerWidth < 768 ? 10 : 12,
              fontWeight: 600,
              fontFamily: "Kanit, sans-serif",
            },
            icon: "circle",
            data: activeSeries.filter((s) => s.data.length > 0).map((s) => s.name),
          },
          dataZoom: [
            {
              type: "inside",
              zoomOnMouseWheel: true,
              moveOnMouseMove: true,
              moveOnMouseWheel: false,
            },
          ],
          series: activeSeries,
        };
      }, [processedData1, metricsSelected1, setHoveredLatLong]);

      useEffect(() => {
        if (isSelected) return; // don’t refetch once a VIN is chosen

        if (searchValue.trim().length < 2) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        const fetchSuggestions = async () => {
          try {
            const res = await fetch(
              `https://ble.nerdherdlab.com/search_vehicle.php?q=${searchValue}`
            );
            const data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
              setSuggestions(data);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }

            setHighlightIndex(-1);
          } catch (err) {
            console.error("Error fetching suggestions", err);
            setShowSuggestions(false);
          }
        };

        fetchSuggestions();
      }, [searchValue, isSelected]);

      // ✅ Central function to finalize selection + fetch
      const handleSelect = (vinNumber) => {
        setSearchValue(vinNumber);
        setVin(vinNumber); // 🚀 actual fetch triggered
        setIsSelected(true);
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightIndex(-1);
      };

      useEffect(() => {
        (async () => {
          try {
            const res = await fetch(`https://ble.nerdherdlab.com/all_vinfetch.php`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0) {
              setVinList(json);
              if (!initialVin) setVin(json[0]);
            } else {
              setVinList([]);
              setVin("");
            }
          } catch (e) {
            console.error("VIN list error", e);
          }
        })();
      }, [initialVin]);

      function getCurrentDateTimeLocal(date) {
      const offset = date.getTimezoneOffset(); 
      const local = new Date(date.getTime() - offset * 60000);
      return local.toISOString().slice(0, 16);
      }

      useEffect(() => {
      const trimmedVin = vin?.trim();
      if (!trimmedVin) {
      setDetails(null);
      return;
      }

      let ws;
      let fallbackInterval;

      // 1️⃣ REST fetch (initial load)
      const fetchDetails = async () => {
      try {
      const res = await fetch(
      `https://commandcenter.rivotmotors.com/api/allvin?vin=${encodeURIComponent(trimmedVin)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDetails(json?.data || {});
      } catch (e) {
      console.error("Vehicle details error", e);
      }
      };
      fetchDetails(); 
      }, [vin]);


      const normalizeLiveData = (msg) => {
      let parsed = { ...msg };

  if (typeof msg.ntc === "string") {
    parsed.ntc = msg.ntc.split(",").map((v) => {
      const val = v.trim();
      const num = Number(val);
      return isNaN(num) ? val : num;
    });
  }

  if (typeof msg.lat_long === "string") {
    parsed.lat_long = msg.lat_long
      .split(",")
      .map((v) => parseFloat(v.trim()));
  }

  if (parsed.time?.includes("T")) {
    parsed.time = parsed.time.replace("T", " ").replace("Z", "");
  }

  return parsed;
};
      function getCurrentDateTimeLocal(date) {
      const offset = date.getTimezoneOffset();
      const local = new Date(date.getTime() - offset * 60000);
      return local.toISOString().slice(0, 16);
      }

      const toUTC = (date) => {
      const d = new Date(date);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
      };

      const MAX_HOURS = 5;

      const addHours = (date, hours) => {
        const d = new Date(date);
        d.setHours(d.getHours() + hours);
        return d;
      };

      const subtractHours = (date, hours) => {
        const d = new Date(date);
        d.setHours(d.getHours() - hours);
        return d;
      };

      const formatLocal = (date) => {
        const pad = (n) => n.toString().padStart(2, "0");

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
      };

  useEffect(() => {
  if (!autoMode) return;

  const updateTime = () => {
    const now = new Date();
    const past4 = new Date(now.getTime() - FOUR_HOURS);

    setStartDateTime(formatDateTimeLocal(past4));
    setEndDateTime(formatDateTimeLocal(now));
  };

  updateTime(); 

  const timer = setInterval(updateTime, 60000); // every 1 min

  return () => clearInterval(timer);
}, [autoMode]);



const handleAddNote = async () => {
  if (!newNote.trim()) return;

  try {
    const res = await fetch(
      "https://commandcenter.rivotmotors.com/create_note.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vinnumber: vin,
          note: newNote,
        }),
      }
    );

    const data = await res.json();

    console.log(data);

    if (data.status === "success") {

      setNewNote("");

      await loadNotes();

    } else {

      alert(data.message);

    }

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
    // console.log("Notes:", notes);
}, [notes]);

const handleUpdateNote = async (id) => {
  try {
    const res = await fetch(
      "https://commandcenter.rivotmotors.com/update_note.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          note: editingText,
        }),
      }
    );

    const data = await res.json();

    if (data.status === "success") {
      setEditingId(null);
      setEditingText("");
      loadNotes();
    }
  } catch (err) {
    console.error(err);
  }
};

const loadNotes = async () => {
  if (!vin) {
    // console.log("VIN is empty");
    return;
  }

  try {
    setLoadingNotes(true);

    // console.log("VIN:", vin);

    const url = `https://commandcenter.rivotmotors.com/get_notes.php?vin=${encodeURIComponent(vin)}`;
    // console.log("URL:", url);

    const res = await fetch(url);

    // console.log("Status:", res.status);

    const data = await res.json();

    // console.log("Response:", data);

    if (data.status === "success") {
      // console.log("Notes received:", data.data);

      setNotes(data.data);

    } else {
      // console.log("API Error:", data.message);
      setNotes([]);
    }

  } catch (err) {
    console.error(err);
    setNotes([]);
  } finally {
    setLoadingNotes(false);
  }
};

const handleDeleteNote = async () => {
  if (!noteToDelete) return;

  try {
    const res = await fetch(
      "https://commandcenter.rivotmotors.com/delete_note.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: noteToDelete,
        }),
      }
    );

    const data = await res.json();

    if (data.status === "success") {
      loadNotes();
      setDeleteOpen(false);
      setNoteToDelete(null);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
    loadNotes();
}, [vin]);

    const handleStartChange = (value) => {
      // Stop auto‑range while user edits
      setAutoMode(false);

      const newStart = new Date(value);
      if (isNaN(newStart)) return;

      // Keep the current end value; enforce 4‑hour window immediately
      const currentEnd = endDateTime ? new Date(endDateTime) : new Date(newStart.getTime() + FOUR_HOURS);
      const { start: fixedStart, end: fixedEnd } = enforceFourHourWindow(newStart, currentEnd, 'start');

      setStartDateTime(formatDateTimeLocal(fixedStart));
      setEndDateTime(formatDateTimeLocal(fixedEnd));
    };
          
    const handleEndChange = (value) => {
      // Stop auto‑range while user edits
      setAutoMode(false);

      const newEnd = new Date(value);
      if (isNaN(newEnd)) return;

      // Keep the current start value; enforce 4‑hour window immediately
      const currentStart = startDateTime ? new Date(startDateTime) : new Date(newEnd.getTime() - FOUR_HOURS);
      const { start: fixedStart, end: fixedEnd } = enforceFourHourWindow(currentStart, newEnd, 'end');

      setStartDateTime(formatDateTimeLocal(fixedStart));
      setEndDateTime(formatDateTimeLocal(fixedEnd));
    };

    const resetToAuto = () => {
      setAutoMode(true);
      setStartDateTime(getCurrentDateTimeLocal(new Date(Date.now() - 4 * 60 * 60 * 1000)));
      setEndDateTime(getCurrentDateTimeLocal(new Date()));
      };

      useEffect(() => {
      if (!autoMode) return;

      const updateRange = () => {
      setStartDateTime(getCurrentDateTimeLocal(new Date(Date.now() - 4 * 60 * 60 * 1000)));
      setEndDateTime(getCurrentDateTimeLocal(new Date()));
      };

      updateRange(); // first run
      const timer = setInterval(updateRange, 60000);

      return () => clearInterval(timer);
      }, [autoMode]);

      const fetchHistoricalData = async () => {
      if (!vin || !startDateTime || !endDateTime) {
        setAlertMessage("Please select VIN Number.");
        return;
      }

      setLoading(true);
      setShowHistoryChart(true);

      setTimeout(() => {
        chartRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100); 

        try {
          const url = `https://ble.nerdherdlab.com/backtimedatfetch.php?vin=${encodeURIComponent(
            vin
          )}&start=${encodeURIComponent(toUTC(startDateTime))}&end=${encodeURIComponent(
            toUTC(endDateTime)
          )}`;

          const res = await fetch(url);
          const text = await res.text();
          const json = JSON.parse(text);
          const data = json.data || json;

          if (Array.isArray(data) && data.length > 0) {
            setHistoryData(data.reverse());
             if (echartsRef.current) {
              echartsRef.current.getEchartsInstance().dispatchAction({
                type: 'dataZoom',
                start: 0,
                end: 100
              });
            }
            setZoomSpan(100);
          } else {
            setHistoryData([]);
            setAlertMessage("No data available in this range.");
          }
        } catch (err) {
          console.error(err);
          setAlertMessage("Failed to load data.");
          setHistoryData([]);
        } finally {
          setLoading(false);
        }
      };

      async function getReadableLocation(lat_long) {
      if (!lat_long) return "N/A";

      let lat, lng;

      if (typeof lat_long === "object") {
      if (Array.isArray(lat_long)) {
      [lat, lng] = lat_long;
      } else {
      lat = lat_long.lat ?? lat_long.latitude;
      lng = lat_long.lng ?? lat_long.lon ?? lat_long.longitude;
      }
      } else if (typeof lat_long === "string" && lat_long.includes(",")) {
      [lat, lng] = lat_long.split(",").map((n) => parseFloat(n.trim()));
      }

      lat = parseFloat(lat);
      lng = parseFloat(lng);
      if (isNaN(lat) || isNaN(lng)) return "00";

      // ✅ LocalStorage cache
      const cacheKey = `loc:${lat.toFixed(5)},${lng.toFixed(5)}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;

      try {
      const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
      headers: {
      "User-Agent": "YourAppName/1.0 (your@email.com)", // required by Nominatim
      "Accept-Language": "en", // optional, force English
      },
      }
      );
      const data = await res.json();
      const result = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      localStorage.setItem(cacheKey, result); // save for next time
      return result;
      } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
      }

      useEffect(() => {
      if (!processedData?.length) return;

      // collect unique lat_long values
      let queue = [...new Set(processedData.map((row) => row.lat_long).filter(Boolean))];

      let i = 0;
      const interval = setInterval(() => {
      if (i >= queue.length) {
      clearInterval(interval);
      return;
      }

      const latlong = queue[i];
      if (latlong && !locationMap[latlong]) {
      getReadableLocation(latlong).then((name) => {
      setLocationMap((prev) => ({ ...prev, [latlong]: name }));
      });
      }

      i++;
      }, 1100); 

      return () => clearInterval(interval);
      }, [processedData]);


      useEffect(() => {
      if (!vin) return;
      activeVinRef.current = vin;
      setRawLiveData([]);
      setLiveDataWebStock(null);
      setDetails(null);
      }, [vin]);

      useEffect(() => {
  if (!vin) return;



  // 1️⃣ Put VIN into search box
  setSearchValue(vin);
  // 2️⃣ Lock selection state
  setIsSelected(true);
  setShowSuggestions(false);
  setHighlightIndex(-1);

  // 3️⃣ Trigger same logic as manual search
  handleSelect(vin);

}, [vin]);

const getCpu1Temp = (dataString) => {
  if (!dataString) return null;

  const values = dataString.split(";");
  return values[3] ? parseFloat(values[3]) : null;
};

const cpu1Temp = getCpu1Temp(latestData?.data);

const ntcString = latestData?.ntc || "";



const chargingStatus = latestData?.chargingstatus || "0";

const [
  chargingStateRaw = "0",
  chargingCurrentRaw = "0",
  thirdValue = "0",
] = chargingStatus.split(",");

const chargingState = Number(chargingStateRaw);

const chargingCurrentof = Number(chargingCurrentRaw).toFixed(1);


const { ctKm, ltKm, totalKm } = (() => {
  const raw = latestData?.recoengine;

  if (!raw) {
    return {
      ctKm: "0.00",
      ltKm: "0.00",
      totalKm: "0.00",
    };
  }

  const [
    currentTrip = "0",
    lastTrip = "0",
    totalTrip = "0",
  ] = raw.split(",");

  return {
    ctKm: Number(currentTrip).toFixed(2),   // Current Trip
    ltKm: Number(lastTrip).toFixed(2),      // Last Trip
    totalKm: Number(totalTrip).toFixed(2),  // Total Trip
  };
})();


// Duplicate FOUR_HOURS removed; using earlier definition

const formatDateTimeLocal = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};


const getRangeValue = (dataString) => {
  if (!dataString) return "--";

  return dataString.split(";")[0];
};

const rangeValue = getRangeValue(latestData?.data);




 const upTime =
  latestData?.uptime?.split(";")[1] || "--";

useEffect(() => {
  if (!vin) return;

  setFullData([]);
  setVisibleRange({
    start: 0,
    end: WINDOW_SIZE,
  });
}, [vin]);




      return (
      <div class="min-h-screen bg-black text-white">
      <div>
      <header
      className={`fixed top-2 z-[2000] p-3 ml-2 
      bg-[#0d0d0d]/70 backdrop-blur-xl transition-all duration-500
      ${
      isScrolled
      ? "h-20 rounded-2xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
      : "h-20 border-b border-white/10 rounded-none shadow-none"
      }
      ${
      isCollapsed
      ? "left-16 w-[calc(100%-4rem-1rem)] hidden sm:block"
      : "left-56 w-[calc(100%-14rem-1rem)] hidden sm:block"
      }
      sm:flex items-center`}
      >
      <div className="flex h-full w-full items-center justify-between px-6">

      <div className="flex items-center gap-3">
      <img
      src="https://image2url.com/images/1755511837883-d480dc7d-7419-4341-acc6-decf0d6810b5.png"
      alt="Rivot Motors"
      className="h-10 drop-shadow-md"
      />
      <h1 className="text-white font-Blank tracking-wide sm:text-xl">
      <span className="text-white">RIVOT MOTORS</span>{" "}
      <span className="text-white">COMMAND CENTER</span>
      </h1>
      </div>

      <div className="flex items-center gap-2 w-full max-w-md justify-end">

      <div className="relative flex-1 min-w-[250px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

      <input
      ref={inputRef}
      type="text"
      value={searchValue}
      onChange={(e) => {
      setSearchValue(e.target.value);
      setIsSelected(false);
      }}
      onKeyDown={(e) => {
      if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && searchValue.trim() !== "") {
      e.preventDefault();
      handleSelect(searchValue);
      }
      return;
      }
      if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
      prev < suggestions.length - 1 ? prev + 1 : 0
      );
      } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
      prev > 0 ? prev - 1 : suggestions.length - 1
      );
      } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
      handleSelect(suggestions[highlightIndex].vinnumber);
      } else {
      handleSelect(searchValue);
      }
      } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIndex(-1);
      }
      }}
      placeholder="Search by VIN / Name / Phone"
      className="w-full rounded-full border border-white/10 bg-white/5
pl-9 pr-16 py-2.5
text-base text-white
outline-none
transition-all duration-300
hover:border-orange-400
focus:border-orange-500
focus:bg-white/10
shadow-inner"
      />

      {searchValue && (
      <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
      setSearchValue("");
      setIsSelected(false);
      setHighlightIndex(-1);
      setShowSuggestions(false);
      requestAnimationFrame(() => {
      inputRef.current?.focus();
      });
      }}
      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-400 transition"
      >
      ✕
      </button>
      )}
      {showSuggestions && suggestions.length > 0 && (
      <ul className="absolute left-0 top-full mt-2 w-full rounded-xl bg-[#0d0d0d]/95 border border-white/10 max-h-60 overflow-y-auto shadow-xl z-20">
      {suggestions.map((s, i) => (
      <li
      key={i}
      onClick={() => handleSelect(s.vinnumber)}
      className={`px-3 py-2 cursor-pointer text-sm ${
        i === highlightIndex
          ? "bg-orange-500/40 text-white"
          : "hover:bg-orange-500/20"
      }`}
      >
      <div className="font-medium">{s.vinnumber}</div>
      <div className="text-xs text-gray-400">
        {s.ownername} • {s.phonenumber}
      </div>
      </li>
      ))}
      </ul>
      )}
      </div>

      <button
      onClick={() => {
      if (searchValue.trim() !== "") {
         inputRef.current?.blur();
      handleSelect(searchValue);
      }
      }}
      className="px-4 py-2 rounded-full 
      bg-gradient-to-tr from-orange-500 to-yellow-400 
      text-black font-Kanit text-sm
      hover:scale-105 hover:shadow-md 
      transition-all duration-300"
      >
      Go
      </button>

      <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-full 
      bg-gradient-to-tr from-orange-500 to-yellow-400 
      text-black font-Kanit text-sm
      hover:scale-105 hover:shadow-md 
      transition-all duration-300"
      >
      Logout
      </button>
      </div>
      </div>
      </header>

      <header
      className={`sm:hidden fixed top-2 left-2 right-2 z-[1000]  flex flex-col gap-2 
      bg-[#0d0d0d]/80 backdrop-blur-xl px-4 pt-2
      transition-all duration-500 
      ${
      isScrolled
      ? "rounded-2xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
      : "border-b border-white/10 rounded-none shadow-none"
      }
      `}
      >
      {/* 🔹 Top Row: Menu + Logo + Logout */}
      <div className="flex items-center justify-between">
      {/* Left: Menu */}
      <button
      onClick={() => setSidebarOpen(true)}
      className="flex-shrink-0 p-2 rounded-full hover:bg-white/10 transition"
      >
      <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Center: Logo */}
      <img
      src="https://image2url.com/images/1755511837883-d480dc7d-7419-4341-acc6-decf0d6810b5.png"
      alt="Rivot Motors"
      className="h-8"
      />

      {/* Right: Logout */}
      <button
      onClick={handleLogout}
      className="w-9 h-9 flex items-center justify-center rounded-full 
      bg-gradient-to-tr from-orange-500 to-yellow-400 text-black
      hover:scale-105 hover:shadow-md transition"
      >
      <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      >
      <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m-4 1H7a2 2 0 00-2 2v10a2 2 0 002 2h2"
      />
      </svg>
      </button>
      </div>

      {/* 🔹 Bottom Row: Modern Search Bar */}
      <div className="w-full flex flex-col items-center pb-2">
      <div className="flex items-center w-full rounded-xl border border-white/10 bg-[#1a1a1a] 
              px-3 py-2 shadow-inner 
              hover:border-orange-400 focus-within:border-orange-500
              transition-all duration-300">

      {/* Search Icon */}
      <Search
      className={`w-5 h-5 mr-2 transition-colors
      ${searchValue ? "text-orange-400" : "text-gray-400"}
      `}
      />

      {/* Input */}
      <input
      ref={inputRef}
      type="text"
      value={searchValue}
      onChange={(e) => {
      setSearchValue(e.target.value);
      setIsSelected(false);
      }}
      onKeyDown={(e) => {
      if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter" && searchValue.trim() !== "") {
         inputRef.current?.blur();
        e.preventDefault();
        handleSelect(searchValue);
      }
      return;
      }
      if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
      } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
      } else if (e.key === "Enter") {
      e.preventDefault();
        inputRef.current?.blur();
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        handleSelect(suggestions[highlightIndex].vinnumber);
      } else {
        handleSelect(searchValue);
      }
      } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIndex(-1);
      }
      }}
      placeholder="Search by VIN / Name / Phone"
            className="flex-grow bg-transparent text-base text-white placeholder-gray-400
            outline-none"
      />

      {/* Clear Button */}
      {searchValue && (
      <button
      type="button"
      onClick={() => {
      setSearchValue("");
      setIsSelected(false);
      setHighlightIndex(-1);
      setShowSuggestions(false);
      if (inputRef.current) inputRef.current.focus();
      }}
      className="w-6 h-6 flex items-center justify-center rounded-full 
              text-gray-400 hover:text-orange-400 transition mr-1"
      >
      ✕
      </button>
      )}

      <button
      onClick={() => {
      if (searchValue.trim() !== "") handleSelect(searchValue);
      }}
      className="w-8 h-8 flex items-center justify-center rounded-full
      bg-gradient-to-tr from-orange-500 to-yellow-400 text-black
      hover:scale-110 hover:shadow-md transition"
      >
      <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      >
      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
      </svg>
      </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
      <ul className="mt-2 w-full rounded-xl bg-[#0d0d0d]/95 border border-white/10 shadow-xl max-h-44 overflow-y-auto z-50 text-sm">
      {suggestions.map((s, i) => (
      <li
      key={i}
      onClick={() => handleSelect(s.vinnumber)}
      className={`px-3 py-2 cursor-pointer ${
        i === highlightIndex
          ? "bg-orange-500/40 text-white"
          : "hover:bg-orange-500/20"
      }`}
      >
      <div className="font-medium">{s.vinnumber}</div>
      <div className="text-xs text-gray-400">
        {s.ownername} • {s.phonenumber}
      </div>
      </li>
      ))}
      </ul>
      )}
      </div>
      </header>

      <div className="min-h-screen bg-black text-white  ml-0">
      {/* Sidebar */}
      <div
      className={`${
      isCollapsed ? "w-16" : "w-56"
      } hidden sm:flex fixed top-0 left-0 h-screen
      bg-[#0d0d0d]/90 backdrop-blur-xl border-r border-white/10 
      text-white flex-col transition-all duration-300 z-20 shadow-lg`}
      >
      <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="mb-8 mt-4 flex items-center justify-center w-10 h-10 mx-auto 
          rounded-xl bg-gradient-to-tr from-orange-500 to-yellow-400 text-black 
          hover:scale-105 hover:shadow-md transition"
      >
      {isCollapsed ? (
      <Menu size={20} /> 
      ) : (
      <ChevronLeft size={20} />
      )}
      </button>
      <ul className="space-y-2 flex-1 px-2">
      {[
      { id: "home", label: "Dashboard", icon: <Home size={20} /> },
      { id: "graph", label: "Graph", icon: <BarChart2 size={20} /> },
      { id: "table", label: "Table", icon: <Table size={20} /> },
      { id:"world",    label:"Geo location",    icon:  <Map size={20}/>},
      { id:"tickets",   label:"Tickets",    icon:  <Ticket size={20}/>},
      { id:"commad",   label:"Command",   icon:  <Command size={20}/>},
      { id:"mapinvechical",   label:"All nx100",   icon:  <Locate  size={20}/>},
      { id:"nxdata",   label:"All nx100 data",   icon:  <Database  size={20}/>},
      ].map((item) => (
      <li key={item.id}>
      <button
      onClick={() => setActivePage(item.id)}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
        transition-all duration-300 relative group
        ${
          activePage === item.id
            ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-Kanit shadow-md"
            : "hover:bg-white/10 text-gray-300"
        }`}
      >
      <div
        className={`flex items-center justify-center transition-all duration-300
          ${activePage === item.id ? "text-black" : "text-gray-400 group-hover:text-orange-400"}
        `}
      >
        {item.icon}
      </div>
      {!isCollapsed && <span>{item.label}</span>}
      {activePage === item.id && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-lg"></span>
      )}
      </button>
      </li>
      ))}
      </ul>
      </div>

      <div>
    
      {sidebarOpen && (
      <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 
            transition-opacity duration-500 animate-fadeIn"
      onClick={() => setSidebarOpen(false)}
      />
      )}
 
      <div
      className={`fixed top-0 left-0 h-full 
      w-[45%] max-w-sm sm:w-56  
      bg-[#0d0d0d]/95 backdrop-blur-xl border-r border-white/10 
      shadow-2xl z-[1000] 
      transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

      {/* Close Button */}
      <button
      onClick={() => setSidebarOpen(false)}
      className="mb-8 mt-4 flex items-center justify-end w-full 
            px-2 text-gray-400 hover:text-orange-400 
            transition-colors duration-300"
      >
      <X size={24} />
      </button>

      {/* Navigation */}
      <ul className="space-y-3">
      {[
      { id: "home", label: "Dashboard", icon: <Home size={20} /> },
      { id: "graph", label: "Graph", icon: <BarChart2 size={20} /> },
      { id: "table", label: "Table", icon: <Table size={20} /> },
      { id:"world",  label:"Geo location",    icon:  <Map size={20}/>},
      { id:"tickets", label:"Tickets",    icon:  <Ticket size={20}/>},
      { id:"commad",  label:"Command",   icon:  <Command size={20}/>},
      { id:"mapinvechical", label:"All nx100",   icon:  <Locate  size={20}/>},
      { id:"nxdata",   label:"All nx100 data",   icon:  <Database  size={20}/>},
      ].map((item) => (
      <li key={item.id}>
      <button
      onClick={() => {
      setActivePage(item.id);
      setSidebarOpen(false); 
      }}
      className={`flex items-center gap-3 w-full px-4 py-2.5 
      rounded-xl transition-all duration-300 relative group
      ${
      activePage === item.id
      ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-Kanit shadow-md"
      : "hover:bg-white/10 text-gray-300"
      }`}
      >
      {/* Icon */}
      <span
      className={`transition-colors duration-300 ${
      activePage === item.id
      ? "text-black"
      : "text-gray-400 group-hover:text-orange-400"
      }`}
      >
      {item.icon}
      </span>

      {/* Label */}
      <span>{item.label}</span>

      {/* Active Glow Indicator */}
      {activePage === item.id && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-lg bg-orange-500 shadow-[0_0_10px_rgba(255,153,19,0.7)]"></span>
      )}
      </button>
      </li>
      ))}
      </ul>
      </div>
      </div>

      {/* Main Content */}
      <main
      ref={mainRef}
      className="flex-1 p-3 bg-transparent text-white 
        transition-all duration-300 overflow-y-auto"
      style={{
      marginLeft: window.innerWidth < 640 ? "0" : isCollapsed ? "4rem" : "14rem", // ✅ sync with w-16 & w-56
      paddingTop: window.innerWidth < 640 ? "7.5rem" : "6rem",
      }}
      >
      
      {activePage === "home" && (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-3 mb-2">
      {/* VIN Number */}
        <StatCard
        label="VIN"
        value={
          <div>
            <div>{details?.vinnumber || details?.vinNumber || vin || "--"}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              SIM: {simValue}
            </div>
          </div>
        }
        icon={CreditCard}
      />
      {/* Owner */}
     <StatCard
      label="Owner & Phone"
      value={
        <div className="flex flex-col">
          <span className="font-medium">
            {details?.ownerName || details?.ownername || "--"}
          </span>
          <span className="text-sm text-gray-400">
            {details?.phoneNumber || details?.phonenumber || "--"}
          </span>
        </div>
      }
      icon={User}
    />

<div className="relative inline-block">
  <div onClick={() => {
  setNoteOpen(true);
  loadNotes();
}} className="cursor-pointer">
   <StatCard
  label="Notes"
  value={
    notes.length > 0
      ? notes[0].note.length > 30
        ? notes[0].note.substring(0, 30) + "..."
        : notes[0].note
      : "No notes yet"
  }
  icon={FileText}
  valueClassName="text-sm leading-5"
/>
  </div>

  {noteOpen && (
  <div
    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
    onClick={() => setNoteOpen(false)}
  />
)}

  {noteOpen && (
  <div className=" absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-[545px] rounded-2xl bg-[#111827] border border-gray-700 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">

    {/* Header */}
    <div className="flex justify-between items-center border-b border-gray-700 px-6 py-4">
      <h2 className="text-xl font-semibold tracking-tight text-white">
          Vehicle notes
      </h2>

      <button
        onClick={() => setNoteOpen(false)}
        className="text-gray-400 hover:text-white text-xl"
      >
        ✕
      </button>
    </div>

    {/* Add Note */}
    <div className="p-4 md:p-5 border-b border-gray-700">

      <textarea
        rows={3}
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Write a new note..."
        className="w-full rounded-xl bg-black/20 border border-gray-600 p-3 text-[14px] tracking-tight leading-6 text-white resize-none"
      />

      <div className="flex justify-end mt-3">

        <button
          onClick={handleAddNote}
          className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg"
        >
          Add Note
        </button>

      </div>

    </div>

    <div className="max-h-[55vh] md:max-h-[400px] overflow-y-auto">

      {loadingNotes ? (

        <div className="text-center py-6 text-gray-400">
          Loading...
        </div>

      ) : notes.length === 0 ? (

        <div className="text-center py-6 text-gray-400">
          No notes available
        </div>

      ) : (
        
        notes.map((item) => (

          <div
            key={item.id}
            className="border-b border-gray-700 p-4 md:p-5"
          >

            {editingId === item.id ? (

              <>
                <textarea
                  rows={3}
                  value={editingText}
                  onChange={(e) =>
                    setEditingText(e.target.value)
                  }
                  className="w-full rounded-lg bg-black/20 border border-gray-600 p-3 text-white"
                />

                <div className="flex justify-end gap-2 mt-3">

                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingText("");
                    }}
                    className="px-4 py-2 bg-gray-600 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateNote(item.id)
                    }
                    className="px-4 py-2 bg-green-600 rounded-lg"
                  >
                    Update
                  </button>

                </div>
              </>

            ) : (

              <>
                <p className="text-white whitespace-pre-wrap text-[14px] tracking-tight leading-6">
                    {item.note}
                </p>

                <p className="text-xs text-gray-500 tracking-tight mt-2">
                    {item.created_at}
                  </p>

                <div className="flex justify-end gap-5 mt-3">

                  <button
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingText(item.note);
                    }}
                  >
                    Edit
                  </button>

                  <button
                  className="text-red-400 hover:text-red-300 btn btn-danger"
                  onClick={() => {
                    setNoteToDelete(item.id);
                    setDeleteOpen(true);
                  }}
                >
                  Delete
                </button>

                </div>
              </>

            )}

          </div>

        ))

      )}

    </div>

  </div>
)}


{deleteOpen && (
  <div className="absolute top-20 right-0 z-[60] w-[350px] rounded-2xl bg-[#111827] border border-red-500/40 shadow-2xl p-4 md:p-5">

    <h3 className="text-lg font-semibold text-white mb-2">
      Delete Note
    </h3>

    <p className="text-gray-300 text-sm mb-5">
      Are you sure you want to delete this note?
    </p>

    <div className="flex justify-end gap-3">

      <button
        onClick={() => {
          setDeleteOpen(false);
          setNoteToDelete(null);
        }}
        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
      >
        Cancel
      </button>

      <button
        onClick={handleDeleteNote}
        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
      >
        Delete
      </button>

    </div>

  </div>
)}


</div>
 
     {/* 📍 Location */}
      <div className="sm:col-span-2 lg:col-span-2">
      <StatCard
      icon={MapPin}
      valueClassName="font-medium text-blue-300 w-full block text-[clamp(12px,1vw,16px)] break-words leading-snug line-clamp-2"
      value={
      locationData ? (
      <div className="flex flex-col space-y-1 text-left flex-1 w-full">
      <a
      href={locationData.mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-300 hover:underline break-words line-clamp-2"
      >
      {locationData.locationName ||
      `${locationData.lat.toFixed(5)}, ${locationData.lng.toFixed(5)}`}
      </a>
      <span className="text-[11px] text-orange-400 font-medium flex items-center gap-2">
      <span className="text-gray-400">Last updated:</span>
      {locationData.formattedTime}

      {mapsFlag === "1" && (
      <span className="text-yellow-400 font-semibold">
      • Map request has been raised
      </span>
      )}
      </span>

      </div>
      ) : (
      "0.0"
      )
      }
      />
      </div>
      
      </div>
      {/* 🔹 Outer container for all cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
      <div
      className="relative rounded-2xl p-3 
        bg-neutral-950 border border-white/10 
        text-white shadow-lg 
        transition-colors duration-300 hover:border-orange-500
        flex flex-col md:col-span-5 "
      >
      {/* 🔹 Component Data Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3  relative z-10 " >
   <div className="transition-all duration-300 hover:scale-105 hover:min-w-[220px]">
 <StatChip
  label="Controller serial no."
  value={details?.controllerid || "--"}
  className="hover:min-w-[240px]"
  labelClassName="text-[11px] whitespace-nowrap"
/>
</div>
      <StatChip label="Motor serial no." value={details?.motorid || "--"}  />
      <StatChip label="BMS serial no." value={details?.bmsid || "--"} />
      <StatChip label="comfortKey ID" value={details?.smartkeyid || "--"} />
      <StatChip label="Charger serial no." value={details?.chargerid ?? "--"} />
      <StatChip label="BMS life cycles" value={details?.bmslifecycles ?? "--"} />
      
      <StatChip
    label="Current rider"
    value={
    <div className="flex flex-col leading-tight">
      <span className="pb-0.5">
        {details?.riders ?? "--"}
      </span>

      <span className="text-xs text-gray-400">
  SPD: {details?.top_speed ?? "--"} km | TRQ: {details?.top_torque ?? "--"}
    </span>
    </div>
  }
  />
     <StatChip
        label="rideOS"
        value={
          <div className="flex flex-col leading-tight">
            <span className="pb-0.5">
              {details?.rideosversion?.split(";")[0] || "--"}
            </span>

            <span className="text-xs text-gray-400">
              Up time: {latestData?.uptime}
            </span>
          </div>
        }
      />
      <StatChip
  label="Model"
  value={
    <div className="flex flex-col">
      <span>{details?.model ?? "--"}</span>
      <span className="text-xs text-gray-400">
       Plate no:  {details?.platenumber ?? "--"}
      </span>
    </div>
  }
/>
      <StatChip
  value={(() => {
    const handleLocked = Number(liveAllVinData?.handlelockstate) !== 1;

    const powerState =
      (latestData?.ev_power_state || "").split(";")[0].trim();

    const scooterLocked = powerState === "OFF";

    return (
      <div className="flex flex-col gap-1 text-sm font-Kanit">
        {/* Handle Lock */}
        <div>
          <span className="text-[12px] sm:text-[13px] font-medium tracking-wide text-gray-400">
            Handle lock :
          </span>{" "}
          <span
            className={
              handleLocked
                ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                : "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
            }
          >
            {handleLocked ? "Locked" : "Unlocked"}
          </span>
        </div>

        {/* Scooter Lock */}
        <div>
          <span className="text-[12px] sm:text-[13px] font-medium tracking-wide text-gray-400">
            Scooter lock :
          </span>{" "}
          <span
            className={
              scooterLocked
                ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                : "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
            }
          >
            {scooterLocked ? "Locked" : "Unlocked"}
          </span>
        </div>
      </div>
    );
  })()}
/>

   <StatChip
  label="Charging status"
  value={
    <div className="flex items-center gap-2">
      {chargingState === 1 ? (
        <span className="text-green-400 text-[14px] font-Kanit drop-shadow-[0_0_10px_rgba(34,197,94,0.9)]">
          Charging
        </span>
      ) : chargingState === 2 ? (
        <span className="text-yellow-400 text-[14px] font-Kanit drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]">
          Plugged in
        </span>
      ) : (
        <span className="text-gray-400 text-[14px] font-Kanit drop-shadow-[0_0_8px_rgba(156,163,175,0.8)]">
          Not charging
        </span>
      )}

      <span className="text-white font-Kanit text-[12px] text-orange-500">
        {chargingCurrentof} /{" "}
        {latestData?.allowablechargingcurrent != null
          ? Number(latestData.allowablechargingcurrent).toFixed(0)
          : "0"}
        A
      </span>
    </div>
  }
/>
           <StatChip
  label={<div className="flex flex-col leading-tight text-gray-300" />}
  value={
    <div className="flex flex-col leading-tight">
      <span className="font-Kanit">
        <span className="text-[12px] sm:text-[13px] font-medium tracking-wide text-gray-400">
          MCU :
        </span>{" "}
        <span>{mcuVersion}</span>
      </span>

      <span className="font-Kanit">
        <span className="text-[12px] sm:text-[13px] font-medium tracking-wide text-gray-400">
          AOSP:
        </span>{" "}
        <span className="text-[12px] sm:text-[12px]">
          {aospVersion}
        </span>
      </span>
    </div>
  }
/>
        </div>
        </div>

      <CustomAlert message={alertMessage} onClose={() => setAlertMessage("")} />

      <div
      className="relative rounded-2xl p-3 
        bg-neutral-950 border border-white/10 
        text-white shadow-lg 
        transition-all duration-300 hover:border-orange-500 
        flex flex-col h-full md:col-span-3 "
      >
      <SectionTitle left="Speed" />

      <div className="flex justify-between ">
      {/* Trip & Odo cards */}
      <div className="flex flex-col gap-8 ml-0">

      <div
      className="rounded-xl p-3 flex flex-col items-center text-center w-27
        bg-gradient-to-br from-neutral-800 to-black 
        border border-white/10 shadow-md
        hover:border-orange-500 hover:shadow-orange-500/20 transition"
      >
      <p className="text-sm text-gray-400">Trip km</p>
      <h2 className="text-xl font-Kanit text-white">
      {latestData?.tripkm ?? "00"}
      </h2>

      </div>


      {/* Odo meter */}
      <div
      className="rounded-xl p-3 flex flex-col items-center text-center w-27
        bg-gradient-to-br from-neutral-800 to-black 
        border border-white/10 shadow-md
        hover:border-orange-500 hover:shadow-orange-500/20 transition"
      >
      <p className="text-sm text-gray-400">Odo meter</p>
      <h2 className="text-xl font-Kanit text-white">
      {liveAllVinData?.odo !== undefined
      ? (Math.floor(liveAllVinData.odo * 100) / 100).toFixed(2)
      : "00"}
      </h2>
      </div>

      <div
      className="rounded-xl p-3 flex flex-col items-start text-start w-17
      bg-gradient-to-br from-neutral-800 to-black 
      border border-white/10 shadow-md
      hover:border-orange-500 hover:shadow-orange-500/20 transition"
    >
    <p className="text-sm text-gray-400">Current gear</p>

      <h2 className="text-[15px] font-Kanit text-white">
      {gearDisplay}
    </h2>
    </div>


      </div>
      {/* Gauge */}
      <div className="flex flex-col items-center justify-center flex-1 -mt-6 overflow-hidden">
  
  <ThreeQuarterGauge
    value={Number(latestData?.speed_kmph) || 0}
    max={120}
    unit="km/h"
    width={210}
  />

  {/* 🔥 Range display */}
  {/* <div className="mt-2 text-center">
    <p className="text-xs text-gray-400">Range</p>
    <h2 className="text-lg font-Kanit text-white">
      {rangeValue} km
    </h2>
  </div> */}

   <div
  className="mt-6 rounded-xl p-3 flex flex-col items-center text-start w-28
    bg-gradient-to-br from-neutral-800 to-black 
    border border-white/10 shadow-md
    hover:border-orange-500 hover:shadow-orange-500/20 transition"
>  
      <p className="text-sm text-gray-400">Range km</p>
    <h2 className="text-xl font-Kanit text-white">
      {latestData?.range
        ? `${Number(latestData.range).toFixed(1)} km`
        : "--"}
    </h2>

      </div>
</div>
    </div>
  </div>

      {/* 🔹 Main SOC */}
<div
  className="relative rounded-2xl p-3 
  bg-neutral-950 border border-white/10 
  text-white shadow-lg 
  transition-all duration-300 hover:border-orange-500 
  flex flex-col h-full md:col-span-4 overflow-hidden"
>
  <SectionTitle left="Battery" />

  {/* ===== TOP: Gauges Row ===== */}
  <div className="relative flex justify-center items-center gap-3 sm:gap-4 md:gap-10">
    
   {/* 🔸 APU SOC */} 
   
<div className="relative flex flex-col items-center">

  <p className="text-xs font-medium text-gray-400 tracking-wide">
    APU SOC
  </p>

  <SpeedGaugesoc
    value={Number(latestData?.apusoc) || 0}
    max={100}
    width={isMobile ? 100 : 120}
    className="max-w-[100px] sm:max-w-[120px]"
  >
    <div className="flex flex-col items-center justify-center">

      <h2 className="text-base font-semibold text-white leading-none">
        {latestData?.apusoc != null && !isNaN(latestData.apusoc)
          ? Number(latestData.apusoc).toFixed(0)
          : "00"}%
      </h2>

      {/* Divider */}
      <div className="w-[35px] sm:w-[45px] h-[1px] bg-gray-600 my-1"></div>

      {/* APU Voltage */}
      <p className="text-[10px] sm:text-xs text-gray-400 leading-none">
        {latestData?.apuvoltage != null &&
        !isNaN(latestData.apuvoltage)
          ? Number(latestData.apuvoltage).toFixed(1)
          : "00.0"}{" "}
        V
      </p>

    </div>
  </SpeedGaugesoc>

</div>

    {/* 🔹 MAIN SOC */}
    <div className="flex flex-col items-center">
      
      <p className="text-sm font-medium text-gray-400 tracking-wide">
        Main SOC
      </p>

      <SpeedGaugesoc
        value={Number(latestData?.soc) || 0}
        max={100}
        width={isMobile ? 200 : 220}
        className="max-w-[150px] sm:max-w-[220px]" // ✅ mobile safe
      >
        <div className="flex flex-col items-center justify-center">
          
          <h2 className="text-xl sm:text-3xl font-Kanit text-white leading-none">
            {latestData?.soc != null && !isNaN(latestData.soc)
              ? Number(latestData.soc).toFixed(1)
              : "00"}%
          </h2>

          <div className="w-[65px] sm:w-[85px] h-[1px] bg-gray-600 my-1"></div>

         <p className="text-xs sm:text-sm text-gray-400 leading-none">
          {latestData?.batvoltage != null && !isNaN(latestData.batvoltage)
            ? Number(latestData.batvoltage).toFixed(1)
            : "00.0"}{" / "}
          {latestData?.maxtotalvoltage != null &&
          !isNaN(latestData.maxtotalvoltage)
            ? Number(latestData.maxtotalvoltage).toFixed(1)
            : "00.0"}{" "}
          V
        </p>

        </div>
      </SpeedGaugesoc>
    </div>
  </div>

  {/* ===== BOTTOM: 3 CARDS ===== */}
 <div className="w-full -mt-12 px-2 sm:px-4">
  
  {/* Heading */}
  <p className="text-[12px] md:text-[16px] text-green-300 font-medium mb-2 ml-1">
    recoEngine meter:
  </p>

  {/* Cards */}
  <div className="flex justify-between items-center gap-4">

  <div className="flex-1 rounded-xl p-2 sm:p-3 flex flex-col items-center text-center
      bg-gradient-to-br from-neutral-800 to-black 
      border border-white/10 shadow-md">
      <span className="text-[11px] sm:text-[13px] text-gray-400 mb-1">Current trip</span>
      <span className="text-green-300 text-xs sm:text-sm font-medium">{ctKm} km</span>
    </div>

    <div className="flex-1 rounded-xl p-2 sm:p-3 flex flex-col items-center text-center
      bg-gradient-to-br from-neutral-800 to-black 
      border border-white/10 shadow-md">
      <span className="text-[11px] sm:text-[14px] text-gray-400 mb-1">Last trip</span>
      <span className="text-green-300 text-xs sm:text-sm font-medium">{ltKm} km</span>
    </div>

    <div className="flex-1 rounded-xl p-2 sm:p-3 flex flex-col items-center text-center
      bg-gradient-to-br from-neutral-800 to-black 
      border border-white/10 shadow-md">
      <span className="text-[11px] sm:text-[14px] text-gray-400 mb-1">Total trip</span>
      <span className="text-green-300 text-xs sm:text-sm font-medium">{totalKm} km</span>
    </div>

  </div>
</div>
</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 h-auto md:h-[530px]">
      {/* --- Graph (60%) --- */}
      <div className="md:col-span-3 w-full h-[450px] sm:h-[450px] md:h-[530px] lg:max-h-[530px]">
      <div
      className="relative w-full h-full rounded-3xl bg-black
          border border-[#FF9913] 
          backdrop-blur-xl overflow-hidden
          pb-0 sm:pb-3 md:pb-0 px-2 sm:px-3 md:px-4 hover:shadow-orange-500/20 transition"
      >
      {/* --- Toggle Button --- */}
      <button
      onClick={() => setShowMetrics(true)}
      className="absolute top-3 right-3 md:top-3 md:right-3 
            z-20 px-2 py-1 text-xs md:text-sm
            bg-[#0d0d0d] text-white border border-[#FF9913]/40 rounded-lg 
            shadow hover:text-[#FF9913] transition"
      >
      Select parameters ▼
      </button>

{!isLive && (
    <button
  onClick={() => {
    setIsLive(true); 

    const windowSize = WINDOW_SIZE; // 2 min window

    setVisibleRange({
      start: Math.max(0, fullData.length - windowSize),
      end: fullData.length,
    });
  }}
  className="absolute top-3 left-3 z-20 px-2 py-1 text-xs md:text-sm
  bg-black text-white border border-[#FF9913]/40 rounded-lg
  shadow hover:text-[#FF9913] transition"
>
  Go Live
</button>
)}



{/* <button
  onClick={() => {
    const step = 30;

    setVisibleRange((prev) => {
  let newStart = prev.start + shift;
  let newEnd = prev.end + shift;

  if (newStart < 0) {
    newStart = 0;
    newEnd = 120;
  }

  // ✅ ONLY here allow live
  if (newEnd >= fullData.length) {
    setIsLive(true);

    return {
      start: Math.max(0, fullData.length - 120),
      end: fullData.length,
    };
  }

  return { start: newStart, end: newEnd };
});

  }}
  className="absolute bottom-3 left-12 z-20 px-2 py-1 text-xs
  bg-black text-white border border-[#FF9913]/40 rounded-lg"
>
  ▶
</button> */}

            {/* --- Slide-out panel --- */}
      {showMetrics && (
        <>
          {/* 🔹 Backdrop (Covers only the chart card area) */}
          <div
            className="absolute inset-0 bg-black/50 z-40"
            onClick={() => setShowMetrics(false)}
          />

          {/* 🔹 Panel (Aligned to the right side inside the chart card border) */}
          <div
            className="absolute top-0 right-0 h-full w-64 sm:w-72 bg-black/95
                  border-l border-[#FF9913]/30 shadow-xl p-4 sm:p-5
                  z-50 flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- Header --- */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-Kanit text-white">
                Select parameters
              </h3>
              <button
                onClick={() => setShowMetrics(false)}
                className="text-gray-400 hover:text-[#FF9913]"
              >
                ✕
              </button>
            </div>

            {/* --- Scrollable options --- */}
            <div className="space-y-2 overflow-y-auto max-h-[70vh] pr-1 sm:pr-2">
              {metricOptions.map((opt) => (
                <label
                  key={opt.key}
                  htmlFor={opt.key}
                  className="flex items-center gap-2 text-xs sm:text-sm
                            text-white cursor-pointer hover:text-[#FF9913]
                            select-none"
                >
                  <input
                    id={opt.key}
                    type="checkbox"
                    checked={metricsSelected.includes(opt.key)}
                    onChange={() => handleMetricChange(opt.key)}
                    onClick={(e) => e.stopPropagation()}
                    className="accent-[#FF9913] cursor-pointer"
                    style={{
                      width: "18px",
                      height: "18px",
                      WebkitAppearance: "checkbox",
                      pointerEvents: "auto",
                    }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div
  className={`p-2 sm:p-3 md:p-2 relative z-10 h-full mt-8 sm:mt-8 md:mt-9 no-select ${
    showMetrics ? "pointer-events-none" : "pointer-events-auto"
  }`}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
>

      <ResponsiveContainer

      width="100%"
      height={window.innerWidth < 768 ? 400 : 460} 
      >
      <LineChart
      data={fullData.slice(visibleRange.start, visibleRange.end)}
      margin={{
      top: 10,
      right: 10,
      bottom: window.innerWidth < 768 ? 30 : 25, // ⬅️ add space for bottom label
      left: 0,
      }}
      >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="#33415540"
        vertical={false}
      />
      <XAxis
        dataKey="time"
        tick={{
          fill: "#ffffff",
          fontSize: window.innerWidth < 768 ? 9 : 11,
          // fontWeight: 500,
        }}
        tickLine={false}
        axisLine={{ stroke: "rgba(255, 254, 253, 1)" }}
        padding={{ left: 5, right: 5 }}
        interval="preserveStartEnd"
        tickFormatter={(value) => {
          const date = new Date(value);
          return `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        }}
        angle={window.innerWidth < 768 ? -30 : 0}
        textAnchor={window.innerWidth < 768 ? "end" : "middle"}
        height={window.innerWidth < 768 ? 40 : 30}
      />
      <YAxis
        tick={{
          fill: "#ffffff",
          fontSize: window.innerWidth < 768 ? 9 : 11,
        }}
        width={window.innerWidth < 768 ? 32 : 50}
        tickLine={false}
        axisLine={{ stroke: "#f5f2efff" }}
        domain={["auto", "auto"]}
      />
      <ReferenceLine
        y={0}
        stroke="#f7f2ebff"
        strokeDasharray="6 3"
        strokeWidth={1.2}
      />
      <Tooltip
        itemStyle={{ fontWeight: 500 }}
        contentStyle={{
          backgroundColor: "#000000",
          border: "1px solid #FF9913",
          borderRadius: "0.75rem",
          padding: "4px 8px",
          fontSize: window.innerWidth < 768 ? "10px" : "11px",
          boxShadow: "0 0 15px #FF991355",
        }}
        formatter={(value, name, props) => {
          const color = props.color || "#f1f5f9";
          return [
            <span style={{ color, fontWeight: 600 }}>{value}</span>,
            name,
          ];
        }}
        labelFormatter={(label, payload) => {
          if (payload && payload.length > 0) {
            const { tripkm, lat_long } = payload[0].payload;
            const date = new Date(label);

            const formatted =
              `${date.getFullYear()}:` +
              `${String(date.getMonth() + 1).padStart(2, "0")}:` +
              `${String(date.getDate()).padStart(2, "0")} ` +
              `${String(date.getHours()).padStart(2, "0")}:` +
              `${String(date.getMinutes()).padStart(2, "0")}:` +
              `${String(date.getSeconds()).padStart(2, "0")}`;


            if (Array.isArray(lat_long) && lat_long.length === 2) {
              setHoveredLatLong(`${lat_long[0].toFixed(5)}, ${lat_long[1].toFixed(5)}`);
            } else {
              setHoveredLatLong(null);
            }

            return (
              <div>
                <div>{formatted}</div>
                <div style={{ color: "#FFD700", fontWeight: "bold" }}>
                  Trip (km): {tripkm ?? "N/A"}
                </div>

                {Array.isArray(lat_long) && lat_long.length === 2 && (
                  <a
                    href={`https://www.google.com/maps?q=${lat_long[0]},${lat_long[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#00FFCC",
                      fontWeight: "bold",
                      textDecoration: "underline",
                      cursor: "pointer",
                      display: "inline-block",
                      marginTop: "4px",
                    }}
                  >
                    Lat/Long: {lat_long[0].toFixed(5)}, {lat_long[1].toFixed(5)}
                  </a>
                )}
              </div>
            );
          }
          return label;
        }}
      />
      <Legend
        wrapperStyle={{
          color: "#ffffff",
          fontSize: window.innerWidth < 768 ? 9 : 12,
          fontWeight: 600,
        }}
        iconType="circle"
      />
      {metricOptions
        .filter((opt) => metricsSelected.includes(opt.key))
        .map((opt) => (
          <Line
            key={opt.key}
            type="monotone"
            dataKey={opt.key}
            name={opt.label}
            stroke={opt.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        ))}

      {processedData?.length > 0 && (
      <text
      x="50%"
      y="100%"   // bottom of chart area
      dy={window.innerWidth < 768 ? -10 : -2} //  // adjust up/down if needed
      textAnchor="middle"
      fill="#f5f1efff"   // 🎨 custom color (orange)
      fontSize={window.innerWidth < 768 ? 11 : 12} // 🔹 font size
      fontFamily="Kanit, sans-serif"  // 🔹 custom font family
      // fontWeight="600"  // 🔹 bold text
      >
      {(() => {
      const startDate = new Date(processedData[0].time);
      const endDate = new Date(processedData[processedData.length - 1].time);
      // 👉 Format as DD-MM-YYYY
      const format = (d) =>
      `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
      ).padStart(2, "0")}-${d.getFullYear()}`;

      if (startDate.toDateString() === endDate.toDateString()) {
      return `Data of ${format(startDate)}`;
      } else {
      return `Data from ${format(startDate)} to ${format(endDate)}`;
      }
      })()}
      </text>
      )}
      </LineChart>
      </ResponsiveContainer>
      </div>

      </div>
      </div>

      {/* --- AH Values (40%) --- */}
      <div className="md:col-span-2 w-full h-auto md:h-[530px]">
      {/* 🔹 Big container */}
      <div
      className="bg-gradient-to-br from-[#1e293b] to-[#0f172a]  
        rounded-2xl shadow-md
        hover:border-orange-500 hover:shadow-orange-500/20 transition 
        shadow-lg w-full h-full flex flex-col p-4 
        border border-white/10"
      >

      {/* 🔹 AH Values + BMS Mosfet in one container */}
      <div className="flex flex-col flex-1 gap-5">


      {/* --- AH Values Section --- */}

      <div className="flex flex-col flex-1 bg-[#111] rounded-2xl p-3 shadow-md relative">
      {/* Top-left small AH card */}
      <div className="absolute top-1 right-1 bg-black rounded-xl px-1 py-1 border border-gray-800 
              shadow-md flex flex-col items-center justify-center">
      <p className="text-[10px] text-gray-400 tracking-wider">Remaining capacity(Ah)</p>
      <span className="text-sm font-Kanit text-orange-400">
      {latestData?.remainingcapacity_ah ?? "--"} 
      </span>
      </div>
      {/* Main AH bars */}
      <h4 className="text-white text-sm font-Kanit mb-3 mt-6">AH values</h4>
      <div className="flex justify-around items-end h-40 gap-6">
      {(() => {
      const latest = latestData ?? {};
      const bars = [
      { label: "In ah", value: latest?.inah ?? 0, color: "from-green-600 to-green-400", text: "text-green-400 text-bold"  },
      { label: "In ah by charger", value: latest?.inah_by_charger ?? 0, color: "from-yellow-500 to-yellow-300", text: "text-yellow-300" },
      { label: "In ah by regen", value: latest?.inah_by_regen ?? 0, color: "from-blue-500 to-blue-400", text: "text-blue-400" },
      { label: "Out ah", value: latest?.outah ?? 0, color: "from-red-600 to-red-500", text: "text-red-400" },
      ];

      const maxValue = 100;

      return bars.map((b, i) => (
      <div key={i} className="flex flex-col items-center justify-end h-full w-16">
      <span className={`mb-1 text-xs font-medium ${b.text}`}>
        {Number(b.value).toFixed(2)}
      </span>
      <div className="h-28 w-full bg-black rounded flex items-end overflow-hidden">
        <div
          className={`w-full bg-gradient-to-t ${b.color} transition-all duration-500`}
          style={{ height: `${Math.min((b.value / maxValue) * 100, 100)}%` }}
        />
      </div>
      <span className="mt-2 text-[12px] sm:text-[12px] md:text-[14px] text-gray-400 text-center whitespace-nowrap">
        {b.label}
      </span>
      </div>
      ));
      })()}
      </div>
      </div>


      {/* --- BMS Mosfet States Section --- */}
      <div className="flex-1 rounded-2xl p-3 shadow-md border-white/5">
      <h4 className="text-white text-sm font-Kanit mb-3">BMS mosfet state</h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      {(() => {
      const flags = (liveAllVinData?.bmsmosstates ?? "")
      .split(",")
      .map((v) => parseInt(v.trim(), 10));

      const states = [
      { label: "Main charge mosfet", value: flags[0], icon: BatteryCharging },
      { label: "Main discharge mosfet", value: flags[1], icon: Battery },
      { label: "APU charge mosfet", value: flags[2], icon: BatteryCharging },
      { label: "APU discharge mosfet", value: flags[3], icon: Battery },
      ];

      return states.map((s, i) => {
      const Icon = s.icon;
      const isOn = Boolean(s.value);

      return (
      <div
        key={i}
        className="flex flex-col items-center justify-center space-y-2 
                  p-3 md:p-3 rounded-2xl bg-black shadow-md 
                  transition-all h-38 md:h-48"
      >
        {/* Icon */}
        <div
          className={`p-3 md:p-4 rounded-full relative ${
            isOn ? "text-emerald-400" : "text-red-400"
          }`}
        >
          <Icon size={23} />
          <span className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent opacity-40 pointer-events-none"></span>
        </div>

        {/* Label */}
        <span className="text-[11px] md:text-sm font-medium text-white/80 text-center">
          {s.label}
        </span>

        {/* Status pill */}
        <span
          className={`relative px-4 py-1 text-xs md:text-sm font-Kanit rounded-full border overflow-hidden ${
            isOn
              ? "bg-gradient-to-r from-emerald-600/40 via-emerald-400/20 to-emerald-600/40 text-emerald-300 border-emerald-500/40"
              : "bg-gradient-to-r from-red-600/40 via-red-400/20 to-red-600/40 text-red-300 border-red-500/40"
          }`}
        >
          {isOn ? "ON" : "OFF"}
          <span className="absolute inset-0 bg-gradient-to-t from-white/15 to-transparent opacity-60 pointer-events-none"></span>
        </span>
      </div>
      );
      });
      })()}
      </div>
      </div>

      </div>
      </div>

      
      </div>
      </div>



      {/* 🔹 Dashboard Grid with 3 Cards  tierpressuer, ntc_tempretuer tempretuer*/}
      <div className="flex flex-wrap gap-4 mt-5 w-full">
      {/* 1️⃣ Scooter Status (make wider, span 2 columns) */}
     <div
      className="relative rounded-2xl p-3
      bg-gradient-to-br from-black via-neutral-950 to-neutral-900
      border border-white/10
      text-white shadow-lg
      transition-colors duration-300 hover:border-orange-500
      lg:col-span-2 w-full lg:w-[40%] h-[260px] sm:h-[300px] lg:h-[330px]"
      >
      <SectionTitle left="Tire pressure" className="mb-2" />
      {(() => {
      // 🔹 New status logic
      const checkStatus = (pressure) => {
      if (pressure == null) return { label: "Not found", color: "text-gray-400" };
      if (pressure < 27) return { label: "CRITICAL", color: "text-red-500" };
      if (pressure <= 38) return { label: "IDEAL", color: "text-green-500" };
      return { label: "HIGH", color: "text-red-500" };
      };

      const frontStatus = checkStatus(data1?.front?.pressure);
      const rearStatus = checkStatus(data1?.rear?.pressure);

     const getScooterImage = (front, rear) => {
  const NEUTRAL =
    "https://image2url.com/images/1758954856363-9a9268e8-c363-44c0-9170-420d1bf540dc.png";

  const BOTH_CRITICAL =
    "https://image2url.com/images/1758778399341-c5621768-6e2c-4024-81a0-6eb24045e51f.png";

  const FRONT_CRITICAL =
    "https://image2url.com/images/1758778590597-8c9da437-ba91-4d9c-b495-7ca487da7fa7.png";

  const REAR_CRITICAL =
    "https://image2url.com/images/1758778023587-e084f7b7-e49b-4c86-9483-a4122c69031e.png";

  // 🟦 both missing
  if (front.label === "Not found" && rear.label === "Not found") {
    return BOTH_CRITICAL;
  }

   if (front.label === "Not found" && rear.label === "CRITICAL") {
    return BOTH_CRITICAL;
  }


  if (front.label === "CRITICAL" && rear.label === "Not found") {
    return BOTH_CRITICAL;
  }

  // 🔴🔴 both critical
  if (front.label === "CRITICAL" && rear.label === "CRITICAL") {
    return BOTH_CRITICAL;
  }

  if (front.label === "HIGH" && rear.label === "HIGH") {
    return BOTH_CRITICAL;
  }

  if (
    (front.label === "HIGH" && rear.label === "CRITICAL") ||
    (front.label === "CRITICAL" && rear.label === "HIGH")
  ) {
    return BOTH_CRITICAL;
  }

  // 🔴 front critical
  if (front.label === "CRITICAL") {
    return FRONT_CRITICAL;
  }

  // 🔴 rear critical
  if (rear.label === "CRITICAL") {
    return REAR_CRITICAL;
  }

  // 🟢 default
  return NEUTRAL;
};

      const scooterImage = getScooterImage(frontStatus, rearStatus);

      return (
      <div className="relative flex items-center justify-center w-full flex-1 overflow-hidden py-2">
      {/* 🔹 Dynamic Scooter */}
      <img
      src={scooterImage}
      alt="Scooter"
   className="
  w-auto 
  max-w-[90%] 
  h-auto 
  max-h-[140px] sm:max-h-[160px] md:max-h-[180px] lg:max-h-[200px]
  object-contain 
  mx-auto
"
      />

      {/* Rear Tire Info */}
      <div className="absolute top-2 left-2 sm:left-4 bottom-[40%] sm:bottom-[45%] flex flex-col text-center">
      <p className="text-sm sm:text-[13px] md:text-sm text-gray-300">Rear</p>
      <p className="text-[11px] text-gray-300 mt-1 break-all">
          {details?.reartpmsid || "TPMS ID Not found"}
        </p>
      <p className={`font-Kanit text-[11px] sm:text-xs md:text-sm font-bold ${rearStatus.color}`}>
        {rearStatus.label}
      </p>
      <div className="bg-black/70 rounded-lg px-2 py-1 mt-1 text-[11px] sm:text-xs md:text-sm text-white min-w-[60px]">
        <p>{data1?.rear?.pressure ?? "--"} psi</p>      
        <p>{data1?.rear?.temp ?? "--"}°C</p>
         {/* TPMS ID */}
        {/* <p className="text-[9px] text-orange-400 mt-1 break-all">
          {details?.reartpmsid || "No TPMS"}
        </p> */}
      </div>
      </div>

      {/* Front Tire Info */}
      <div className="absolute top-2 right-3 sm:right-6 bottom-[40%] sm:bottom-[45%] flex flex-col text-center">
      <p className="text-sm sm:text-[18px] md:text-sm text-gray-300">Front</p>
      <p className="text-[11px] text-gray-300 mt-1 break-all">
            {details?.fronttpmsid || "TPMS ID Not found"}
          </p>
      <p className={`font-Kanit text-sm sm:text-[13px] md:text-sm font-bold ${frontStatus.color}`}>
        {frontStatus.label}
      </p>
      <div className="bg-black/70 rounded-lg px-1.5 py-1 mt-1 text-[10px] sm:text-xs md:text-sm text-white min-w-[55px]">
        <p>{data1?.front?.pressure ?? "--"} psi</p>
        <p>{data1?.front?.temp ?? "--"}°C</p>
            {/* TPMS ID */}
          {/* <p className="text-[9px] text-orange-400 mt-1 break-all">
            {details?.fronttpmsid || "No TPMS"}
          </p> */}

      </div>
      </div>
      </div>
      );
      })()}
      </div>

      {/* 2️⃣ Temperatures */}
        <div
    className="relative rounded-2xl p-4
    bg-gradient-to-br from-black via-neutral-950 to-neutral-900
    border border-white/10 text-white shadow-lg
    transition-all duration-500 hover:border-orange-500/40
    flex flex-col
    w-full lg:w-[30%] h-[330px]"
    >
          <SectionTitle left="Vehicle temperatures" />

      <div className="grid grid-cols-4 gap-3 mt-2 flex-1 p-2">
      {[
  { label: "Ctrl temp", value: latestData?.controllermostemp },
  { label: "Motor temp", value: latestData?.motortemp },
  { label: "BMS temp", value: latestData?.bmsmostemp },
  { label: "VCU temp", value: latestData?.vcutemp },

      ].map((t) => (
      <div key={t.label} className="flex justify-center items-center h-full">
      <ThermometerCard
      label={t.label}
      value={Number(t.value) || 0}
      min={0}
      max={120}
      gradient={["#32ed0d", "#e71414"]}
      className="h-full w-full"
      />
      </div>
      ))}
      </div>
      </div>



        <div className="relative rounded-2xl p-2 w-full sm:w-[105%] md:w-[27%]
      bg-gradient-to-br from-black via-neutral-950 to-neutral-900
      border border-white/10 
      text-white shadow-lg 
      transition-colors duration-300 hover:border-orange-500 p-5">

      <SectionTitle left="Battery pack temperatures" />

      <div className="flex-1 flex flex-col mt-4">
      {(() => {
      // ===============================
      // 1️⃣ Extract NTC values from long string
      // ===============================
   const extractNTC = (str) => {
  if (typeof str !== "string") return [];

  return str
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => !isNaN(v));
};

      const ntcArray = extractNTC(latestData?.ntc);
     if (ntcArray.length < 4) {
  return (
    <p className="mt-6 text-base text-center text-white/70">
      N/A
    </p>
  );
}

      const main = ntcArray.slice(0, 4);

      const apu = ntcArray.slice(4, 8);
      const apuAbsent =
      apu.length === 0 || apu.every(v => v === -40);


      const modelRaw = details?.model ?? "";
      const normalized = modelRaw.toLowerCase().replace(/\s+/g, "");

      let mainLabels = ["NTC1", "NTC2", "NTC3", "NTC4"];

      if (["nx100pro"].includes(normalized)) {
      mainLabels = [
      "Positive terminal",
      "Cell no 20",
      "Cell no 28",
      "Negative terminal",
      ];
      } else if (["nx100max"].includes(normalized)) {
      mainLabels = [
      "Positive terminal",
      "Cell no 20",
      "Cell no 50",
      "Negative terminal",
      ];
      } else if (["nx100classic"].includes(normalized)) {
      mainLabels = [
      "Positive terminal",
      " Cell no 07   ",
      " Cell no 16   ",
      "Negative terminal",
      ];
      }

      const getTempColor = (val) => {
      if (val <= 0) return "text-orange-300";
      if (val < 40) return "text-orange-400";
      if (val < 55) return "text-orange-500";
      return "text-red-500";
      };


      const renderNTCs = (list, labels) => (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {list.map((val, i) => (
      <div
      key={i}
      className="rounded-xl bg-black/40 backdrop-blur-md 
              border border-white/10 p-2 flex flex-col 
              items-center shadow-md transition"
      >
      <span className="text-[11px] text-gray-400 mb-1 text-center">
      {labels[i] || `NTC ${i + 1}`}
      </span>
      <span className={`text-lg font-Kanit ${getTempColor(val)}`}>
      {val}°C
      </span>
      </div>
      ))}
      </div>
      );

      return (
      <div className="grid grid-cols-1 gap-5">
      {/* Main Battery */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-2 shadow-lg">
      <p className="text-sm text-orange-400 font-Kanit mb-3 text-center">
      Main battery
      </p>
      {renderNTCs(main, mainLabels)}
      </div>

      {/* APU */}
      <div className="rounded-xl bg-black/40 border border-white/10 p-2 shadow-lg">
      <p className="text-sm text-orange-500 font-Kanit mb-3 text-center">
      APU
      </p>
      {apuAbsent ? (
      <p className="text-sm text-red-500 font-medium text-center">
      APU not installed
      </p>
      ) : (
      renderNTCs(apu, mainLabels)
      )}
      </div>
      </div>
      );
      })()}
      </div>

      </div>
      </div>


      <div className="batter-card">
      <TelemetryDashboardCell
      ntc={latestNtc}
      rawLiveData = {rawLiveData}
      latestData={latestData}
      vin={vin}
      />

      </div>
      </>
      )}

    <div className={activePage === "graph" ? "block" : "hidden"}>
      
      <div>
     <div className="mt-3">
      <Svg>
      <div className="mt-3">
      <h2 className="text-base font-Kanit tracking-wider text-[#FF9913] mb-3 border-b border-[#FF9913]/30 pb-1">
      Select data and time to view historical data : <span className="text-white">{vin}</span>
      </h2>
      <div className="flex flex-col gap-2 md:flex-row">

      {/* Start Date */}
      <div className="relative w-full">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-white" />
      <input
        type="datetime-local"
        value={startDateTime}
        onChange={(e) => handleStartChange(e.target.value)}
        className="w-full rounded-xl border border-[#FF9913]/30 bg-black pl-10 pr-3 py-2 text-sm text-white outline-none
                  hover:border-[#FF9913]/60 focus:border-[#FF9913]/90 focus:shadow-[0_0_12px_2px_rgba(255,153,19,0.4)] transition"
      />
      </div>

      {/* End Date */}
      <div className="relative w-full">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-white" />
      <input
        type="datetime-local"
        value={endDateTime}
        onChange={(e) => handleEndChange(e.target.value)}
        className="w-full rounded-xl border border-[#FF9913]/30 bg-black pl-10 pr-3 py-2 text-sm text-white outline-none
                  hover:border-[#FF9913]/60 focus:border-[#FF9913]/90 focus:shadow-[0_0_12px_2px_rgba(255,153,19,0.4)] transition"
      />
      </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-3">
      <button
      onClick={fetchHistoricalData}
      disabled={loading}
      className={
      `relative overflow-hidden rounded-xl px-6 py-2.5 text-sm font-Kanit text-black shadow-lg transition-all duration-300 ease-in-out ` +
      (loading
      ? "opacity-50 cursor-not-allowed"
      : "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(245,166,35,0.6)]"
      )
      }
      >
      {/* Glossy shine overlay */}
      <span className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-30"></span>
      <span className="relative z-10">{loading ? "Loading..." : "Load history"}</span>
      </button>
      {!autoMode && (
      <button
      onClick={resetToAuto}
      className="relative overflow-hidden rounded-xl px-6 py-2.5 text-sm font-Kanit 
            text-black shadow-lg transition-all duration-300 ease-in-out
            bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500
            hover:scale-105 hover:shadow-[0_0_20px_rgba(245,166,35,0.6)]"
      >
      {/* Glossy shine overlay */}
      <span className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-30"></span>
      <span className="relative z-10">Set default time</span>
      </button>
      )}
      </div>
      </div>
      </Svg>

      {showHistoryChart && (
      <div
        ref={chartRef}
        className="relative mt-3 h-[500px] rounded-3xl bg-black
                      border border-[#FF9913]/30 shadow-[0_0_25px_rgba(255,153,19,0.3)]
                      backdrop-blur-xl overflow-hidden"
      >

      {/* --- Loading Overlay --- */}
{loading && (
  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#FF9913] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-white text-sm font-Kanit">
        Loading data...
      </span>
    </div>
  </div>
)}

{/* --- No Data State --- */}
{!loading && historyData.length === 0 && (
  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <span className="text-white text-sm font-Kanit">
      No data found for selected range
    </span>
  </div>
)}
        {/* --- Glow Background --- */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#FF991322,transparent_60%),
                                            radial-gradient(circle_at_bottom_right,#FF991322,transparent_60%)] animate-pulse"></div>
        {/* --- 📱 Mobile: Dropdown --- */}
        <div className="md:hidden p-3 relative z-20">
          <div
            onClick={() => setShowMetrics1(!showMetrics1)}
            className="w-full flex items-center justify-between px-3 py-2 
                      bg-black text-white rounded-lg shadow-md 
                      border border-[#FF9913]/30 text-sm font-medium cursor-pointer"
          >
            Select parameters to be shown on graph.
            <span>{showMetrics1 ? "▲" : "▼"}</span>
          </div>

          {showMetrics1 && (
            <div className="mt-2 bg-black border border-[#FF9913]/30 
                            rounded-xl p-3 space-y-2 shadow-lg max-h-60 overflow-y-auto overflow-y-auto">
              {metricOptions1.map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center gap-2 text-sm text-white cursor-pointer hover:text-[#FF9913] transition"
                >
                <input
  id={opt.key}
  type="checkbox"
  checked={metricsSelected1.includes(opt.key)}
  onChange={() => handleMetricChange1(opt.key)}
  onClick={(e) => e.stopPropagation()}
  className="accent-[#FF9913] cursor-pointer"
  style={{
    width: "18px",
    height: "18px",
    WebkitAppearance: "checkbox",
    pointerEvents: "auto",
  }}
/>
                  {opt.label}
                </label>
              ))}
            </div>
          )}
        </div>
        {/* --- Main Layout --- */}
        <div className="grid md:grid-cols-[1fr_220px] h-full relative z-10">
          {/* --- Chart --- */}
          <div className="p-4 mt-6 md:mt-0">
            <ReactECharts
             ref={echartsRef}
              onEvents={onChartEvents}
              option={chartOptions}
              style={{
                width: "100%",
                height: window.innerWidth < 768 ? 360 : 420,
              }}
            />
        </div>
       
        <div className="hidden md:flex border-l border-[#FF9913]/20 bg-black backdrop-blur-md p-4 flex-col h-[500px]">
      <h3 className="text-sm font-Kanit text-white mb-4 tracking-wide border-b border-[#FF9913]/30 pb-1">
        Select parameters to be shown on graph.
      </h3>
      <div className="flex flex-col gap-2 overflow-y-auto pr-2">
            {metricOptions1.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2 text-sm text-white cursor-pointer hover:text-[#FF9913] transition"
              >
              <input
              id={opt.key}
              type="checkbox"
              checked={metricsSelected1.includes(opt.key)}
              onChange={() => handleMetricChange1(opt.key)}
              onClick={(e) => e.stopPropagation()}
              className="accent-[#FF9913] cursor-pointer"
              style={{
                width: "18px",
                height: "18px",
                WebkitAppearance: "checkbox",
                pointerEvents: "auto",
              }}
            />
              {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowHistoryChart(false)}
        className="absolute bottom-6 right-8 z-20 px-5 py-2
                  bg-[#F61111] hover:bg-[#FF4500] 
                  text-white text-sm font-Kanit 
                  rounded-lg shadow-md border border-[#F61111]
                  backdrop-blur-sm
                  transition-all duration-300 ease-in-out
                  hover:scale-105"
      >
        Close
      </button>
      </div>
      )}
      </div>
      </div>
     

     </div> 

      {activePage === "world" && (
      <>  
      <Worlelc vin={vin} liveData={latestData}/>
      </>
      )} 

      {activePage === "table" && (
      <>  
      <Tabledata vin={vin}/> 
      </>
      )}
      
      {activePage === "tickets" && (
      <>  
      <TicketUi/>
      </>
      )}

      {activePage === "commad" && (
      <>  
      <SendCommand vin={vin} 
      lastUpdated={lastUpdated} 
      location={locationData} 
      ownerName={details?.ownerName || details?.ownername}
      phoneNumber={details?.phoneNumber || details?.phonenumber}/>
      </>
      )}

      {activePage === "mapinvechical" && (
        <Mapinvehical
        onVehicleSelect={(clickedVin) => {
        setVin(clickedVin);          
        setSearchValue(clickedVin);  
        setActivePage("home");   
      }}
   />
      )}

      {activePage === "nxdata" && (
      <>  
       <Nxdetails
         vinList={vinList}
         onVehicleSelect={(clickedVin) => {
           setVin(clickedVin);          
           setSearchValue(clickedVin);  
           setActivePage("home");   
         }}
       />
      </>
      )}
      </main>             
      </div>
      </div>      
      </div>       
      )
      ;}