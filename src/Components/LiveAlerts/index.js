import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [showAlertBox, setShowAlertBox] = useState(false);
  const [lastAlertKey, setLastAlertKey] = useState(
    localStorage.getItem("last_alert_key") || null
  );

  const API_URL = "https://commandcenter.rivotmotors.com/get_last_alert.php";

  useEffect(() => {
    const saved = localStorage.getItem("live_alerts");
    if (saved) setAlerts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const fetchLatestAlert = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.status === "success" && data.data) {
          const latest = data.data;
          const uniqueKey =
            latest.unique_key ||
            `${latest.vinnumber || ""}_${latest.alert_time || ""}_${
              latest.alerts || latest.message || ""
            }`;

          if (uniqueKey && uniqueKey !== lastAlertKey) {
            const decoded = decodeAlertMessage(
              latest.alerts,
              latest.vinnumber,
              latest?.latlong || latest?.lat_long
            );

            const newAlert = {
              id: uniqueKey,
              vinnumber: latest.vinnumber || "Unknown VIN",
              alerts: decoded,
              alert_time: latest.alert_time || new Date().toISOString(),
              latlong: latest?.latlong || latest?.lat_long || "No location",
            };

            setAlerts((prev) => {
              const exists = prev.find((a) => a.id === uniqueKey);
              if (exists) return prev;

              const updated = [newAlert, ...prev].slice(0, 50);
              localStorage.setItem("live_alerts", JSON.stringify(updated));
              return updated;
            });

            setLastAlertKey(uniqueKey);
            localStorage.setItem("last_alert_key", uniqueKey);
          }
        } else {
          console.warn("No valid alert data found:", data);
        }
      } catch (err) {
        console.error("Error fetching alert:", err);
      }
    };

    fetchLatestAlert();
    const interval = setInterval(fetchLatestAlert, 2000);
    return () => clearInterval(interval);
  }, [lastAlertKey]);

  const handleRemove = (id) => {
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem("live_alerts", JSON.stringify(updated));
      return updated;
    });
  };
  

// 🧠 Decode raw alert text into human-readable message
const decodeAlertMessage = (alertText, vin, location) => {
  if (!alertText) return "Unknown alert";

  const text = alertText.toUpperCase();
  const loc = location || "unknown location";
  const vinStr = vin || "Unknown VIN";

  // Helper function to safely extract numeric value after a given key (e.g., "N1=", "B=")
  const extractValue = (key) => {
    const regex = new RegExp(`${key}\\s*=\\s*([-+]?\\d*\\.?\\d+)`, "i");
    const match = text.match(regex);
    return match ? match[1] : null;
  };

  // 🔋 Battery voltage alert
  if (text.includes("B=")) {
    const val = extractValue("B");
    return `Battery voltage is low (${val ? val + "V" : "unknown"}) `;
  }

  // 🌡️ NTC temperature sensor alerts
  if (text.includes("N1=")) {
    const val = extractValue("N1");
    return `Positive terminal temperature is ${val ? val + "°C" : "unknown"}`;
  }

  if (text.includes("N2=")) {
    const val = extractValue("N2");
    return `Cell number 20 temperature is ${val ? val + "°C" : "unknown"}`;
  }

  if (text.includes("N3=")) {
    const val = extractValue("N3");
    return `Cell number 28 temperature is ${val ? val + "°C" : "unknown"}`;
  }

  if (text.includes("N4=")) {
    const val = extractValue("N4");
    return `Negative terminal temperature is ${val ? val + "°C" : "unknown"}`;
  }

// ⚙️ MOSFET decoding (handles both "MOS=" and "M=" formats)
if (text.includes("MOS=") || text.includes("M=")) {
  const val = extractValue("MOS") || extractValue("M");

  // Handle patterns like "M=0,1"
  const mPattern = text.match(/M\s*=\s*(\d)\s*,\s*(\d)/);
  if (mPattern) {
    const charge = mPattern[1];
    const discharge = mPattern[2];

    if (charge === "0" && discharge === "1") return `Charging MOSFET is OFF`;
    if (charge === "1" && discharge === "0") return `Discharging MOSFET is OFF`;
    if (charge === "0" && discharge === "0")
      return `Both Charge and Discharge MOSFETs are OFF`;

    return `MOSFET status: Charge=${charge}, Discharge=${discharge}`;
  }

  // Fallback for older format like MOS=0.1 or MOS=1.0
  if (val === "0.1") return `Charging MOSFET is OFF`;
  if (val === "1.0") return `Discharging MOSFET is OFF`;
  if (val === "0.0") return `Both Charge and Discharge MOSFETs are OFF`;

  return `MOSFET status change detected (${val || "unknown"})`;
}

if (text.includes("CONTERR=1") || text.includes("CONTERR = 1")) {
  return `Controller error detected`;  
}

 // 🧩 Min cell voltage alert (pattern: IV=2.695V Cell=16)
  if (text.includes("IV=") && text.includes("CELL=")) {
    const voltageMatch = text.match(/IV\s*=\s*([-+]?\d*\.\d+|\d+)/);
    const cellMatch = text.match(/CELL\s*=\s*(\d+)/);
    const voltage = voltageMatch ? voltageMatch[1] : null;
    const cell = cellMatch ? cellMatch[1] : null;

    if (voltage && cell)
      return `Minimum cell voltage low (${voltage} V) at Cell #${cell}`;
    else if (voltage)
      return `Minimum cell voltage low (${voltage} V)`;
    else
      return `Minimum cell voltage low`;
  }
  // 🧩 Fallback — unknown format
  return `Alert received: ${alertText}`;

};

  return (
    <div className="relative">
      <button
        onClick={() => setShowAlertBox((p) => !p)}
        className="relative p-2 rounded-full hover:bg-white/10 transition"
      >
        <Bell className="w-5 h-5 text-white" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            {alerts.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showAlertBox && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 mt-3 w-96 bg-black border border-white/20 rounded-2xl shadow-lg p-3 z-50"
          >
            <h3 className="text-sm font-Kanit text-orange-400 mb-2">
              Active Alerts
            </h3>

            {alerts.length === 0 ? (
              <p className="text-gray-400 text-sm">No alerts</p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                <AnimatePresence>
                  {alerts.map((a) => (
                    <motion.li
                      key={a.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                      className="transition-all duration-300 text-sm text-white bg-white/5 p-2 rounded-lg relative hover:bg-white/10"
                    >
                      <p className="font-Kanit text-orange-300">
                        <span className="text-orange-300">{a.vinnumber}:</span>{" "}
                        {a.alerts}
                      </p>
                      <p className="text-gray-400 text-xs">
                        time: {a.alert_time}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Location: {a.latlong}
                      </p>
                      <button
                        onClick={() => handleRemove(a.id)}
                        className="absolute top-1 right-2 text-gray-400 hover:text-red-400 text-xs"
                      >
                        ✕
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}