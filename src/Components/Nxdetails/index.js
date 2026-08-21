import React, { useEffect, useRef, useState } from "react";
import { LineChart, Line, Area, YAxis, ResponsiveContainer } from "recharts";
import { Bike, Gauge, Route } from "lucide-react";

const BikekIcon = ({ className = "w-[26px] h-[26px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 13l2-6.5A2 2 0 0 1 6.9 5.1h10.2A2 2 0 0 1 19 6.5L21 13" />
    <path d="M2 13h20v3.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V16H5v.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V13z" />
    <circle cx="7.5" cy="16.5" r="1" />
    <circle cx="16.5" cy="16.5" r="1" />
  </svg>
);

const CheckIcon = ({ className = "w-[26px] h-[26px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const WarningIcon = ({ className = "w-[26px] h-[26px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const CriticalIcon = ({ className = "w-[26px] h-[26px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 8.5L2.5 16.5a2 2 0 0 0 1.2 3.5h16.6a2 2 0 0 0 1.2-3.5L12 8.5z" />
    <path d="M12 12v3" />
    <path d="M12 18h.01" />
  </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const SpeedometerIcon = ({ className = "w-[26px] h-[26px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 21a9 9 0 1 1 9-9" />
    <path d="M12 12l6-4" />
    <path d="M12 12a2 2 0 1 0 2 2" />
    <path d="M3 21h18" />
  </svg>
);

const CopyIcon = ({ className = "w-[12px] h-[12px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

const ClockIcon = ({ className = "w-[22px] h-[22px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const CalendarIcon = ({ className = "w-[22px] h-[22px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M3 10h18" />
  </svg>
);

const MapPinIcon = ({ className = "w-[15px] h-[15px]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const hexToRgba = (hex, alpha) => {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// Battery-shaped indicator whose fill represents the SOC (presentation only).
const BatteryShape = ({ percent, color }) => {
  const fillPct = Math.max(4, Math.min(100, percent || 0));
  return (
    <div className="inline-flex items-center min-w-0">
      <div
        className="relative w-[clamp(42px,15vw,54px)] h-[clamp(13px,3.5vw,17px)] md:w-[88px] md:h-[20px] max-w-full rounded-[4px]"
        style={{ border: `1.5px solid ${color}`, background: "#0B0B0B" }}
      >
        <div
          className="absolute left-[1.5px] top-[1.5px] bottom-[1.5px] rounded-[2px]"
          style={{ width: `calc(${fillPct}% - 3px)`, background: color }}
        />
      </div>
      <div
        className="w-[2px] h-[9px] shrink-0 rounded-r-[2px]"
        style={{ background: "#FF9500" }}
      />
    </div>
  );
};
const UsageSparkline = ({ data, id = "usage-spark-fill" }) => {
  const points = (Array.isArray(data) ? data : [])
    .map((v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    })
    .filter((v) => v !== null);

  if (points.length < 3) return null;

  const chartData = points.map((value, index) => ({ index, value }));
  const maxVal = points.reduce((max, v) => Math.max(max, v), 0);
  const gradientId = `${id}-fill`;

  return (
    <ResponsiveContainer width="100%" height={34}>
      <LineChart
        data={chartData}
        margin={{ top: 3, right: 0, bottom: 3, left: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff9800" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ff9800" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={[0, Math.max(maxVal, 1)]} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#ff9800"
          strokeWidth={1.5}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};


const USAGE_HISTORY_WINDOWS_MS = [
  12 * 60 * 60 * 1000, // 12 hours (worst that the endpoint reliably serves)
  6 * 60 * 60 * 1000, //  6 hours
  3 * 60 * 60 * 1000, //  3 hours
  60 * 60 * 1000, //  1 hour
];
const USAGE_HISTORY_BUCKETS = 24; // 24 points across the accepted window

const buildUsageHistorySeries = (
  records,
  windowMs = USAGE_HISTORY_WINDOWS_MS[0],
  buckets = USAGE_HISTORY_BUCKETS
) => {
  const flat = new Array(buckets).fill(0);

  if (!Array.isArray(records) || records.length < 3) return flat;

  const points = [];
  for (const r of records) {
    const t = Date.parse(String(r && r.time).trim().replace(" ", "T") + "Z");
    const trip = Number(r && r.tripkm);
    if (Number.isFinite(t) && Number.isFinite(trip))
      points.push({ t, trip });
  }
  if (points.length < 3) return flat;

  points.sort((a, b) => a.t - b.t);

  const start = points[0].t;
  const end = points[points.length - 1].t;
  const spanMs = Math.max(end - start, 1);
  const series = new Array(buckets).fill(0);

  for (let i = 1; i < points.length; i++) {
    const delta = points[i].trip - points[i - 1].trip;
    if (!Number.isFinite(delta) || delta <= 0) continue; // clamp trip resets
    const midT = (points[i - 1].t + points[i].t) / 2;
    let idx = Math.floor(((midT - start) / spanMs) * buckets);
    idx = Math.max(0, Math.min(buckets - 1, idx));
    series[idx] += delta;
  }

  const total = series.reduce((sum, v) => sum + v, 0);
  if (!(total > 0)) return flat;

  return series;
};

// -----------------------------------------------------------------------------
// Voltage status rules:
//   < 70 V        -> CRITICAL (red)
//   70 to < 72 V  -> WARNING  (orange)
//   >= 72 V       -> NORMAL   (green)
// -----------------------------------------------------------------------------
const STATUS_DOT_COLOR = {
  normal: "#22C55E",
  warning: "#FF9500",
  critical: "#EF4444",
};

const STATUS_BORDER_STYLE = {
  normal: "3px solid rgba(34, 197, 94, 0.45)",
  warning: "3px solid rgba(255, 149, 0, 0.45)",
  critical: "3px solid rgba(239, 68, 68, 0.45)",
  none: "3px solid rgba(107, 114, 128, 0.30)",
};

// One shared desktop column layout for the vehicle table header AND every
// vehicle row, so header labels and column separators always line up exactly.
// (Used verbatim by both the header grid and each row grid.)
const VEHICLE_GRID_COLUMNS = "lg:grid-cols-[22%_13%_19%_14%_22%_10%]";

const Nxdetails = ({ onVehicleSelect }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("");

  const [usageHistory, setUsageHistory] = useState({});
  const usageHistoryFetched = useRef({});
  const usageHistoryInFlight = useRef({});

  
  const knownOrder = [
    "ME9NP1411G3172002",
    "ME9NP1411G3172001",
    "ME9NP1411F3172002",
    "ME9NP1411F3172001",
    "ME9NP1411H2172001",
  ];

 
  const [extraVehicles, setExtraVehicles] = useState([]);

  
  const fetchVehicles = async () => {
    try {
      const response = await fetch(
        "https://commandcenter.rivotmotors.com/lastdetailednx.php"
      );

      const result = await response.json();
      
      if (result.status === "success") {
        // ---- keep only wellâ€‘formed VINs ------------------------------------
        const fetchedVehicles = result.data.filter(
          (v) => String(v.vinnumber || "").trim().length === 17
        );

        // ---- split into known & unknown ------------------------------------
        const knownVehicles = knownOrder
          .map((vin) => fetchedVehicles.find((v) => v.vinnumber === vin))
          .filter(Boolean); // removes any that are not present in this fetch

        const unknownVehicles = fetchedVehicles.filter(
          (v) => !knownOrder.includes(v.vinnumber)
        );
        setExtraVehicles((prev) => {
          const newOnes = unknownVehicles.filter(
            (u) => !prev.some((p) => p.vinnumber === u.vinnumber)
          );
          // prepend the newest discoveries
          return [...newOnes, ...prev];
        });

        const combinedExtra = [
          ...unknownVehicles.filter(
            (u) => !extraVehicles.some((p) => p.vinnumber === u.vinnumber)
          ),
          ...extraVehicles,
        ];

        const finalVehicles = [...combinedExtra, ...knownVehicles];

        setVehicles(finalVehicles);
      }
    } catch (err) {
      console.error("Error fetching vehicle details:", err);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchVehicles();

    const interval = setInterval(fetchVehicles, 15000);

    return () => clearInterval(interval);
  }, []);

 
  const getLocationData = (location) => {
    if (!location) return null;

    const [lat, lng] = location.split(",").map((n) => parseFloat(n.trim()));

    if (isNaN(lat) || isNaN(lng)) return null;

    return {
      lat,
      lng,
      mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
    };
  };

  
  const parseDistanceData = (data) => {
    const result = { today: null, lastDay: null };

    if (data === null || data === undefined) return result;

    const dataString = String(data).trim();

    if (!dataString) return result;

    const pairs = dataString.split(";");

    for (const pair of pairs) {
      if (!pair) continue;

      const eqIndex = pair.indexOf("=");

      if (eqIndex < 0) continue;

      const key = pair.slice(0, eqIndex).trim().toLowerCase();
      const rawValue = pair.slice(eqIndex + 1);

      if (!key || rawValue === undefined || rawValue === null) continue;

      if (String(rawValue).trim() === "") continue;

      const value = parseFloat(String(rawValue));

      if (key === "daykm") result.today = isNaN(value) ? null : value;
      else if (key === "lastdaykm")
        result.lastDay = isNaN(value) ? null : value;
    }

    return result;
  };

  // -------------------------------------------------------------------------
  // Helper: format a distance value, missing data shows "-", zero shows 0.0 km
  // -------------------------------------------------------------------------
  const formatKm = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const num = Number(value);
    if (isNaN(num)) return "-";
    return `${num.toFixed(1)} km`;
  };

  
  const getVoltageStatus = (voltage) => {
    if (voltage === null || voltage === undefined || voltage === "") {
      return "none";
    }
    const v = Number(voltage);
    if (isNaN(v)) return "none";
    if (v < 70) return "critical";
    if (v < 72) return "warning";
    return "normal";
  };

  const getVoltageColor = (voltage) => {
    switch (getVoltageStatus(voltage)) {
      case "critical":
        return "#EF4444";
      case "warning":
        return "#FF9500";
      case "normal":
        return "#22C55E";
      default:
        return "#9CA3AF";
    }
  };

  // -------------------------------------------------------------------------
  // Helpers: owner name comparison (case-insensitive, stable)
  // -------------------------------------------------------------------------
  const getSortName = (ownerName) => {
    if (ownerName === null || ownerName === undefined) return "unknown_owner";
    const name = String(ownerName).trim().toLowerCase();
    return name || "unknown_owner";
  };

 
  const formatUptime = (value) => {
    if (!value) return "-";
    const str = String(value).trim();
    if (!str) return "-";
    const daysMatch = str.match(/^(\d+)d/);
    const timeMatch = str.match(/(\d{1,2}):(\d{2})/);
    const days = daysMatch ? parseInt(daysMatch[1], 10) : 0;
    const hours = timeMatch ? parseInt(timeMatch[1], 10) : 0;
    const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const totalHours = days * 24 + hours;
    if (totalHours <= 0 && minutes <= 0) return "0m";
    if (totalHours <= 0) return `${minutes}m`;
    return `${totalHours}h ${minutes}m`;
  };

 
  const formatLastUpdatedTime = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    const parts = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).formatToParts(d);
    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    return `${get("hour")}:${get("minute")} ${get("dayPeriod")}`;
  };

  
  const formatLastUpdatedDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    const parts = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).formatToParts(d);
    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    return `${get("day")}/${get("month")}/${get("year")}`;
  };

  
  const formatRegen = (value) => {
    if (!value) return "-";
    const str = String(value).trim();
    if (!str) return "-";
    const last = str.split(",").pop();
    const n = Number(last);
    if (isNaN(n)) return "-";
    return `${n.toFixed(1)} km`;
  };

  const getVoltageNumber = (v) => {
    const n = Number(v.batvoltage);
    return Number.isFinite(n) ? n : null;
  };

  const getOdometerNumber = (v) => {
    const n = Number(v.odometer);
    return Number.isFinite(n) ? n : null;
  };

  const sortVehicles = (list, option) => {
    if (option === "name-az")
      return [...list].sort((a, b) =>
        getSortName(a.ownername).localeCompare(getSortName(b.ownername))
      );
    if (option === "name-za")
      return [...list].sort((a, b) =>
        getSortName(b.ownername).localeCompare(getSortName(a.ownername))
      );
    if (option === "voltage-low")
      return [...list].sort((a, b) => {
        const va = getVoltageNumber(a);
        const vb = getVoltageNumber(b);
        if (va !== null && vb !== null) return va - vb;
        if (va !== null) return -1;
        if (vb !== null) return 1;
        return 0;
      });
    if (option === "voltage-high")
      return [...list].sort((a, b) => {
        const va = getVoltageNumber(a);
        const vb = getVoltageNumber(b);
        if (va !== null && vb !== null) return vb - va;
        if (va !== null) return -1;
        if (vb !== null) return 1;
        return 0;
      });
    if (option === "odometer-low")
      return [...list].sort((a, b) => {
        const va = getOdometerNumber(a);
        const vb = getOdometerNumber(b);
        if (va !== null && vb !== null) return va - vb;
        if (va !== null) return -1;
        if (vb !== null) return 1;
        return 0;
      });
    if (option === "odometer-high")
      return [...list].sort((a, b) => {
        const va = getOdometerNumber(a);
        const vb = getOdometerNumber(b);
        if (va !== null && vb !== null) return vb - va;
        if (va !== null) return -1;
        if (vb !== null) return 1;
        return 0;
      });
    return list;
  };

  const buildVehicleView = (vehicle) => {
    const { today, lastDay } = parseDistanceData(vehicle.data);
    const status = getVoltageStatus(vehicle.batvoltage);
    const voltageColor = getVoltageColor(vehicle.batvoltage);
    const socNumber = Number(vehicle.soc);
    const hasSoc =
      vehicle.soc !== null &&
      vehicle.soc !== undefined &&
      String(vehicle.soc).trim() !== "" &&
      !isNaN(socNumber);
    const socDisplay = hasSoc ? socNumber.toFixed(1) : "-";
    const socPercent = hasSoc ? Math.max(0, Math.min(100, socNumber)) : 0;
    const voltageDisplay =
      vehicle.batvoltage !== null &&
      vehicle.batvoltage !== undefined &&
      vehicle.batvoltage !== ""
        ? `${Number(vehicle.batvoltage).toFixed(1)} V`
        : "-";
    const locationData = getLocationData(vehicle.location);
    const hasVoltage =
      vehicle.batvoltage !== null &&
      vehicle.batvoltage !== undefined &&
      vehicle.batvoltage !== "";

    return {
      today,
      lastDay,
      status,
      voltageColor,
      socDisplay,
      socPercent,
      hasSoc,
      voltageDisplay,
      hasVoltage,
      locationData,
    };
  };

  const locatorSearch = searchTerm.trim().toLowerCase();

  // Total Odometer: summed over the FULL fetched vehicle list (already
  // restricted to exactly-17-character VINs in the API handler), so the
  // current search/status filter never affects it. Length check kept for safety.
  // -----------------------------------------------------------------------
  const totalOdometer = vehicles.reduce((sum, vehicle) => {
    const vin = String(vehicle.vinnumber || "").trim();

    if (vin.length !== 17) return sum;

    const odo = Number(vehicle.odometer);

    if (!Number.isFinite(odo)) return sum;

    return sum + odo;
  }, 0);

  const totalOdometerDisplay = `${Math.trunc(totalOdometer).toLocaleString(
    "en-IN"
  )} km`;

  // Status counts for the Normal / Warning / Critical / Offline cards
  // -----------------------------------------------------------------------
  const statusCounts = vehicles.reduce(
    (acc, v) => {
      const s = getVoltageStatus(v.batvoltage);
      acc.total += 1;
      if (s === "normal") acc.normal += 1;
      else if (s === "warning") acc.warning += 1;
      else if (s === "critical") acc.critical += 1;
      else acc.offline += 1;
      return acc;
    },
    { total: 0, normal: 0, warning: 0, critical: 0, offline: 0 }
  );

  // Flow: API -> VIN filtering -> knownOrder/extra ordering -> status filter
  //       -> search filter -> sort -> display
  // -----------------------------------------------------------------------
  const statusFilteredVehicles =
    statusFilter === "all"
      ? vehicles
      : vehicles.filter(
          (v) => getVoltageStatus(v.batvoltage) === statusFilter
        );

  const selectedVIN = selectedVehicle
    ? String(selectedVehicle.vinnumber)
    : null;

  const displayedVehicles = sortVehicles(
    statusFilteredVehicles.filter((vehicle) => {
      // When a suggestion has been selected, show exactly that vehicle.
      if (selectedVIN) {
        return String(vehicle.vinnumber) === selectedVIN;
      }
      if (!locatorSearch) return true;
      return (
        String(vehicle.vinnumber || "").toLowerCase().includes(locatorSearch) ||
        String(vehicle.ownername || "").toLowerCase().includes(locatorSearch)
      );
    }),
    sortOption
  );

  // -------------------------------------------------------------------------
  // Fetch REAL historical usage (km) series per vehicle (one request per VIN,
  // cached) so the compact sparkline in the Usage column plots honest data.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (loading) return;

    const candidates = displayedVehicles.filter(
      (v) =>
        String(v.vinnumber || "").trim().length === 17 &&
        !usageHistoryFetched.current[v.vinnumber] &&
        !usageHistoryInFlight.current[v.vinnumber]
    );
    if (candidates.length === 0) return;

    const toUTC = (d) =>
      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

    // Try progressively smaller windows; the endpoint 500s on oversized
    // ranges for busy vehicles. Always resolves to a series (flat zeros when
    // nothing usable), so the sparkline can never silently disappear.
    const fetchSeriesForVin = async (vin, now) => {
      for (const windowMs of USAGE_HISTORY_WINDOWS_MS) {
        const start = new Date(now.getTime() - windowMs);
        const url = `https://commandcenter.rivotmotors.com/backtimedatfetch.php?vin=${encodeURIComponent(
          vin
        )}&start=${encodeURIComponent(toUTC(start))}&end=${encodeURIComponent(
          toUTC(now)
        )}`;
        try {
          const res = await fetch(url);
          if (!res.ok) continue; // server rejected this range -> try smaller
          const json = await res.json();
          const data = json && Array.isArray(json.data) ? json.data : [];
          return buildUsageHistorySeries(data, windowMs);
        } catch {
          continue; // network/server hiccup -> try a smaller range
        }
      }
      return new Array(USAGE_HISTORY_BUCKETS).fill(0);
    };

    candidates.forEach((vehicle) => {
      const vin = String(vehicle.vinnumber);
      usageHistoryInFlight.current[vin] = true;
      const now = new Date();

      fetchSeriesForVin(vin, now)
        .then((series) => {
          setUsageHistory((prev) => ({ ...prev, [vin]: series }));
        })
        .catch(() => {})
        .finally(() => {
          usageHistoryFetched.current[vin] = true;
          usageHistoryInFlight.current[vin] = false;
        });
    });
  }, [displayedVehicles, loading]);

  // Autocomplete suggestions (only once the user types >= 2 characters)
  // -----------------------------------------------------------------------
  const query = searchInput.trim().toLowerCase();

  const suggestionList =
    query.length >= 2
      ? vehicles
          .filter(
            (v) =>
              String(v.vinnumber || "").toLowerCase().includes(query) ||
              String(v.ownername || "").toLowerCase().includes(query)
          )
          .slice(0, 8)
      : [];

  const applySuggestion = (vehicle) => {
    const q = searchInput.trim().toLowerCase();
    const ownerName = String(vehicle.ownername || "");
    const display =
      q && ownerName.toLowerCase().includes(q)
        ? ownerName
        : String(vehicle.vinnumber);

    setSelectedVehicle(vehicle);
    setSearchInput(display);
    setSearchTerm(vehicle.vinnumber);
    setShowSuggestions(false);
    setHighlightedIndex(0);
  };

  // -------------------------------------------------------------------------
  // Percentage helper + filter chips + summary card configuration
  // -------------------------------------------------------------------------
  const pcntOfTotal = (value) =>
    statusCounts.total > 0
      ? `${((value / statusCounts.total) * 100).toFixed(1)}%`
      : "0.0%";

  const roundPct = (value) => pcntOfTotal(value).replace(/\.0%$/, "%");

  const filterOptions = [
    { key: "all", label: "All", color: null, count: vehicles.length },
    { key: "normal", label: "Normal", color: "#22C55E", count: statusCounts.normal },
    { key: "warning", label: "Warning", color: "#FF9500", count: statusCounts.warning },
    { key: "critical", label: "Critical", color: "#EF4444", count: statusCounts.critical },
    // { key: "none", label: "Offline", color: "#6B7280", count: statusCounts.offline },
  ];

  const summaryCards = [
    {
      key: "total",
      status: null,
      label: "Total vehicles",
      value: vehicles.length,
      // secondary: "All vehicles",
      secondaryColor: "#929292",
      icon: <Bike className="w-[clamp(18px,5vw,22px)] h-[clamp(18px,5vw,22px)] md:w-6 md:h-6" />,
      accent: "#FF9500",
      valueClass: "text-white",
    },
    {
      key: "odometer",
      status: null,
      label: "Total odometer",
      value: totalOdometerDisplay,
      // secondary: "Combined",
      secondaryColor: "#929292",
      icon: <SpeedometerIcon className="w-[clamp(22px,6.5vw,32px)] h-[clamp(22px,6.5vw,32px)] md:w-[26px] md:h-[26px]" />,
      accent: "#FF9500",
      valueClass: "text-white",
    },
    {
      key: "normal",
      status: "normal",
      label: "Normal",
      value: statusCounts.normal,
      // secondary: roundPct(statusCounts.normal),
      // secondaryColor: "#22C55E",
      icon: <CheckIcon className="w-[clamp(22px,6.5vw,32px)] h-[clamp(22px,6.5vw,32px)] md:w-[26px] md:h-[26px]" />,
      accent: "#22C55E",
      valueClass: "text-[#22C55E]",
    },
    {
      key: "warning",
      status: "warning",
      label: "Warning",
      value: statusCounts.warning,
      // secondary: roundPct(statusCounts.warning),
      secondaryColor: "#FF9500",
      icon: <WarningIcon className="w-[clamp(22px,6.5vw,32px)] h-[clamp(22px,6.5vw,32px)] md:w-[26px] md:h-[26px]" />,
      accent: "#FF9500",
      valueClass: "text-[#FF9500]",
    },
    {
      key: "critical",
      status: "critical",
      label: "Critical",
      value: statusCounts.critical,
      // secondary: roundPct(statusCounts.critical),
      secondaryColor: "#EF4444",
      icon: <CriticalIcon className="w-[clamp(22px,6.5vw,32px)] h-[clamp(22px,6.5vw,32px)] md:w-[26px] md:h-[26px]" />,
      accent: "#EF4444",
      valueClass: "text-[#EF4444]",
    },
  ];

  return (
    <div className="w-full max-w-[1650px] mx-auto px-[clamp(4px,1.5vw,10px)] lg:px-[20px] bg-transparent h-[calc(100vh-8.25rem)] sm:h-[calc(100vh-6.75rem)] flex flex-col overflow-hidden text-white">
  
      <div className=" mt-[clamp(8px,3vw,14px)] lg:mt-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[clamp(3px,1.5vw,9px)] md:gap-2 lg:gap-3.5 shrink-0">
        {summaryCards.map((card) => {
          const isActive = card.status !== null && statusFilter === card.status;
          return (
            <div
              key={card.key}
              className={card.key === "critical" ? "col-span-2 md:col-span-1" : ""}
              onClick={
                card.status
                  ? () =>
                      setStatusFilter(
                        statusFilter === card.status ? "all" : card.status
                      )
                  : undefined
              }
              className={`${card.key === "critical" ? "col-span-2 md:col-span-1" : ""} bg-[#0D0D0D] rounded-[14px] min-w-0 overflow-hidden h-[clamp(14px,16vw,48px)] md:h-[118px] lg:h-[130px] p-[clamp(8px,2.2vw,10px)] md:p-1 lg:p-[18px] flex items-center ${
              card.status ? "cursor-pointer transition-colors" : ""
            }`}
              style={{
                border: `1px solid ${hexToRgba(card.accent, 0.35)}`,
                boxShadow: isActive
                  ? `0 0 0 1px ${hexToRgba(card.accent, 0.15)}, 0 0 22px ${hexToRgba(
                      card.accent,
                      0.08
                    )}`
                  : "none",
              }}>
              <div
                className="w-[clamp(30px,4vw,30px)] h-[clamp(30px,4vw,30px)] md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-[12px] flex items-center justify-center shrink-0"
                style={{
                  color: card.accent,
                  background: hexToRgba(card.accent, 0.10),
                  border: `1px solid ${hexToRgba(card.accent, 0.40)}`,
                }}
              >
                {card.icon}
              </div>
              <div className="flex flex-col min-w-0 ml-[clamp(3px,1.4vw,8px)] md:ml-3.5 lg:ml-[18px]">
                <div className="text-[clamp(10px,2.9vw,12px)] md:text-[13px] text-[#9CA3AF] font-normal leading-tight md:leading-none whitespace-normal md:whitespace-nowrap">
                  {card.label}
                </div>
                <div
                  className={`font-Kanit text-[clamp(12px,2.5vw,15px)] md:text-[20px] lg:text-[24px] leading-none mt-1.5 lg:mt-2.5 whitespace-nowrap truncate ${card.valueClass}`}
                >
                  {card.value}
                </div>
                <div
                  className="text-[clamp(11px,3vw,13px)] md:text-[12px] font-normal leading-none mt-1 truncate"
                  style={{ color: card.secondaryColor }}
                >
                  {card.secondary}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 lg:mt-3 flex flex-wrap items-center gap-[clamp(8px,2.6vw,12px)] md:gap-2.5 lg:gap-4 shrink-0 mb-1 lg:mb-2">
        <div className="order-2 lg:order-1 relative w-full lg:w-[260px] lg:min-w-[220px] lg:max-w-[280px]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              const value = e.target.value;
              setSearchInput(value);
              setHighlightedIndex(0);
              if (value.trim() === "") {
                setSearchTerm("");
                setSelectedVehicle(null);
                setShowSuggestions(false);
              } else {
                setSelectedVehicle(null);
                setShowSuggestions(true);
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (suggestionList.length > 0) {
                  setHighlightedIndex((prev) =>
                    Math.min(prev + 1, suggestionList.length - 1)
                  );
                }
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (suggestionList.length > 0) {
                  setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                }
              } else if (e.key === "Enter") {
                if (
                  showSuggestions &&
                  suggestionList.length > 0 &&
                  highlightedIndex >= 0 &&
                  highlightedIndex < suggestionList.length
                ) {
                  applySuggestion(suggestionList[highlightedIndex]);
                } else {
                  setSearchTerm(searchInput);
                  setShowSuggestions(false);
                }
              } else if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
            placeholder="Search VIN or owner name"
            className="w-full h-[clamp(38px,10vw,44px)] md:h-11 lg:h-[46px] bg-[#0E0E0E] border border-[#252525] text-white text-[clamp(13px,3.5vw,15px)] md:text-[14px] rounded-[9px] pl-3 pr-14 outline-none placeholder-gray-500 focus:border-[#FF9500] transition-colors"
          />
          {searchInput.length > 0 && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearchInput("");
                setSearchTerm("");
                setSelectedVehicle(null);
                setHighlightedIndex(0);
                setShowSuggestions(false);
              }}
              className="absolute right-9 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              setSearchTerm(searchInput);
              setShowSuggestions(false);
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-[clamp(30px,8vw,36px)] h-[clamp(30px,8vw,36px)] md:w-8 md:h-8 flex items-center justify-center text-gray-500 hover:text-[#FF9500] transition-colors"
          >
            <SearchIcon className="w-[clamp(15px,4vw,19px)] h-[clamp(15px,4vw,19px)] md:w-4 md:h-4" />
          </button>

          {showSuggestions &&
            query.length >= 2 &&
            suggestionList.length > 0 && (
              <div className="absolute z-30 top-[calc(100%+6px)] left-0 right-0 bg-[#0E0E0E] border border-[rgba(255,255,255,0.10)] rounded-lg shadow-lg max-h-[280px] overflow-y-auto">
                {suggestionList.map((v, index) => (
                  <button
                    key={v.vinnumber}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => applySuggestion(v)}
                    className={`w-full text-left px-3 py-2.5 transition-colors ${
                      index === highlightedIndex
                        ? "bg-[rgba(255,149,0,0.10)]"
                        : "hover:bg-[rgba(255,255,255,0.05)]"
                    }`}
                  >
                    <div
                      className={`text-[13px] font-Kanit ${
                        index === highlightedIndex
                          ? "text-[#FF9500]"
                          : "text-white"
                      }`}
                    >
                      {v.ownername || "-"}
                    </div>
                    <div className="text-[12px] text-gray-400 mt-0.5">
                      {v.vinnumber}
                    </div>
                  </button>
                ))}
              </div>
            )}
        </div>
        
        {/* ---- Status filter chips ---- */}
        <div className="order-1 lg:order-2 flex flex-wrap items-center gap-[clamp(6px,1.8vw,8px)] md:gap-2 w-full lg:w-auto">
          {filterOptions.map((opt) => {
            const active = statusFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  setStatusFilter(statusFilter === opt.key ? "all" : opt.key)
                }
                className={`flex items-center gap-1.5 h-[clamp(32px,8vw,38px)] md:h-10 lg:h-11 px-[clamp(5px,1.5vw,7px)] md:px-3.5 rounded-[9px] border text-[clamp(11px,3vw,12px)] md:text-[14px] font-medium transition-colors ${
                  active
                    ? "border-[#FF9500] bg-[rgba(255,149,0,0.10)] text-[#FF9500]"
                    : "border-[#252525] bg-[#0D0D0D] text-gray-400 hover:text-white hover:border-[#3A3A3A]"
                }`}
                style={
                  active
                    ? { boxShadow: "0 0 12px rgba(255,149,0,0.15)" }
                    : undefined
                }
              >
                {opt.color && (
                  <span
                    className="w-[clamp(6px,1.7vw,8px)] h-[clamp(6px,1.7vw,8px)] md:w-2 md:h-2 rounded-full shrink-0"
                    style={{ background: opt.color }}
                  />
                )}
                <span className="">{opt.label}</span>
                <span className="text-gray-500">({opt.count})</span>
              </button>
            );
          })}
        </div>

       <div className="order-3 ml-auto flex items-center mb-1.5 lg:mb-5 w-auto lg:w-auto">
    <div className="relative w-full lg:w-auto">
    <select
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
      className="appearance-none w-[125px] sm:w-[145px] md:w-[180px] lg:w-[240px] h-[38px] md:h-11 lg:h-[46px] bg-[#0E0E0E] border border-[#252525] text-white text-[11px] sm:text-[12px] md:text-[13px] font-Kanit rounded-[9px] px-2.5 pr-7 outline-none cursor-pointer hover:border-[#3A3A3A] focus:border-[#FF9500] transition-colors"
    >
      <option value="">Sort: Status (default)</option>
      <option value="name-az">Name A --> Z</option>
      <option value="name-za">Name Z --> A</option>
      <option value="voltage-low">Battery Voltage: Low --> High</option>
      <option value="voltage-high">Battery Voltage: High --> Low</option>
      <option value="odometer-low">Odometer: Low --> High</option>
      <option value="odometer-high">Odometer: High --> Low</option>
    </select>
    <svg className="pointer-events-none absolute right-3 top-[60%] -translate-y-1/2 w-[clamp(14px,4vw,18px)] h-[clamp(14px,4vw,18px)] md:w-3.5 md:h-3.5 text-gray-400"
      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>
      </div>

      <div className="mt-1.5 lg:mt-3.5 flex-1 min-h-0 flex flex-col lg:border lg:border-[#252525] lg:rounded-[14px] lg:overflow-hidden lg:bg-[#0B0B0B]">
        <div
          className={`hidden lg:grid ${VEHICLE_GRID_COLUMNS} px-4 py-3 shrink-0 lg:divide-x lg:divide-[#252525] lg:overflow-hidden lg:[scrollbar-gutter:stable]`}>
        
        <div className="lg:pr-3.5 text-[14px] font-normal text-[#929292]">
          Vehicle and owener
        </div>
        <div className="lg:px-3.5 text-[14px] font-normal text-[#929292]">
          Battery and voltage
        </div>
        <div className="lg:px-3.5 text-[14px] font-normal text-[#929292]">
          Today(km) and last day(km)
        </div>
        <div className="lg:px-3.5 text-[14px] font-normal text-[#929292]">
          Odometer and Regen
        </div>
        <div className="lg:px-3.5 text-[14px] font-normal text-[#929292]">
          Uptime and Last update
        </div>
        <div className="lg:px-3.5 text-[14px] font-normal text-[#929292]">
          Location
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-1 pl-0 lg:px-0 lg:[scrollbar-gutter:stable]">
        {loading ? (
          <div className="bg-[#0D0D0D] border border-[#252525] rounded-xl py-12 text-center text-gray-500 text-sm">
            Loading...
          </div>
        ) : displayedVehicles.length === 0 ? (
          <div className="bg-[#0D0D0D] border border-[#252525] rounded-xl py-12 text-center text-gray-500 text-sm">
            No vehicles match.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 lg:gap-0">
            {displayedVehicles.map((vehicle) => {
              const view = buildVehicleView(vehicle);
              const modelLabel =
                vehicle.model &&
                !/^UNKNOWN/i.test(String(vehicle.model).trim())
                  ? String(vehicle.model)
                  : "";
              const usageDelta = (() => {
                if (
                  view.today === null ||
                  view.today === undefined ||
                  view.lastDay === null ||
                  view.lastDay === undefined
                )
                  return null;
                const t = Number(view.today);
                const l = Number(view.lastDay);
                if (!Number.isFinite(t) || !Number.isFinite(l) || l <= 0)
                  return null;
                const pct = ((t - l) / l) * 100;
                if (Math.abs(pct) < 0.05) return "Â± 0%";
                return pct < 0
                  ? `â†“ ${Math.abs(pct).toFixed(1)}% less`
                  : `â†‘ ${pct.toFixed(1)}% more`;
              })();

              const dotColor = STATUS_DOT_COLOR[view.status] || "#6B7280";
              const usageSeries = usageHistory[vehicle.vinnumber] || [];

              return (
                <div
                  key={vehicle.vinnumber}
                  className="bg-[#0B0B0B] border border-[#252525] rounded-[12px] overflow-hidden lg:bg-transparent lg:rounded-none lg:border-t lg:border-b-0 lg:border-l-0 lg:border-r-0 lg:border-[#252525]"
                  style={{ borderLeft: STATUS_BORDER_STYLE[view.status] }}
                >
                  {/* --- DESKTOP VIEW --- */}
                  <div
                    className={`hidden lg:grid lg:p-4 ${VEHICLE_GRID_COLUMNS} lg:divide-x lg:divide-[#252525]`}
                  >
                    {/* VEHICLE */}
                    <div
                      className="col-span-3 md:col-span-1 flex items-center gap-3 cursor-pointer min-w-0 lg:pr-3.5"
                      onClick={() =>
                        onVehicleSelect && onVehicleSelect(vehicle.vinnumber)
                      }
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: dotColor,
                          boxShadow: `0 0 8px ${hexToRgba(dotColor, 0.35)}`,
                        }}
                      />
                      <div
                        className="w-[clamp(44px,13vw,56px)] h-[clamp(44px,13vw,56px)] md:w-12 md:h-12 shrink-0 rounded-[10px] flex items-center justify-center text-[#FF9500]"
                        style={{
                          background: "rgba(255,149,0,0.05)",
                          border: "1px solid rgba(255,149,0,0.35)",
                        }}
                      >
                        <Bike className="w-[clamp(24px,7vw,32px)] h-[clamp(24px,7vw,32px)] md:w-6 md:h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-Kanit text-[clamp(17px,4.6vw,21px)] md:text-[17px] text-white  leading-tight truncate">
                          {vehicle.ownername || "Unknown owner"}
                        </div>
                        <div className="flex items-center gap-1 text-[clamp(13px,3.6vw,15px)] md:text-[14px] text-blue-500 font-Kanit mt-1 min-w-0">
                          <span className="truncate">{vehicle.vinnumber}</span>
                          <button
                            type="button"
                            aria-label="Copy VIN"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (navigator.clipboard)
                                navigator.clipboard.writeText(
                                  String(vehicle.vinnumber)
                                );
                            }}
                            className="shrink-0 text-[#6B7280] hover:text-[#FF9500] transition-colors"
                          >
                            <CopyIcon className="w-[clamp(16px,4.4vw,20px)] h-[clamp(16px,4.4vw,20px)] md:w-[12px] md:h-[12px]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* BATTERY */}
                    <div className="lg:px-3.5 flex flex-col justify-center min-w-0 col-span-3 md:col-span-1">
                      <div className="mt-1 md:mt-2 flex items-center gap-2 min-w-0">
                        <BatteryShape
                          percent={view.socPercent}
                          color={view.voltageColor}
                        />
                        <span
                          className="text-[clamp(17px,4.6vw,22px)] md:text-[17px] font-Kanit  leading-none whitespace-nowrap shrink-0"
                          style={{ color: view.voltageColor }}
                        >
                          {view.socDisplay}
                          {view.hasSoc ? "%" : ""}
                        </span>
                      </div>
                      <div className="text-[clamp(17px,4.6vw,22px)] md:text-[17px] text-[#ffffff] mt-1.5 md:mt-2.5">
                        {view.voltageDisplay}
                      </div>
                    </div>

                    {/* USAGE */}
                    <div className="lg:px-3.5 flex flex-col justify-center min-w-0 col-span-3 md:col-span-1">
                      <div className="flex items-start gap-4 md:gap-16 mt-1 md:mt-2 min-w-0">
                        <div className="min-w-0">
                          <div className="text-[clamp(17px,4.6vw,22px)] md:text-[17px] text-white font-Kanit  leading-tight whitespace-nowrap mt-1 md:mt-2">
                            {formatKm(view.today)}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[clamp(17px,4.6vw,22px)] md:text-[17px] text-white font-Kanit  leading-tight whitespace-nowrap mt-1 md:mt-2">
                            {formatKm(view.lastDay)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-1.5 w-full min-w-0">
                        <UsageSparkline
                          id={`usage-${vehicle.vinnumber}`}
                          data={usageSeries}
                        />
                      </div>
                    </div>

                    {/* ODOMETER + REGEN */}
                    <div className="lg:px-3.5 flex flex-col justify-center min-w-0">
                      <div className="text-[clamp(15px,4.2vw,18px)] md:text-[17px] text-white font-Kanit  leading-tight whitespace-nowrap truncate mt-1 md:mt-2">
                        {formatKm(vehicle.odometer)}
                      </div>
                      <div className="text-[clamp(12px,3.4vw,14px)] md:text-[14px] font-medium text-[#FF9500] mt-1.5 whitespace-nowrap truncate">
                        Regen: {formatRegen(vehicle.recoengine)}
                      </div>
                    </div>

                    {/* ACTIVITY */}
                    <div className="lg:px-3.5 flex flex-col justify-center min-w-0 col-span-2 md:col-span-1">
                      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-5 mt-2 min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-[clamp(16px,4.5vw,20px)] h-[clamp(16px,4.5vw,20px)] md:w-[18px] md:h-[18px] text-[#FF9500] shrink-0 " />
                            <div className="text-[clamp(17px,4.6vw,21px)] md:text-[17px] text-white font-Kanit  leading-tight whitespace-nowrap mt-1 ">
                              {formatUptime(vehicle.uptime)}
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-[clamp(18px,5vw,22px)] h-[clamp(18px,5vw,22px)] md:w-[18px] md:h-[18px] text-[#FF9500] shrink-0" />
                            <div className="text-[clamp(17px,4.6vw,21px)] md:text-[17px] text-white font-Kanit  leading-tight whitespace-nowrap mt-1.5">
                              {formatLastUpdatedTime(vehicle.lastupdated)}
                            </div>
                          </div>
                          <div className="text-[clamp(15px,4.2vw,19px)] md:text-[17px] font-normal text-[#ffffff] mt-1 whitespace-nowrap ml-5">
                            {formatLastUpdatedDate(vehicle.lastupdated)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LOCATION */}
                    <div className="lg:px-3.5 flex flex-col justify-center min-w-0 col-span-3 md:col-span-1">
                      {view.locationData ? (
                        <div className="mt-1 md:mt-2 flex justify-end md:justify-start lg:items-start">
                          <a
                            href={view.locationData.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 h-[clamp(44px,12.5vw,52px)] md:h-[48px] w-full max-w-[clamp(96px,26vw,124px)] md:max-w-[104px] rounded-[10px] bg-[rgba(255,149,0,0.05)] border border-[rgba(255,149,0,0.45)] text-[#FF9500] text-[clamp(12px,3.4vw,14px)] md:text-[12px] font-medium hover:bg-[rgba(255,149,0,0.12)] transition-colors"
                          >
                            <MapPinIcon className="w-[clamp(16px,4.6vw,20px)] h-[clamp(16px,4.6vw,20px)] md:w-4 md:h-4" />
                            Map
                          </a>
                        </div>
                      ) : (
                        <div className="text-[12px] text-gray-600 mt-2">
                          —
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col lg:hidden p-[clamp(10px,3.4vw,12px)] md:p-4">
                    {/* Row 1: Vehicle */}
                    <div className="flex justify-between items-start pb-1 border-b border-[#252525] gap-1">
                      <div 
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                        onClick={() => onVehicleSelect && onVehicleSelect(vehicle.vinnumber)}
                      >
                        {/* <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                          style={{
                            background: dotColor,
                            boxShadow: `0 0 8px ${hexToRgba(dotColor, 0.35)}`,
                          }}
                        /> */}
                        <div
                          className="w-[clamp(28px,10vw,32px)] h-[clamp(28px,11vw,40px)] shrink-0 rounded-[10px] flex items-center justify-center text-[#FF9500]"
                          style={{
                            background: "rgba(255,149,0,0.05)",
                            border: "1px solid rgba(255,149,0,0.35)",
                          }}
                        >
                          <Bike className="w-[clamp(12px,4vw,22px)] h-[clamp(12px,4vw,22px)]" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-Kanit text-[clamp(11px,4.6vw,14px)] text-white leading-tight truncate">
                            {vehicle.ownername || "Unknown owner"}
                          </div>
                          <div className="flex items-center gap-1 text-[clamp(10px,3.6vw,12px)] text-blue-500 font-Kanit mt-1 min-w-0">
                            <span className="truncate">{vehicle.vinnumber}</span>
                            <button
                              type="button"
                              aria-label="Copy VIN"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (navigator.clipboard)
                                  navigator.clipboard.writeText(String(vehicle.vinnumber));
                              }}
                              className="shrink-0 text-[#6B7280] hover:text-[#FF9500] transition-colors"
                            >
                              <CopyIcon className="w-[clamp(14px,4.4vw,20px)] h-[clamp(14px,4.4vw,20px)]" />
                            </button>
                          </div>
                        </div>

                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col border-[#252525] ">
                        <div className="text-[12px] text-[#929292] ">Battery</div>
                        <div className="flex items-center gap-2">
                          <BatteryShape percent={view.socPercent} color={view.voltageColor} />
                          <span
                            className="font-Kanit text-[14px]"
                            style={{ color: view.voltageColor }}
                          >
                            {view.socDisplay}{view.hasSoc ? "%" : ""}
                          </span>
                        </div>
                        <div className="text-[14px] text-white mt-1">{view.voltageDisplay}</div>
                      </div>
                      </div>
                    </div>

                    {/* Row 2: Battery & Usage */}
                    <div className="grid grid-cols-[auto_1fr] gap-4 pt-2 pb-4 border-b border-[#252525]">
                      <div className="flex flex-row pl-1">
                        <div className="flex gap-4">
                          <div className="flex flex-row border-[#252525] min-w-[120px] gap-4">
                          <div className="flex flex-col">
                            <div className="text-[12px] text-[#929292] mb-1.5">Today</div>
                            <div className="font-Kanit text-[14px] text-white leading-tight">{formatKm(view.today)}</div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-[12px] text-[#929292] mb-1.5">Last Day</div>
                            <div className="font-Kanit text-[14px] text-white leading-tight">{formatKm(view.lastDay)}</div>
                          </div>
                          </div>
                          <div className="flex flex-col border-l border-[#252525] pl-2 min-w-[80px]">
                           <div className="flex flex-col">
                        <div className="text-[12px] text-[#929292] mb-1.5">Odometer</div>
                        <div className="font-Kanit text-[15px] text-white">{formatKm(vehicle.odometer)}</div>
                      </div>
                       </div>

                        <div className="flex flex-col border-l border-[#252525] pl-2 min-w-[80px]">
                       <div className="flex flex-col">
                        <div className="text-[12px] text-[#929292] mb-1.5">Regen</div>
                        <div className="font-Kanit text-[15px] text-[#FF9500]">{formatRegen(vehicle.recoengine)}</div>
                      </div>
                        </div>

                     <div className="flex flex-col border-l border-[#252525] pl-2 min-w-[100px]">
                        <div className="flex items-center gap-1.5 mb-1.5 text-[#929292]">
                          <ClockIcon className="w-4 h-4" />
                          <span className="text-[12px]">Uptime</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white">
                          {/* <ClockIcon className="w-[18px] h-[18px]" /> */}
                          <span className="font-Kanit text-[15px] ml-5">{formatUptime(vehicle.uptime)}</span>
                        </div>
                      </div>
                        </div>
                        {/* <div className="mt-1.5 w-full">
                          <UsageSparkline id={`usage-mob-${vehicle.vinnumber}`} data={usageSeries} />
                        </div> */}
                      </div>
                    </div>

                    {/* Row 3: Odometer, Regen, Uptime */}
                    {/* <div className="grid grid-cols-[1fr_1fr_auto] gap-2 pt-4 pb-4 border-b border-[#252525]">
                      <div className="flex flex-col">
                        <div className="text-[12px] text-[#929292] mb-1.5">Odometer</div>
                        <div className="font-Kanit text-[15px] text-white">{formatKm(vehicle.odometer)}</div>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[12px] text-[#929292] mb-1.5">Regen</div>
                        <div className="font-Kanit text-[15px] text-[#FF9500]">{formatRegen(vehicle.recoengine)}</div>
                      </div>
                      <div className="flex flex-col border-l border-[#252525] pl-4 min-w-[100px]">
                        <div className="flex items-center gap-1.5 mb-1.5 text-[#929292]">
                          <ClockIcon className="w-4 h-4" />
                          <span className="text-[12px]">Uptime</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white">
                          <ClockIcon className="w-[18px] h-[18px]" />
                          <span className="font-Kanit text-[15px] ml-5">{formatUptime(vehicle.uptime)}</span>
                        </div>
                      </div>
                    </div> */}

                    {/* Row 4: Last Update & Map */}
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex flex-col">
                        <div className="text-[12px] text-[#929292] mb-1.5">Last Update</div>
                        <div className="flex items-start gap-1.5">
                          <CalendarIcon className="w-[18px] h-[18px] text-white mt-0.5" />
                          <div className="flex flex-col">
                            <div className="font-Kanit text-[14px] text-white leading-tight mb-1">{formatLastUpdatedDate(vehicle.lastupdated)} {formatLastUpdatedTime(vehicle.lastupdated)} </div>
                            {/* <div className="text-[14px] text-white">{formatLastUpdatedDate(vehicle.lastupdated)}</div> */}
                          </div>
                        </div>
                      </div>
                      <div>

                        {view.locationData ? (
                          <a
                            href={view.locationData.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 h-[36px] px-6 rounded-[10px] bg-[rgba(255,149,0,0.05)] border border-[rgba(255,149,0,0.45)] text-[#FF9500] text-[14px] font-medium hover:bg-[rgba(255,149,0,0.12)] transition-colors"
                          >
                            <MapPinIcon className="w-4 h-4" />
                            Map
                          </a>
                        ) : (
                          <div className="text-[14px] text-gray-600">—</div>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Nxdetails;