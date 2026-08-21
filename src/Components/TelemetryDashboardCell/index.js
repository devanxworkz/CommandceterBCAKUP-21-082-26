import React, { useEffect, useState , useMemo , useRef } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/* ================= COLORS ================= */
const COLORS = [
  "#22c55e", "#f43f5e", "#3b82f6", "#facc15", "#f97316",
  "#6366f1", "#06b6d4", "#a3e635", "#ec4899", "#f87171",
  "#34d399", "#fbbf24", "#f472b6", "#60a5fa", "#818cf8",
  "#f472b6", "#f87171", "#22c55e", "#3b82f6", "#f43f5e",
  "#f97316", "#fbbf24", "#6366f1",
];

const CELL_COLORS = Array.from({ length: 23 }, (_, i) => "#22c55e");

/* ================= CORE LOGIC ================= */

function getStartCell(label) {
  if (label.includes("1to3")) return 1;
  const match = label.match(/cell(\d+)to(\d+)/);
  return match ? Number(match[1]) : null;
}

function parseNTCCells(row, lastValidRef) {
  const cells = Array.from({ length: 23 }, (_, i) => ({
    cell: i + 1,
    voltage: null,
  }));


 if (!row) return cells;

  const cellGroups = [
    row.cell1to3,
    row.cell4to6,
    row.cell7to9,
    row.cell10to12,
    row.cell13to15,
    row.cell16to18,
    row.cell19to21,
    row.cell22to23,
  ];

  let cellIndex = 0;

  cellGroups.forEach((group, groupIndex) => {
    if (!group) return;

    // Cell22-23 contains only 2 cells
    const cellCount = groupIndex === 7 ? 2 : 3;

    for (let i = 0; i < cellCount; i++) {
      const hex = group.substring(i * 4, i * 4 + 4);

      if (hex.length !== 4) continue;

      const voltage = parseInt(hex, 16) / 1000;

      if (voltage >= 2 && voltage <= 5) {
        cells[cellIndex].voltage = voltage;
        lastValidRef.current[cellIndex] = voltage;
      } else {
        cells[cellIndex].voltage = lastValidRef.current[cellIndex];
      }

      cellIndex++;
    }
  });

  return cells;
}

const EMPTY_CELLS = Array.from({ length: 23 }, (_, i) => ({
  cell: i + 1,
  voltage: null
}));


export default function TelemetryDashboardCell({
  ntc,
   latestData,
   rawLiveData,
   vin
}) {
  
  const [showSelector, setShowSelector] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]); // default selected
  const [cells, setCells] = useState(EMPTY_CELLS);

  const [fullData, setFullData] = useState([]);
const [visibleRange, setVisibleRange] = useState({ start: 0, end: 110 });

const [isDragging, setIsDragging] = useState(false);
const [isLive, setIsLive] = useState(true);
const dragStartX = useRef(0);
const lastValidRef = useRef(
  Array.from({ length: 23 }, () => null)
);
useEffect(() => {
  if (!vin) return;

  lastValidRef.current = Array.from({ length: 23 }, () => null);

  activeVinRef.current = vin;
  setShowSelector(false);
  setSelectedCells([]);
  setCells(EMPTY_CELLS);

}, [vin]);

  function normalizeNTC(ntc) {
  if (!ntc) return [];

  if (Array.isArray(ntc)) return ntc;
  if (typeof ntc === "string") return ntc.split(",");
  return [];
}

function extract23Cells(ntc) {
  const arr = normalizeNTC(ntc);
  const cells = [];

  arr.forEach(item => {
    if (typeof item === "string" && item.includes("cell")) {
      const hex = item.split("=")[1];
      if (!hex) return;

      const chunks = hex.match(/.{1,4}/g) || [];
      chunks.forEach(c => {
        const mv = parseInt(c.slice(0, 4), 16);
        if (!isNaN(mv)) {
          cells.push(Number((mv / 1000).toFixed(3)));
        }
      });
    }
  });

  return cells.slice(0, 23);
}
function buildGraphPoint(row, selectedCells) {
  const parsed = parseNTCCells(row, lastValidRef);

  const point = {
    time: new Date(row.time).getTime(),
  };

  selectedCells.forEach(cell => {
    const value = parsed[cell - 1]?.voltage;

    // ✅ GRAPH → force 2 decimal ONLY here
    point[`cell${cell}`] =
      typeof value === "number"
        ? Number(value.toFixed(2))  // ⭐ KEY CHANGE
        : null;
  });

  return point;
}

const activeVinRef = useRef(null);

useEffect(() => {
  if (!latestData?.cell1to3) return;

  if (!Array.isArray(rawLiveData) || rawLiveData.length < 10) {
    return;
  }
  const initialData = rawLiveData
    .slice(-500)
    .map(row => buildGraphPoint(row, selectedCells));
  setCellHistory(initialData);

}, [rawLiveData, selectedCells]);
  const toggleCell = (cell) => {
    setSelectedCells((prev) =>
      prev.includes(cell)
        ? prev.filter((c) => c !== cell)
        : [...prev, cell]
    );
  };

  const TOTAL_CELLS = 23;
const allCellsSelected = selectedCells.length === TOTAL_CELLS;
const toggleSelectAllCells = () => {
  if (allCellsSelected) {
    setSelectedCells([]);
  } else {
    setSelectedCells(
      Array.from({ length: TOTAL_CELLS }, (_, i) => i + 1)
    );
  }
};

  const [cellHistory, setCellHistory] = useState([]);
  const CellTooltip = ({ active, payload, label, selectedMetrics }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const date = new Date(label);
  return (
    <div
      style={{
        background: "#000",
        border: "1px solid #FF9913",
        borderRadius: 12,
        padding: 10,
        fontSize: 12,
      }}
    >
      <div style={{ color: "#fff", marginBottom: 6 }}>
        {date.toLocaleDateString()} {date.toLocaleTimeString()}
      </div>

      {EXTRA_METRICS.filter(m =>
        selectedMetrics.includes(m.key)
      ).map(m => (
        <div key={m.key} style={{ color: "#FF9913" }}>
          {m.label}:{" "}
          <strong>
            {data[m.key] !== null && data[m.key] !== undefined
              ? `${data[m.key]} ${m.unit}`
              : "--"}
          </strong>
        </div>
      ))}

      <hr style={{ margin: "6px 0", opacity: 0.3 }} />

      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.stroke }}>
          {p.name}: {p.value?.toFixed(2)} V
        </div>
      ))}
    </div>
  );
};

const cellMetricOptions = Array.from({ length: 23 }, (_, i) => ({
  key: `cell${i + 1}`,
  label: `Cell ${i + 1} (V)`
}));
const EXTRA_METRICS = [
  { key: "currentPositive", label: "Current generation(A)", unit: "A" },
  { key: "currentNegative", label: "Current consumption(A)", unit: "A" },
  { key: "speed_kmph", label: "Speed", unit: "km/h" },
  { key: "motortemp", label: "Motor Temp", unit: "°C" },
  { key: "controllermostemp", label: "Controller MOS Temp", unit: "°C" },
  { key: "soc", label: "SOC", unit: "%" },
  { key: "inah", label: "In Ah", unit: "Ah" },
  { key: "outah", label: "Out Ah", unit: "Ah" },
  { key: "batvoltage", label: "Battery Voltage", unit: "V" },
];
const [selectedMetrics, setSelectedMetrics] = useState([
  "speed_kmph", // default
]);

const liveArray = useMemo(() => {
  if (!latestData) return [];
  return Array.isArray(latestData)
    ? latestData
    : [latestData];
}, [latestData]);
 

useEffect(() => {
  const activeCells =selectedCells.length > 0 ? selectedCells : Array.from({ length: 23 }, (_, i) => i + 1);
  if (!latestData?.ntc) return;

  setCellHistory(prev => {
    if (!prev) return [];
    const newPoint = buildGraphPoint(
      latestData,
      selectedCells
    );
    const next = [...prev, newPoint];
    return next.slice(-500);
  });
}, [latestData, selectedCells]);

useEffect(() => {
  if (!latestData?.ntc) return;
  setCells(parseNTCCells(latestData, lastValidRef));
}, [latestData]);

  const { minCell, maxCell } = useMemo(() => {
  const validCells = cells.filter(
    c => typeof c.voltage === "number"
  );
  if (!validCells.length) {
    return { minCell: null, maxCell: null };
  }
  const minVoltage = Math.min(...validCells.map(c => c.voltage));
  const maxVoltage = Math.max(...validCells.map(c => c.voltage));
  return {
    minCell: validCells.find(c => c.voltage === minVoltage)?.cell,
    maxCell: validCells.find(c => c.voltage === maxVoltage)?.cell,
  };
}, [cells]);

  const CELL_COLORS = [
  "#22c55e", // 1 green
  "#3b82f6", // 2 blue
  "#f97316", // 3 orange
  "#a855f7", // 4 violet
  "#06b6d4", // 5 cyan
  "#84cc16", // 6 lime
  "#ec4899", // 7 pink
  "#eab308", // 8 yellow
  "#14b8a6", // 9 teal
  "#f43f5e", // 10 red
  "#6366f1", // 11 indigo
  "#10b981", // 12 emerald
  "#fb7185", // 13 rose
  "#38bdf8", // 14 sky
  "#c084fc", // 15 purple
  "#facc15", // 16 amber
  "#4ade80", // 17 soft green
  "#60a5fa", // 18 soft blue
  "#fb923c", // 19 soft orange
  "#818cf8", // 20 soft indigo
  "#2dd4bf", // 21 aqua
  "#f472b6", // 22 magenta
  "#a3e635", // 23 yellow-green
];
    useEffect(() => {
      if (!cellHistory || cellHistory.length === 0) return;

      setFullData((prev) => {
        const existing = new Set(prev.map((d) => d.time));

        const newItems = cellHistory.filter(
          (d) => !existing.has(d.time)
        );

        if (newItems.length === 0) return prev;

        return [...prev, ...newItems];
      });
    }, [cellHistory]);


useEffect(() => {
  const windowSize = 110;

  if (!isLive || isDragging) return;

  if (fullData.length > windowSize) {
    setVisibleRange({
      start: fullData.length - windowSize,
      end: fullData.length,
    });
  }
}, [fullData, isLive, isDragging]);
const handleMouseDown = (e) => {
   e.preventDefault(); // 🔥 IMPORTANT
  setIsDragging(true);
  setIsLive(false);// stop auto movement only
  dragStartX.current = e.clientX;
};

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
      newEnd = 110;
    }

    // RIGHT boundary
    if (newEnd > fullData.length) {
      newEnd = fullData.length;
      newStart = Math.max(0, fullData.length - 110);
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

return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
      {/* ================= RIGHT : GRAPH ================= */}
    <div className="md:col-span-3 h-[520px]">
      <div
        className="relative w-full h-full rounded-3xl bg-black
                   border border-[#FF9913]/60 p-4"
                   onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
      >
        <h3 className="text-white text-sm font-Arial, sans-serif mb-3">
          Cell voltage graph
        </h3>

        {/* ===== Select Cells Button ===== */}
        {!isLive && (
        <button
          onClick={() => {
            setIsLive(true);

            const windowSize = 110;
            setVisibleRange({
              start: Math.max(0, fullData.length - windowSize),
              end: fullData.length,
            });
          }}
          className="absolute top-3 right-16 px-3 py-1 text-xs
          bg-black text-white border border-[#FF9913]/50 rounded-lg mr-[55px]"
        >
          Go Live
        </button>
      )}
        <button
          onClick={() => setShowSelector(true)}
          className="absolute top-3 right-3 z-20 px-3 py-1 text-xs text-white
                     bg-black border border-[#FF9913]/50 rounded-lg hover:text-[#FF9913]"
        >
          Select cells ▼
        </button>

        {/* ===== Slide-out Panel ===== */}
        {showSelector && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowSelector(false)}
            />
            {/* Panel */}
            <div
              className="absolute top-0 right-0 h-full w-64 sm:w-72 bg-black/95
                         border-l border-[#FF9913]/30 z-50 p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-white text-sm font-semibold">
                  Select cells and parameters
                </h4>
                <button
                  onClick={() => setShowSelector(false)}
                  className="text-gray-400 hover:text-[#FF9913]"
                >
                  ✕
                </button>
              </div>
              {/* ===== Select All Cells ===== */}
              <label className="flex items-center gap-2 mb-3 text-xs text-white cursor-pointer hover:text-[#FF9913]">
                <input
                  type="checkbox"
                  checked={allCellsSelected}
                  onChange={toggleSelectAllCells}
                  className="accent-[#FF9913]"
                />
                Select All Cells (1–23)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Array.from({ length: 23 }, (_, i) => i + 1).map((cell) => (
                  <label
                    key={cell}
                    className="flex items-center gap-2 text-white cursor-pointer hover:text-[#FF9913]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCells.includes(cell)}
                      onChange={() => toggleCell(cell)}
                      className="accent-[#FF9913]"
                    />
                    Cell {cell}
                  </label>
                ))}
              </div>
                <div className="flex flex-wrap gap-3 mt-4 text-sm text-white">
                  {EXTRA_METRICS.map((m) => (
                  <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(m.key)}
                      onChange={(e) => {
                        setSelectedMetrics(prev =>
                          e.target.checked
                            ? [...prev, m.key]
                            : prev.filter(k => k !== m.key)
                        );
                      }}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== Chart ===== */}
       <ResponsiveContainer width="100%" height={460}>
      <LineChart
        data={fullData.slice(visibleRange.start, visibleRange.end)}
        margin={{ top: 20, right: 20, bottom: 40, left: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#ffffff20"
          vertical={false}
        />

        <XAxis
          dataKey="time"
          tick={{ fill: "#ffffff", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#ffffff" }}
          tickFormatter={(t) => {
            const d = new Date(t);
            return `${d.getHours().toString().padStart(2, "0")}:${d
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;
      }}
    />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "#ffffff", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#ffffff" }}
          width={55}
          tickFormatter={(value) => value?.toFixed(2)} 
        />

      <Tooltip
      content={
        <CellTooltip selectedMetrics={selectedMetrics} />
      }
    />
        <Legend
          iconType="circle"
          wrapperStyle={{
            color: "#22c55e",
            fontSize: 12,
            fontWeight: 600,
          }}
        />
        
        {selectedCells.map((cell, i) => (
          <Line
            key={cell}
            type="monotone"
            dataKey={`cell${cell}`}
            name={`Cell ${cell} voltage (V)`}
            stroke={CELL_COLORS[i % CELL_COLORS.length]}
            strokeWidth={2.2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        ))}
    </LineChart>
</ResponsiveContainer>
      </div>
    </div>

     {/* ================= LEFT : CELLS ================= */}
      <div className="md:col-span-2">
  <div className="bg-black rounded-[26px] p-6 border border-white/10 h-full">
    <h3 className="text-white text-sm font-Arial, sans-serif mb-5">
      Battery Cells
    </h3>

    {/* ===== Cells Grid ===== */}
    <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-x-6 gap-y-6">
      {cells.map((c) => {
        let color = "#22c55e";
        if (c.cell === maxCell) color = "#f7f306";
        if (c.cell === minCell) color = "#f00b0b";

        return (
          <div
            key={c.cell}
            className="flex flex-col items-center gap-1"
          >
            {/* ===== LOW / HIGH Label ===== */}
            <div
              className="h-4 text-xs font-bold tracking-wide"
              style={{ color }}
            >
              {c.cell === minCell
                ? "LOW"
                : c.cell === maxCell
                ? "HIGH"
                : ""}
            </div>

            <div
              className="relative w-14 h-8 rounded-lg border-[2.5px]
                         flex items-center justify-center"
              style={{ borderColor: color }}
            >
              <div
                className="absolute -right-[5px] top-1/2 -translate-y-1/2
                           w-[5px] h-[14px] rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color }}
              >
                {c.cell}
              </span>
            </div>

            {/* ===== Voltage ===== */}
            <div
              className="text-xs font-medium tracking-wide"
              style={{ color }}
            >
              {typeof c.voltage === "number"
                ? `${c.voltage.toFixed(3)} V`
                : "--"}
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>
    </div>
  );
}
