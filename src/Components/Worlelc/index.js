import React, { useState, useEffect, useRef } from "react";
import Wapelement from "../Wapelement";
import { Calendar } from "lucide-react";
import LiveTracker from "../LiveTracker";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Worlelc({ vin, liveData }) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [fetchParams, setFetchParams] = useState(null);
  const [activeTab, setActiveTab] = useState("live");
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([ "speed_kmph",
  "currentconsumption",
  "batvoltage",]);
  
  const FOUR_HOURS = 4 * 60 * 60 * 1000;
  const ONE_MINUTE = 60 * 1000;
  const dropdownRef = useRef(null);
  const [liveSelectedOptions, setLiveSelectedOptions] = useState([
  "Speed (km/h)",
  "Battery voltage (V)"
]);


// ---------------------------------------------------------------------
// Helper: keep the selected window ≤ 4 hours and never allow a 0‑minute range
// ---------------------------------------------------------------------
const MAX_RANGE_MS = FOUR_HOURS;               // 4 h in ms

/** 
+ * Adjust start / end so that:
+ *   • diff ≤ 4 h
+ *   • diff > 0 (if diff === 0 we push the *other* side by +4 h)
+ *   • the side that the user just edited stays exactly what they typed
+ *   • the opposite side is moved only when needed
+ *
+ * @param {Date} start   – currently selected start (may be the edited value)
+ * @param {Date} end     – currently selected end   (may be the edited value)
+ * @param {'start'|'end'} editedSide – which picker the user just changed
+ * @returns {{start: Date, end: Date}} – corrected dates
+ */
function enforceFourHourWindow(start, end, editedSide) {
  // Ensure we have valid Date objects
  if (isNaN(start) || isNaN(end)) return { start, end };

  let diff = end - start; // ms (can be negative)

  // -----------------------------------------------------------------
  // 1️⃣  Zero‑minute range  → push the opposite side by exactly 4 h
  // -----------------------------------------------------------------
  if (diff === 0) {
    if (editedSide === 'start') {
      end = new Date(start.getTime() + MAX_RANGE_MS);
    } else {
      start = new Date(end.getTime() - MAX_RANGE_MS);
    }
    return { start, end };
  }

  // -----------------------------------------------------------------
  // 2️⃣  Range > 4 h  → move the *opposite* side so the window becomes 4 h
  // -----------------------------------------------------------------
  if (Math.abs(diff) > MAX_RANGE_MS) {
    if (editedSide === 'start') {
      // user changed start → keep start, move end forward
      end = new Date(start.getTime() + MAX_RANGE_MS);
    } else {
      // user changed end → keep end, move start backward
      start = new Date(end.getTime() - MAX_RANGE_MS);
    }
    return { start, end };
  }

  // -----------------------------------------------------------------
  // 3️⃣  Valid range (≤ 4 h, > 0) → do nothing
  // -----------------------------------------------------------------
  return { start, end };
}


 const liveOptionsList = [
  "Speed (km/h)",
  "Trip (km)",
  "Battery voltage (V)",
  "inah_by_charger",
  "inah_by_regen",
  "SOC (%)",
  "APU SOC",
  "Motor temp (°C)",
  "Controller mosfet temp (°C)",
  "BMS mosfet temp (°C)",
  "Inah (Ah)",
  "Outah (Ah)",
  "Remaining capacity (Ah)",
  "Current consumption (A)",
  "Rider Status",
  "Power State",
  "Current Gear",
  "Range",
  "Time",
  "Lat-long",
];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const formatDateTimeLocal = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  // ✅ Default Time = Last 3 Hours
  const setDefaultTimes = () => {
    const now = new Date();
    const past3 = new Date(now.getTime() - 3 * 60 * 60 * 1000); // <-- CHANGED
    setStartTime(formatDateTimeLocal(past3));
    setEndTime(formatDateTimeLocal(now));
    setAutoMode(true);
    setErrorMsg("");
  };

  useEffect(() => {
    setDefaultTimes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (autoMode) setDefaultTimes();
    }, 60000);
    return () => clearInterval(timer);
  }, [autoMode]);

  useEffect(() => {
    setFetchParams(null);
  }, [vin]);

  const handleLoadHistory = () => {
  if (!startTime || !endTime) {
    return setErrorMsg("Please select both start and end times.");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  const diff = end - start;

  if (diff <= 0) {
    return setErrorMsg("Invalid time range.");
  }

  if (diff > FOUR_HOURS) {
    return setErrorMsg("Maximum allowed range is 4 hours.");
  }
  setErrorMsg("");
  setFetchParams({ start: startTime, end: endTime });
  setActiveTab("history");
};

const ONE_MIN = 60 * 1000;

const isNow = (date) => {
  const now = new Date();
  return Math.abs(date - now) < ONE_MIN; // within 1 min
};

const clampToFourHours = (start, end, type) => {
  const diff = end.getTime() - start.getTime();

  if (diff <= 0) {
    if (type === "start") {
      return {
        start,
        end: new Date(start.getTime() + FOUR_HOURS),
      };
    } else {
      return {
        start: new Date(end.getTime() - FOUR_HOURS),
        end,
      };
    }
  }

  if (diff > FOUR_HOURS) {
    if (type === "start") {
      return {
        start,
        end: new Date(start.getTime() + FOUR_HOURS),
      };
    } else {
      return {
        start: new Date(end.getTime() - FOUR_HOURS),
        end,
      };
    }
  }
  return { start, end };
};

  return (
    <div className="w-full flex flex-col">
    <div className="flex items-center justify-between border-b border-[#FF9913]/30 pb-2">
  <div className="flex gap-2">
    <button
      onClick={() => { setActiveTab("live"); setShowDropdown(false); }}
      className={`px-4 py-2 rounded-lg text-sm font-Kanit ${
        activeTab === "live"
          ? "rounded-xl px-6 py-2.5 text-sm bg-green-500 text-black"
          : "rounded-xl px-6 py-2.5 text-sm bg-white/10 text-gray-300 hover:bg-white/20"
      }`}
      >
      Live
    </button>

    <button
      onClick={() => { setActiveTab("history"); setShowDropdown(false); }}
      className={`px-4 py-2 rounded-lg text-sm font-Kanit ${
        activeTab === "history"
          ? "rounded-xl px-6 py-2.5 text-sm font-Kanit text-black bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
          : "rounded-xl px-6 py-2.5 text-sm bg-white/10 text-gray-300 hover:bg-white/20"
      }`}
    >
      History
    </button>
  </div>

   <div className=" mb-1 relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-2 px-2 py-1 text-xs sm:text-sm md:text-base rounded-md border border-[#FF9913]/40 
                transition-all duration-300 
                ${
                  showDropdown
                    ? "bg-[#FF9913]/20 text-[#FF9913]"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                } w-full sm:w-auto justify-between`}
            >
              <span>
              {activeTab === "live" ? "Live Parameters" : "History Parameters"}
              </span>
            <svg
                className={`w-3 h-3 transition-transform duration-300 ${
                  showDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 20 20"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="absolute z-[1000] mt-2 right-0 w-52 bg-[#111]/90 border border-[#FF9913]/30 rounded-lg shadow-lg p-3 overflow-auto max-h-80"
                >
                 {(activeTab === "live" ? liveOptionsList : [
                   "speed_kmph",
                  "tripkm",
                  "batvoltage",
                  "inah_by_charger",
                  "inah_by_regen",
                  "soc",
                  "apusoc",
                  "motortemp",
                  "controllermostemp",
                  "bmsmostemp",
                  "inah",
                  "outah",
                  "remainingcapacity_ah",
                  "currentconsumption",
                  "currentrider",
                  "ev_power_state",
                  "tirepressure",
                  "time",
                  "lat_long"
                ]).map((item) => {

                  const isLive = activeTab === "live";
                  const selected = isLive ? liveSelectedOptions : selectedOptions;

                  return (
                    <motion.label
                      key={item}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2 mb-2 text-gray-200 hover:text-[#FF9913] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(item)}
                        onChange={() => {
                          if (isLive) {
                            setLiveSelectedOptions((prev) =>
                              prev.includes(item)
                                ? prev.filter((i) => i !== item)
                                : [...prev, item]
                            );
                          } else {
                            handleCheckboxChange(item);
                          }
                        }}
                        className="accent-[#FF9913]"
                      />
                      {item}
                    </motion.label>
                  );
                })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
    </div>

      {/* Controls */}
      {activeTab === "history" && (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-3">
        {/* Time Pickers */}
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="relative w-full md:w-auto">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
          <input
            type="datetime-local"
            value={startTime}
            step="60"
            //   onChange={(e) => {
            //   const start = new Date(e.target.value);
            //   if (isNaN(start)) return;

            //   let end = endTime
            //     ? new Date(endTime)
            //     : new Date(start.getTime() + FOUR_HOURS);

            //   let diff = end.getTime() - start.getTime();

            //   if (diff <= 0) {
            //     end = new Date(start.getTime() + 60000); // Enforce a 1-minute gap to keep it valid
            //   }

            //   else if (diff > FOUR_HOURS) {
            //     end = new Date(start.getTime() + FOUR_HOURS);
            //   }

            //   setStartTime(formatDateTimeLocal(start));
            //   setEndTime(formatDateTimeLocal(end));
            // }}

            onChange={(e) => {
                  const newStart = new Date(e.target.value);
                  if (isNaN(newStart)) return;

                  // Keep the *current* end value (may be empty) and let the helper fix it
                  const currentEnd = endTime ? new Date(endTime) : new Date(newStart.getTime() + FOUR_HOURS);

                  const { start: fixedStart, end: fixedEnd } = enforceFourHourWindow(newStart, currentEnd, 'start');

                  setStartTime(formatDateTimeLocal(fixedStart));
                  setEndTime(formatDateTimeLocal(fixedEnd));
                }}
            className="pl-10 pr-3 w-full rounded-xl border border-[#FF9913]/30 bg-black px-8 py-2 text-white"
          />
          </div>

          <div className="relative w-full md:w-auto">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            <input
                type="datetime-local"
                value={endTime}
                step="60"
          //   onChange={(e) => {
          //     const end = new Date(e.target.value);
          //     if (isNaN(end)) return;

          //   let start = startTime
          //     ? new Date(startTime)
          //     : new Date(end.getTime() - FOUR_HOURS);

          //   let diff = end.getTime() - start.getTime();

          //   if (diff <= 0) {
          //     start = new Date(end.getTime() - 60000); // Enforce a 1-minute gap to keep it valid
          //   }

          
          //   else if (diff > FOUR_HOURS) {
          //     start = new Date(end.getTime() - FOUR_HOURS);
          //   }
        
          //   setStartTime(formatDateTimeLocal(start));
          //   setEndTime(formatDateTimeLocal(end));
          // }}

  onChange={(e) => {
  const newEnd = new Date(e.target.value);
   if (isNaN(newEnd)) return;

 // Keep the *current* start value (may be empty) and let the helper fix it
const currentStart = startTime ? new Date(startTime) : new Date(newEnd.getTime() - FOUR_HOURS);

  const { start: fixedStart, end: fixedEnd } = enforceFourHourWindow(currentStart, newEnd, 'end');

   setStartTime(formatDateTimeLocal(fixedStart));
   setEndTime(formatDateTimeLocal(fixedEnd));
 }}
          className="pl-10 pr-3 w-full rounded-xl border border-[#FF9913]/30 bg-black px-8 py-2 text-white"
            />
          </div>

          {activeTab === "history" && (
            <div className="flex gap-3 mt-2 md:mt-0">
              <button
                onClick={handleLoadHistory}
                disabled={loading}
                className="rounded-xl px-6 py-2.5 text-sm font-Kanit text-black bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
              >
                {loading ? "Loading..." : "Load History"}
              </button>

              {!autoMode && (
                <button
                  onClick={setDefaultTimes}
                  className="rounded-xl px-6 py-2.5 text-sm font-Kanit text-black bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
                >
                  Set Default
                </button>
              )}
            </div>
          )}
        </div>  
      </div>
      )}

     {activeTab === "history" && errorMsg && (
  <div className="text-red-400 text-sm mt-1 font-medium">{errorMsg}</div>
  )}
      <div className="relative w-full" style={{ height: "calc(100vh - 155px)" }}>
        {vin ? (
          activeTab === "live" ? (
            <LiveTracker vin={vin} liveData={liveData} selectedOptions={liveSelectedOptions}/>
          ) : fetchParams ? (
            <Wapelement
              vin={vin}
              start={fetchParams.start}
              end={fetchParams.end}
              applyFilter={fetchParams}
              selectedOptions={selectedOptions}
            />
          ) : (
            <div className="text-[#FF9913] mt-2">
              Select start & end time and click <b>Load History</b>
            </div>
          )
        ) : (
          <div className="text-white mt-2">Please select VIN to load map...</div>
        )}
      </div>
    </div>
  );
}