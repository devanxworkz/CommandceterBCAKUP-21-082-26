import './index.css'
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
} from "lucide-react";

import React, { useRef , useEffect, useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import ConfirmPopup from '../ConfirmPopup';
import { FiRefreshCw } from "react-icons/fi";

const statusStyles = {
  NEW: { bg: "#1b1b1b", color: "#FFA500" },
  IN_PROGRESS: { bg: "#111827", color: "#60A5FA" },
  ON_HOLD: { bg: "#1f2937", color: "#F97316" },
  RESOLVED: { bg: "#0f1724", color: "#34D399" },
  CLOSED: { bg: "#0b0b0b", color: "#9CA3AF" },
};

const API_BASE = "https://sb.rivotmotors.com/api/tickets";

// https://103.174.148.224:8084/api/tickets
const THEME = {
  background: "#0D0D0D",
  card: "#121212",
  accent: "#FF7A00",
  text: "#FFFFFF",
  muted: "#9CA3AF",
  border: "rgba(255,122,0,0.08)",
};

function smallDate(t) {
  if (!t) return "-";
  try {
    return new Date(t).toLocaleString();
  } catch {
    return t;
  }
}

function timeLeftISO(iso) {
  if (!iso) return "-";
  const diff = new Date(iso) - new Date();
  if (diff <= 0) return "Expired";
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs}h ${mins}m`;
}

const isMobile = window.innerWidth <= 640;

function RaiseTicketForm(props) {
  const {
    form,
    handleFormChange,
    submitForm,
    isEditing,
    setForm,
    emptyForm,
    setScreen,
    setSelected,
    cardStyle,
  } = props;

  const [allCustomers, setAllCustomers] = useState([]);

  const [filteredName, setFilteredName] = useState([]);
  const [filteredPhone, setFilteredPhone] = useState([]);
  const [filteredVin, setFilteredVin] = useState([]);

  const [focusedField, setFocusedField] = useState(null);
  const [activeNameIndex, setActiveNameIndex] = useState(-1);
  const [activePhoneIndex, setActivePhoneIndex] = useState(-1);
  const [activeVinIndex, setActiveVinIndex] = useState(-1);
  const nameListRef = useRef(null);
  const phoneListRef = useRef(null);
  const vinListRef = useRef(null);

  const fileInputRef = useRef(null);

  // NEW STATES
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  

  // Load customer list
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("https://ble.nerdherdlab.com/all_vinfetch.php");
        const json = await res.json();
        setAllCustomers(json.vehicles || []);
      } catch (err) {
        console.error("Error loading customer list:", err);
      }
    }
    loadData();
  }, []);


  const handleCustomerNameChange = (value) => {
    setForm({ ...form, username: value });
    setActiveNameIndex(-1);

    if (!value.trim()) return setFilteredName([]);

    const match = allCustomers.filter((c) =>
      (c.ownername || "").toLowerCase().includes(value.toLowerCase())
    );

    setFilteredName(match);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, phonenum: val });
    setActivePhoneIndex(-1);

    if (!val.trim()) return setFilteredPhone([]);

    const match = allCustomers.filter((c) =>
      (c.phonenumber || "").toString().includes(val)
    );
    setFilteredPhone(match);
  };

  const handleVinChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, vinnumber: val });
    setActiveVinIndex(-1);

    if (!val.trim()) return setFilteredVin([]);

    const match = allCustomers.filter((c) =>
      (c.vinnumber || "").toLowerCase().includes(val.toLowerCase())
    );
    setFilteredVin(match);
  };

  const selectCustomer = (c) => {
    if (!c) return;

    setForm({
      ...form,
      username: c.ownername,
      phonenum: c.phonenumber,
      vinnumber: c.vinnumber,
    });

    setFilteredName([]);
    setFilteredPhone([]);
    setFilteredVin([]);
    setActiveNameIndex(-1);
    setActivePhoneIndex(-1);
    setActiveVinIndex(-1);
  };

  // =========================
  // KEYBOARD HANDLERS
  // =========================
  const handleKeyDownOnName = (e) => {
    if (filteredName.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveNameIndex((p) => (p < filteredName.length - 1 ? p + 1 : p));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveNameIndex((p) => (p > 0 ? p - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeNameIndex >= 0) selectCustomer(filteredName[activeNameIndex]);
    }
  };

  const handleKeyDownOnPhone = (e) => {
    if (filteredPhone.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivePhoneIndex((p) => (p < filteredPhone.length - 1 ? p + 1 : p));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivePhoneIndex((p) => (p > 0 ? p - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activePhoneIndex >= 0) selectCustomer(filteredPhone[activePhoneIndex]);
    }
  };

  const handleKeyDownOnVin = (e) => {
    if (filteredVin.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveVinIndex((p) => (p < filteredVin.length - 1 ? p + 1 : p));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveVinIndex((p) => (p > 0 ? p - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeVinIndex >= 0) selectCustomer(filteredVin[activeVinIndex]);
    }
  };

  // =========================
  // SUBMIT WITH VALIDATION + NO DOUBLE POPUP
  // =========================
const handleCreateTicket = async (e) => {
  e.preventDefault();

  // ❌ VALIDATION FAIL → DO NOTHING
  if (!form.username.trim() || !form.issuedescription.trim()) {
    setValidationMessage("Please provide username and issue description");
    return;
  }

  setValidationMessage("");
  setLoadingCreate(true);

  try {
    // ✅ API CALL
    await submitForm(e);

    // ✅ SUCCESS ONLY
    setSuccessPopup(true);

    // ✅ RESET FORM (ONLY HERE)
    setForm({ ...emptyForm });

    // ✅ CLEAR AUTOCOMPLETE
    setFilteredName([]);
    setFilteredPhone([]);
    setFilteredVin([]);
    setFocusedField(null);

    // ✅ CLEAR FILE INPUT
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // ✅ HIDE SUCCESS POPUP
    setTimeout(() => {
      setSuccessPopup(false);
    }, 2000);

  } catch (err) {
    // ❌ API FAILED → FORM STAYS AS IS
    console.error("Create ticket error:", err);
    setValidationMessage("Something went wrong. Try again.");
  } finally {
    setLoadingCreate(false);
  }
};

  const blackCard = {
    ...cardStyle,
    background: "#0a0a0a",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
  };

  const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    background: "#0f1318",
    color: "white",
    border: "1px solid rgba(255,255,255,0.10)",
    outline: "none",
  };

  const orangeBtn = {
    padding: "10px 16px",
    borderRadius: 20,
    background: "linear-gradient(to top right, #f97316, #facc15)",
    color: "black",
    border: "none",
    fontWeight: 400,
    cursor: "pointer",
  };

  const suggestionBoxStyle = {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    background: "#0f0f0f",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    maxHeight: 200,
    overflowY: "auto",
    zIndex: 1000,
  };

  const suggestionItemStyle = (isActive) => ({
    padding: 10,
    cursor: "pointer",
    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  });

 const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);


  return (
    <div style={{ padding: isMobile ? 12 : 18 }}>

      
      {/* VALIDATION POPUP */}
      {validationMessage && (
        <div
          style={{
            background: "#ffdddd",
            padding: 12,
            borderLeft: "5px solid red",
            marginBottom: 12,
            borderRadius: 8,
            color: "#a00000",
            fontWeight: 600,
          }}
        >
          {validationMessage}
        </div>
      )}

      {/* FULL SCREEN LOADER */}
      {loadingCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backdropFilter: "blur(6px)",
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            color: "white",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              border: "6px solid rgba(255,255,255,0.2)",
              borderTop: "6px solid #facc15",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />

          <div style={{ marginTop: 20, fontSize: 20, fontWeight: 600 }}>
            Creating ticket...
          </div>

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {successPopup && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(1)",
            background: "#0f0f0f",
            padding: "25px 40px",
            borderRadius: 16,
            border: "1px solid #22c55e",
            zIndex: 9999,
            textAlign: "center",
            animation: "pop 0.3s ease-out",
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 10,
              color: "#22c55e",
            }}
          >
            ✓
          </div>

          <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>
            Ticket Raised Successfully!
          </div>

          <style>{`
            @keyframes pop {
              0% { transform: scale(0.7); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* HEADER */}
     <div
  style={{
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    marginBottom: 12,
  }}
>
  <h2 style={{ marginBottom: isMobile ? 8 : 0 }}>
    {isEditing ? "Edit ticket" : "Raise ticket"}
  </h2>

  <div
    style={{
      display: "flex",
      gap: 8,
      justifyContent: "flex-end",
    }}
  >
    <button style={orangeBtn} onClick={() => {
      setScreen("list");
      setSelected(null);
    }}>
      Back
    </button>

    <button style={orangeBtn} onClick={() => setForm({ ...emptyForm })}>
      Clear
    </button>
  </div>
</div>


      {/* FORM */}
      <form
      onSubmit={handleCreateTicket}
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
        gap: 20,
      }}
    >

        {/* LEFT */}
        <div style={blackCard}>
          {/* NAME */}
          <div style={{ marginBottom: 20, position: "relative" }}>
            <label style={{ color: "#ccc" }}>Customer name *</label>

            <input
              type="text"
              value={form.username}
              onChange={(e) => handleCustomerNameChange(e.target.value)}
              placeholder="Enter customer name"
              style={{ ...inputStyle, marginTop: 6 }}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setTimeout(() => setFocusedField(null), 150)}
              onKeyDown={handleKeyDownOnName}
            />

            {filteredName.length > 0 && focusedField === "name" && (
              <div style={suggestionBoxStyle} ref={nameListRef}>
                {filteredName.map((c, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveNameIndex(index)}
                    onMouseDown={() => selectCustomer(c)}
                    style={suggestionItemStyle(index === activeNameIndex)}
                  >
                    {c.ownername} — {c.phonenumber}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PHONE */}
          <div style={{ marginBottom: 20, position: "relative" }}>
            <label style={{ color: "#ccc" }}>Phone number</label>

            <input
              type="text"
              value={form.phonenum}
              onChange={handlePhoneChange}
              placeholder="Search phone"
              style={{ ...inputStyle, marginTop: 6 }}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setTimeout(() => setFocusedField(null), 150)}
              onKeyDown={handleKeyDownOnPhone}
            />

            {filteredPhone.length > 0 && focusedField === "phone" && (
              <div style={suggestionBoxStyle} ref={phoneListRef}>
                {filteredPhone.map((c, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setActivePhoneIndex(index)}
                    onMouseDown={() => selectCustomer(c)}
                    style={suggestionItemStyle(index === activePhoneIndex)}
                  >
                    {c.phonenumber} — {c.ownername}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VIN */}
          <div style={{ marginBottom: 20, position: "relative" }}>
            <label style={{ color: "#ccc" }}>VIN number</label>

            <input
              type="text"
              value={form.vinnumber}
              onChange={handleVinChange}
              placeholder="Search VIN"
              style={{ ...inputStyle, marginTop: 6 }}
              onFocus={() => setFocusedField("vin")}
              onBlur={() => setTimeout(() => setFocusedField(null), 150)}
              onKeyDown={handleKeyDownOnVin}
            />

            {filteredVin.length > 0 && focusedField === "vin" && (
              <div style={suggestionBoxStyle} ref={vinListRef}>
                {filteredVin.map((c, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveVinIndex(index)}
                    onMouseDown={() => selectCustomer(c)}
                    style={suggestionItemStyle(index === activeVinIndex)}
                  >
                    {c.vinnumber} — {c.ownername}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRIORITY */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#ccc" }}>Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleFormChange}
              style={{ ...inputStyle, marginTop: 6 }}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* SUBMIT */}
          {/* SUBMIT – HIDE ON MOBILE */}
        {!isMobile && (
          <div style={{ textAlign: "right" }}>
            <button type="submit" style={orangeBtn}>
              {isEditing ? "Save Changes" : "Create Ticket"}
            </button>
          </div>
        )}

        </div>

        {/* RIGHT */}
       <div
      style={{
        ...blackCard,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <label style={{ color: "#ccc" }}>Full description *</label>
        <textarea
          name="issuedescription"
          value={form.issuedescription}
          onChange={handleFormChange}
          rows={7}
          style={{ ...inputStyle, marginTop: 6 }}
        />
      </div>

      <div>
        <label style={{ color: "#ccc" }}>Attachment</label>
        <input
          type="file"
          name="imageFile"
          onChange={handleFormChange}
          style={{ marginTop: 10 }}
        />
  </div>

  {/* CREATE BUTTON – MOBILE BOTTOM */}
  {isMobile && (
    <div style={{ marginTop: 20, textAlign: "right" }}>
      <button type="submit" style={orangeBtn}>
        {isEditing ? "Save Changes" : "Create Ticket"}
      </button>
    </div>
  )}
</div>

      </form>
    </div>
  );
}


// Main TicketUi
function TicketUi()  {
  const [screen, setScreen] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [dashboardStatus, setDashboardStatus] = useState(null);

  
    const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "error"
  });

  const emptyForm = useMemo(() => ({
    issueTitle: "",
    vinnumber: "",
    username: "",
    phonenum: "",
    issuedescription: "",
    priority: "Low",
    techteamtouser: "",
    techteamtomember: "",
    status: "NEW",
    imageFile: null,
    category: "Software",
  }), []);

  const [form, setForm] = useState(() => ({ ...emptyForm }));

  const headerStyle = useMemo(() => ({
    background: THEME.card,
    borderBottom: `2px solid ${THEME.accent}`,
    color: THEME.text,
    padding: "12px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }), []);

  const sidebarStyle = useMemo(() => ({
    width: 260,
    background: THEME.card,
    padding: 20,
    color: THEME.text,
    minHeight: "100vh",
    borderRight: `1px solid ${THEME.border}`
  }), []);

  const cardStyle = useMemo(() => ({
    background: THEME.card,
    color: THEME.text,
    borderRadius: 10,
    padding: 14,
    border: `1px solid ${THEME.border}`
  }), []);

  // ---- Networking helpers (update local state optimistically) ----
async function loadTickets() {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch("https://sb.rivotmotors.com/api/tickets");
    if (!res.ok) throw new Error(`GET failed: ${res.status}`);

    const data = await res.json();
    const list = Array.isArray(data) ? data : [];

    const sorted = list.sort(
      (a, b) =>
        new Date(b.ticketraisedtime || b.createdAt) -
        new Date(a.ticketraisedtime || a.createdAt)
    );

    setTickets(sorted);
  } catch (err) {
    console.error(err);
    setError(err.message || String(err));
    setTickets([]);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadTickets();
  }, []);

  function buildFormData(payload) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === "imageFile" && v instanceof File) fd.append("image", v);
      else fd.append(k, String(v));
    });
    return fd;
  }

  // createTicket: call server then add result to local state (no full reload)
  const createTicket = useCallback(async (payload) => {
    const fd = buildFormData(payload);
    const res = await fetch(`${API_BASE}/create`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Create failed: ${res.status}`);
    const created = await res.json();
    // optimistic: append created (if created returned)
    if (created) {
      setTickets(prev => {
        // if server returned full ticket, use it
        if (created.id) return [created, ...prev];
        // else just reload (safe fallback)
        return prev;
      });
    }
    return created;
  }, []);

  // updateTicket: call server and update local tickets state
const updateTicket = async (id, payload) => {
  try {
    const res = await fetch(`https://sb.rivotmotors.com/api/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Update failed: ${res.status} ${msg}`);
    }

    const updatedTicket = await res.json();

    // Update local tickets list if you have setTickets
    if (typeof setTickets === "function") {
      setTickets(prev =>
        prev.map(t => (String(t.id) === String(id) ? updatedTicket : t))
      );
    }

    // Return the updated ticket
    return updatedTicket;
  } catch (err) {
    console.error("updateTicket error:", err);
    throw err;
  }
};

  // deleteTicket: remove locally and call server
  const deleteTicket = useCallback(async (id) => {
    if (!window.confirm("Delete ticket?")) return;
    // optimistic local delete
    setTickets(prev => prev.filter(t => String(t.id) !== String(id)));
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    } catch (err) {
      alert("Delete failed: " + (err.message || err));
      // reload to re-sync
      await loadTickets();
    } finally {
      setScreen("list");
      setSelected(null);
    }
  }, []);

  // openCreate / openEdit
  function openCreate() {
    setForm({ ...emptyForm });
    setIsEditing(false);
    setSelected(null);
    setScreen("raise");
  }

  function openEdit(ticket) {
    setForm({
      issueTitle: ticket.issueTitle || (ticket.issuedescription ? String(ticket.issuedescription).slice(0, 60) : ""),
      vinnumber: ticket.vinnumber || "",
      username: ticket.username || "",
      phonenum: ticket.phonenum || "",
      issuedescription: ticket.issuedescription || ticket.description || "",
      priority: ticket.priority || "Low",
      techteamtouser: ticket.techteamtouser || "",
      techteamtomember: ticket.techteamtomember || "",
      // ensure status uses DB enum casing (upper)
      status: (ticket.status || "NEW").toString().toUpperCase(),
      imageFile: null,
      category: ticket.category || "Software",
    });
    setIsEditing(true);
    setSelected(ticket);
    setScreen("raise");
  }

  // Submit form (create or update); uses createTicket/updateTicket above
  const submitForm = useCallback(async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!form.username || !form.issuedescription) {
      alert("Please provide username and issue description");
      return;
    }
    try {
      if (isEditing && selected) {
        // optimistic local update for smoother UX
        setTickets(prev => prev.map(t => (String(t.id) === String(selected.id) ? ({ ...t, ...form }) : t)));
        await updateTicket(selected.id, { ...form });
        alert("Ticket updated");
        setScreen("view");
        // setSelected updated inside updateTicket
      } else {
        const created = await createTicket(form);
        // alert("Ticket created");
        const id = created?.id || created?.ticketId || created?.id;
        if (id) {
          // fetch the created ticket (server canonical)
          const res = await fetch(`${API_BASE}/${id}`);
          const t = (res.ok ? await res.json() : null);
          if (t) {
            setSelected(t);
            setScreen("view");
          } else {
            // fallback: refresh
            await loadTickets();
            setScreen("list");
          }
        } else {
          // fallback reload
          await loadTickets();
          setScreen("list");
        }
      }
    } catch (err) {
      alert("Operation failed: " + (err.message || err));
      // re-sync
      await loadTickets();
    }
  }, [form, isEditing, selected, createTicket, updateTicket]);

  // handleFormChange stable
  const handleFormChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setForm(p => ({ ...p, [name]: files[0] }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  }, []);

  // derived lists
  const filteredTickets = useMemo(() => {
    const q = (search || "").toString().trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((t) => {
      const fields = [t.id, t.username, t.vinnumber, t.issuedescription, t.description].map((f) => (f || "").toString().toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [tickets, search]);

  const trendData = useMemo(() => {
    const days = 7;
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ key, label: d.toLocaleDateString(undefined, { weekday: "short" }), total: 0 });
    }
    tickets.forEach((t) => {
      const dt = new Date(t.ticketraisedtime || t.createdAt || Date.now());
      const k = dt.toISOString().slice(0, 10);
      const idx = out.findIndex((o) => o.key === k);
      if (idx >= 0) out[idx].total++;
    });
    return out.map((o) => ({ day: o.label, tickets: o.total }));
  }, [tickets]);


  const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0d1117",
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #1f2937",
          boxShadow: "0px 4px 14px rgba(0,0,0,0.4)",
          color: "#e5e7eb",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {payload[0].value} Tickets
        </div>
      </div>
    );
  }
  return null;
};


const summaryCard = {
  background: "linear-gradient(145deg, #0e1621, #0a0f16)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  padding: 18,
  borderRadius: 14,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  transition: "0.25s",
  cursor: "pointer",
};

const summaryCardHover = {
  transform: "translateY(-3px)",
  boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
};
 

  // Small components (moved inside main for clarity)
  function DashboardPage() {
  const isMobile = window.innerWidth <= 768;

  const total = tickets.length;
  const open = tickets.filter(t => (t.status || "").toUpperCase() === "NEW").length;
  const inProgress = tickets.filter(t => (t.status || "").toUpperCase() === "IN_PROGRESS").length;
  const totalOnHold = tickets.filter(t => t.status === "ON_HOLD").length;
  const closed = tickets.filter(t => (t.status || "").toUpperCase() === "CLOSED").length;

  return (
    <div style={{ padding: isMobile ? 12 : 18 }}>
      <h2 style={{ marginBottom: 16, fontSize: isMobile ? 18 : 22 }}>
        Dashboard
      </h2>

      {/* SUMMARY CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
          gap: 16,
          marginBottom: 18,
        }}
      >
        {[
          { label: "Total", value: total, status: null },
          { label: "New", value: open, status: "NEW" },
          { label: "In Progress", value: inProgress, status: "IN_PROGRESS" },
          { label: "On Hold", value: totalOnHold, status: "ON_HOLD" },
          { label: "Closed", value: closed, status: "CLOSED" },
        ].map((item, i) => (
          <div
             key={i}
              style={{ ...summaryCard, cursor: "pointer" }}
              onClick={() => {
                setDashboardStatus(item.status);
                setScreen("list");
              }}
            onMouseEnter={e => Object.assign(e.currentTarget.style, summaryCardHover)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, summaryCard)}
          >
            <div style={{ fontSize: isMobile ? 12 : 14, color: THEME.muted }}>
              {item.label}
            </div>
            <div
              style={{
                fontSize: isMobile ? 22 : 28,
                fontWeight: 700,
                color: item.color || THEME.text,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* TREND */}
      <div style={cardStyle}>
        <h4 style={{ marginTop: 0 }}>Ticket Trend</h4>
        <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="day" stroke={THEME.muted} />
            <YAxis stroke={THEME.muted} />
            <Tooltip  content={<CustomTooltip />}/>
            <Line type="monotone" dataKey="tickets" stroke={THEME.accent} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

  const formatTime = (ts) => {
  if (!ts) return "-";
  return new Date(ts).toLocaleString(); 
};


function TicketsListPage() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
const statusRef = useRef(null);
const [refreshing, setRefreshing] = useState(false);
const [statusFilter, setStatusFilter] = useState({
  NEW: true,
  IN_PROGRESS: true,
  CLOSED: true,
  ON_HOLD:true,
});

// ✅ ADD: toggle checkbox
function toggleStatus(status) {
  setStatusFilter((prev) => ({
    ...prev,
    [status]: !prev[status],
  }));
}


const handleRefresh = async () => {
  setRefreshing(true);

  await loadTickets();

  setTimeout(() => {
    setRefreshing(false);
  }, 500);
};

useEffect(() => {
  function handleClickOutside(e) {
    if (statusRef.current && !statusRef.current.contains(e.target)) {
      setStatusOpen(false);
    }
  }
  
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  async function loadTickets() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("GET failed: " + res.status);
      let data = await res.json();

      // sort newest first
      // ✅ sort by raised time (latest first)
        data = data.sort((a, b) => new Date(b.ticketraisedtime) - new Date(a.ticketraisedtime));


      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  // -----------------------------
  // 🚀 LIVE SEARCH FILTER
  // -----------------------------
const filteredTickets = tickets.filter((t) => {
  if (!statusFilter[t.status]) return false;
  if (!search) return true;

  const s = search.toLowerCase().replace(/\s+/g, "");

  const phone =
    t.phone ||
    t.phonenum ||
    t.mobile ||
    t.user?.phone ||
    t.user?.mobile ||
    t.user?.phonenumber ||
    "";

  return (
    t.id?.toString().includes(s) ||
    t.vinnumber?.toLowerCase()?.includes(s) ||
    t.username?.toLowerCase()?.includes(s) ||
    phone.toString().replace(/\s+/g, "").includes(s) ||
    t.description?.toLowerCase()?.includes(s)
  );
});


 const deleteTicket = useCallback(async (id) => {
    setDeleting(true);

    // Optimistic delete
    setTickets(prev => prev.filter(t => String(t.id) !== String(id)));

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    } catch (err) {
      alert("Delete failed: " + (err.message || err));
      await loadTickets(); // re-sync if deletion fails
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setScreen("list");
      setSelected(null);
      setTicketToDelete(null);
    }
  }, [setTickets, loadTickets, setScreen, setSelected]);

  const handleDeleteClick = (ticket) => {
    setTicketToDelete(ticket);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmed = () => {
   
    if (ticketToDelete) deleteTicket(ticketToDelete.id);
     setScreen("list");
    setSelected(null);
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  

  <style>{`
/* ---------- MOBILE VIEW FIX ---------- */
@media (max-width: 768px) {

  .tickets-header {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px;
  }

  .tickets-actions {
    flex-direction: column !important;
    gap: 10px;
  }

  .tickets-search {
    width: 100% !important;
  }

  .tickets-table {
    min-width: unset !important;
  }

  table thead {
    display: none;
  }

  table tr {
    display: block;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding: 12px;
  }

  table td {
    display: flex;
    justify-content: space-between;
    padding: 6px 0 !important;
    font-size: 13px;
  }

  table td::before {
    content: attr(data-label);
    color: #aaa;
    font-weight: 500;
  }

  .action-buttons {
    flex-direction: column !important;
    gap: 8px !important;
  }

  .delete-modal {
    width: 90% !important;
  }
}
`}</style>




return (
  <div
    style={{
      padding: 28,
      background: "linear-gradient(135deg, #0f0f0f, #1a1a1a)",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "Inter, sans-serif",
    }}
  >
    <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          position: "relative",
          zIndex: 100,
          background: "rgba(255,255,255,0.06)",
          padding: "16px 20px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
          All tickets
        </h2>

        <div className="tickets-actions" style={{ display: "flex", gap: 12, alignItems: "center" }}>

          {/* SEARCH */}
          <input
            placeholder="Search by ID / VIN / Name / Phone / Description"
            value={search}
            className="tickets-search"
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              width: "300px",
              
              outline: "none",
              fontSize: 14,
            }}
          />
         
          {/* CREATE */}
          <button
            onClick={openCreate}
            style={{
              background: "linear-gradient(135deg, #ffba42, #ff8c00)",
              color: "#000",
              padding: "10px 16px",
              borderRadius: 10,
              // fontWeight: 600
              boxShadow: "0 4px 14px rgba(255,165,50,0.5)",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            + Raise ticket
          </button>
           <button
            className={`refresh-btn ${refreshing ? "refreshing" : ""}`}
           onClick={loadTickets}
            style={{
              background: "linear-gradient(135deg, #ffba42, #ff8c00)",
              color: "#000",
              padding: "10px 16px",
              borderRadius: 10,
              boxShadow: "0 4px 14px rgba(255,165,50,0.5)",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
            }}
  >
   <span className={refreshing ? "spin" : ""}>↻ Refresh</span>
  </button>
        </div>
    </div>

    {/* TABLE CARD */}
    <div
     style={{
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    position: "relative",
    zIndex: 1,
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
        boxShadow: "0 8px 35px rgba(0,0,0,0.45)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
         className="tickets-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
     <thead>
  <tr style={{ background: "rgba(255,255,255,0.05)" }}>
    {["ID", "VIN", "User", "Priority", "Status", "Actions", "Raised time"].map(
      (label) => (
        <th
          key={label}
          style={{
            padding: 16,
            textAlign: "left",
            color: "#ccc",
            fontSize: 14,
            letterSpacing: 0.5,
            fontWeight: 500,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
          }}
        >
          {label === "Status" ? (
            <div
              ref={statusRef}
              style={{ position: "relative", display: "inline-block" }}
            >
              {/* BUTTON */}
              <button
                onClick={() => setStatusOpen((v) => !v)}
                style={{
                  cursor: "pointer",
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Status
               <span
  style={{
    color: "#7dff8b",
    fontSize: 20,               // ✅ GREEN ARROW
    transition: "transform 0.3s ease",
    transform: statusOpen ? "rotate(180deg)" : "rotate(0deg)",
  }}
>
  ▾
</span>
          </button>
              {/* DROPDOWN */}
              {statusOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "120%",
                    left: 0,
                    background: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    minWidth: 160,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                    zIndex: 9999,
                  }}
                >
                  {["NEW", "IN_PROGRESS","ON_HOLD", "CLOSED"].map((status) => (
                    <label
                      key={status}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#ddd",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={statusFilter[status]}
                        onChange={() => toggleStatus(status)}
                      />
                      {status}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            label
          )}
        </th>
      )
    )}
  </tr>
</thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: 28, textAlign: "center", color: "#888" }}
                >
                  No tickets found
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td data-label="ID" style={{ padding: 16 }}>{t.id}</td>
                  <td style={{ padding: 16 }}>{t.vinnumber}</td>
                  <td style={{ padding: 16 }}>{t.username}</td>
                  <td style={{ padding: 16 }}>{t.priority}</td>
                  <td style={{ padding: 16 }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        color:
                          t.status === "NEW"
                            ? "#58a6ff"
                            : t.status === "IN_PROGRESS"
                            ? "#ffd86b"
                            : t.status === "CLOSED"
                            ? "#7dff8b"
                            : "#ccc",
                        fontWeight: 600,
                      }}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td style={{ padding: 16 }}>
                    <div className="action-buttons" style={{ display: "flex", gap: 10 }}>


                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`${API_BASE}/${t.id}`);
                            const data = await res.json();
                            setSelected(data);
                          } catch {
                            setSelected(t);
                          }
                          setScreen("view");
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          background: "rgba(0,140,255,0.2)",
                          border: "1px solid rgba(0,140,255,0.4)",
                          color: "#58a6ff",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>

                      <button
            onClick={() => handleDeleteClick(t)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: "rgba(255,0,0,0.15)",
              border: "1px solid rgba(255,0,0,0.4)",
              color: "#ff6a6a",
              fontWeight: 600,
              cursor: "pointer",
              marginLeft: 12,
            }}
          >
            Delete
          </button>
                    </div>
                  </td>

                  <td style={{ padding: 16 }}>{formatTime(t.ticketraisedtime)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
          className="delete-modal"
            style={{
              background: "#0f0f0f",
              borderRadius: 16,
              padding: "24px 28px",
              width: "90%",
              maxWidth: 380,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
              animation: "pop 0.2s ease-out",
            }}
          >
            <h3 style={{ margin: 0, color: "#fff", fontSize: 18 }}>
              Delete Ticket?
            </h3>
            <p style={{ color: "#aaa", marginTop: 10, fontSize: 14 }}>
              
              Do you want to delete this ticket permanently?

            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button

                onClick={handleDeleteConfirmed}
                
                disabled={deleting}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes pop {
              0% { transform: scale(0.85); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    
  </div>
);
}

const actionBtn = {
  padding: "6px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
  transition: "0.2s",
};

const sideButton = {
  display: "flex",
  alignItems: "center",
  background: "rgba(255,255,255,0.03)",
  color: "#d2d7e0",
  padding: "12px 14px",
  fontSize: 15,
  fontWeight: 500,
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  transition: "0.25s",
  textAlign: "left",
};

const activeSideButton = {
  background: "rgba(255,149,0,0.12)",
  color: THEME.accent,
  fontWeight: 700,
  borderLeft: `4px solid ${THEME.accent}`,
  paddingLeft: 18,
  boxShadow: "0 0 12px rgba(255,149,0,0.25)",
};


const inputStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  background: "rgba(10, 15, 25, 0.8)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dce3f1",
  fontSize: 14,
  width: "100%",
};

const inputWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const submitButton = {
  padding: "12px 16px",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 10,
  border: "none",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  transition: "0.2s",
};

const buttonBase = {
  padding: "8px 14px",
  borderRadius: "8px",
  fontWeight: 500,
  cursor: "pointer",
  border: "none",
  transition: "0.2s",
};


function TicketViewPage(props) {
  const {
    selected: selectedProp,
    setScreen = () => {},
    setSelected = () => {},
    setTickets = null,
    tickets = null,
    smallDate = null,
  } = props;

const t = selectedProp || (typeof selected !== "undefined" ? selected : null);
  const [showImage, setShowImage] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConvo, setLoadingConvo] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const [noteText, setNoteText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [localStatus, setLocalStatus] = useState((t && t.status) || "NEW");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [deleting, setDeleting] = useState(false);




  const scrollRef = useRef(null);
  const API_BASE = "https://sb.rivotmotors.com";

const [showClosePopup, setShowClosePopup] = useState(false);

// const isClosed = (t?.status || "").toUpperCase() === "CLOSED";


const [isClosed, setIsClosed] = useState(
  t?.status === "CLOSED"
);
 
useEffect(() => {
  if (t?.status === "CLOSED") {
    setIsClosed(true);
  }
}, [t?.status]);

  // --- Load conversation on ticket change ---
  useEffect(() => {
  setNoteText("");
  setIsPublic(true);

  // ✅ only sync from DB ONCE, not every render
  if (t?.status && localStatus === undefined) {
    setLocalStatus(t.status);
  }

  if (t?.id) {
    loadConversation();
  } else {
    setConversations([]);
  }
}, [t?.id]);


  // --- Toast helper ---
  function showToast(msg, ms = 2500) {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  }

  // --- Filter conversations ---
  function visibleConversations() {
    if (filter === "ALL") return conversations;
    if (filter === "PUBLIC") {
      return conversations.filter(
        (c) =>
          (c.techteamtouser && c.techteamtouser.trim() !== "") ||
          (c.comment && c.comment.trim() !== "")
      );
    }
    return conversations.filter(
      (c) => c.techteamtomember && c.techteamtomember.trim() !== ""
    );
  }


  const handleBack = () => {
  setSelected(null);
  setScreen("list");
};

function handleNoteChange(v) {
  setNoteText(v);

  // only update LOCAL state
  if (localStatus === "NEW") {
    setLocalStatus("IN_PROGRESS");
  }
}

  // --- Load conversation ---
  async function loadConversation() {
    if (!t?.id) return;
    setLoadingConvo(true);
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${t.id}/conversation`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
      setTimeout(() => {
        if (scrollRef.current)
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 80);
    } catch (err) {
      console.error(err);
      showToast("Failed to load conversation");
    } finally {
      setLoadingConvo(false);
    }
  }

  // --- Update ticket via multipart/form-data ---
  async function updateTicketFormData(id, data) {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    }
    const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }

  // --- Add note and maybe update status ---
async function doSaveNoteAndMaybeStatusChange(forceStatus) {
  if (!t?.id) return;

  if (!noteText.trim()) {
    showToast("Please enter a message before saving.");
    return;
  }

  setSending(true);
  try {
    const payload = new URLSearchParams();

    if (isPublic) {
      payload.append("techteamtouser", noteText);
      payload.append("techteamtomember", "");
      payload.append("comment", "");
    } else {
      payload.append("techteamtouser", "");
      payload.append("techteamtomember", noteText);
      payload.append("comment", "");
    }

    // 1️⃣ Save note
    const res = await fetch(
      `${API_BASE}/api/tickets/${t.id}/conversation/add`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
      }
    );

    if (!res.ok) throw new Error(await res.text());

    // 2️⃣ ONLY update status if forceStatus is passed
    if (forceStatus) {
    await updateTicketFormData(t.id, { status: forceStatus });

      if (setTickets && Array.isArray(tickets)) {
        setTickets(prev =>
          prev.map(x =>
            String(x.id) === String(t.id)
              ? { ...x, status: forceStatus }
              : x
          )
        );
      }
    }

    // Mark the note as a closing note for the UI
if (forceStatus === "CLOSED") {
  setConversations(prev => [
    ...prev,
    {
      text: noteText,
      isPublic,
      created_time: new Date().toISOString(),
      author: "You",
      isClosingNote: true, // ← THIS FLAG
      techteamtouser: isPublic ? noteText : "",
      techteamtomember: !isPublic ? noteText : "",
      comment: "",
    },
  ]);
}

    setNoteText("");
    setIsPublic(true);
    setShowClosePopup(false);
    await loadConversation();
    
    showToast(
      forceStatus === "CLOSED"
        ? "Ticket closed successfully"
        : "Note added successfully"
    );

    if (forceStatus === "CLOSED") {
      setSelected(null);
      setScreen("list");
    }

    console.log("Navigating to list");

  } catch (err) {
    console.error(err);
    showToast("Failed to save note");
  } finally {
    setSending(false);
  }
}


  // --- Handle status change ---
const handleStatusChange = async (e) => {
  const newStatus = e.target.value;
  setLocalStatus(newStatus);

  try {
    await updateTicketFormData(t.id, { status: newStatus });

    if (setTickets && Array.isArray(tickets)) {
      setTickets(prev =>
        prev.map(x =>
          String(x.id) === String(t.id)
            ? { ...x, status: newStatus }
            : x
        )
      );
    }

    if (setSelected) {
      setSelected(prev => prev ? { ...prev, status: newStatus } : prev);
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to update status");
  }
};


const validateCloseWithNote = () => {
  if (!noteText || noteText.trim() === "") {
    showToast("Please enter a closing note before closing the ticket");
    return false;
  }
  return true;
};


const handleMainSave = async () => {
  if (!localStatus) {
    showToast("Please select a status");
    return;
  }

  if (localStatus === "CLOSED") {
    if (!validateCloseWithNote()) return;
    setShowClosePopup(true);
    return;
  }

  await updateTicketFormData(t.id, { status: localStatus });
  showToast("Status updated");
};




  // --- Handle delete ticket ---
  async function handleDeleteConfirmed() {
  if (!t?.id) return;

  setDeleting(true);
  try {
    const res = await fetch(`${API_BASE}/api/tickets/${t.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error(await res.text());

    showToast("Ticket deleted");

    setSelected(null);
    setScreen("list");

    if (setTickets) {
      setTickets((prev) =>
        prev.filter((x) => String(x.id) !== String(t.id))
      );
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to delete ticket");
  } finally {
    setDeleting(false);
    setShowDeleteConfirm(false);
  }
}

  function ConvoItem({ c }) {
    const isInternal =
      c.techteamtomember && c.techteamtomember.trim() !== "";
    const hasPublic =
      (c.techteamtouser && c.techteamtouser.trim() !== "") ||
      (c.comment && c.comment.trim() !== "");
    const timeStr = c.created_time
      ? new Date(c.created_time).toLocaleString()
      : "";

    return (
      <div
    className={`relative mb-4 flex gap-4 rounded-xl border bg-slate-900 p-4 shadow-sm transition ${
      isInternal
        ? "border-orange-500/30"
        : "border-slate-800"
    }`}
  >
    {/* LEFT ACCENT BAR */}
    <div
      className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
        isInternal ? "bg-orange-500" : "bg-sky-500"
      }`}
    />

    {/* AVATAR */}
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold ${
        isInternal
          ? "bg-orange-500/15 text-orange-400"
          : "bg-sky-500/15 text-sky-400"
      }`}
    >
      {isInternal ? "IN" : "TU"}
    </div>

  {/* CONTENT */}
  <div className="flex-1">
    {/* HEADER */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-semibold ${
            isInternal ? "text-orange-300" : "text-sky-300"
          }`}
        >
          {isInternal
            ? "Internal Note"
            : hasPublic
            ? "Tech team to user"
            : "Note"}
        </span>

        {/* {isInternal && (
          <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
            Internal
          </span>
        )} */}
      </div>

      <div className="text-xs text-slate-400">{timeStr}</div>
    </div>

    {/* BODY */}
    <div className="mt-3 space-y-1 text-sm text-slate-200 leading-relaxed">
       {c.isClosingNote && (
    <div className="mb-1 text-yellow-300 font-bold uppercase">
      🚨 Closing Note:
    </div>
  )} 
      {c.techteamtouser && (
        <div>
          <span className="text-slate-400">To User:</span>{" "}
          <span className="text-slate-100">{c.techteamtouser}</span>
        </div>
      )}

      {c.techteamtomember && (
        <div>
          <span className="text-slate-400">To Member:</span>{" "}
          <span className="text-slate-100">{c.techteamtomember}</span>
        </div>
      )}

      {c.comment && (
        <div>
          <span className="text-slate-400">Comment:</span>{" "}
          <span className="text-slate-100">{c.comment}</span>
        </div>
      )}
    </div>
  </div>
</div>

    );
  }

  
  if (!t) return <div className="p-6 text-slate-400">Ticket not selected</div>;

  const orangeBtn = {
    padding: "10px 16px",
    borderRadius: 20,
    background: "linear-gradient(to top right, #f97316, #facc15)",
    color: "black",
    border: "none",
    fontWeight: 400,
    cursor: "pointer",
    transition: "0.3s",
  };


  

  // --- JSX return ---
  return (
    <div className="flex flex-col gap-6 p-6 text-slate-100">
      {/* Header */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-orange-400">Ticket #{t.id}</h1>
          <p className="text-sm text-slate-400 mt-1">{t.username || "-"} • {t.phonenum || "-"}</p>
        </div>
        <div className="flex gap-3 md:self-auto self-end">

         {/* <button style={orangeBtn} onClick={handleBack}>
  Back
</button> */}

          <button
  onClick={() => setShowDeleteConfirm(true)}
  className="px-3 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-500"
>
  Delete
</button>
        </div>
      </div>

    {/* Customer Info & Image */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

  {/* Customer Info */}
  <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-4 md:p-6">

  <h3 className="text-md font-semibold text-slate-300 mb-4">Customer Info</h3>
   <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-y-2 md:gap-y-3 gap-x-6 text-sm">

      <div className="text-slate-400">Customer name :</div>
      <div className="text-slate-100 font-medium">{t.username || "-"}</div>
      <div className="text-slate-400">Phone number :</div>
      <div className="text-slate-100 font-medium">{t.phonenum || "-"}</div>
      <div className="text-slate-400">VIN number :</div>
      <div className="text-slate-100 font-medium">{t.vinnumber || "-"}</div>
      <div className="text-slate-400">Priority :</div>
      <div className="text-slate-100 font-medium">{t.priority || "-"}</div>
      <div className="text-slate-400">Raised On :</div>
      <div className="text-slate-100 font-medium">
        {(() => {
          const date = new Date(t.ticketraisedtime || t.createdAt);
          let hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12 || 12; // 12-hour format
          const hh = String(hours).padStart(2, "0");
          const DD = String(date.getDate()).padStart(2, "0");
          const MM = String(date.getMonth() + 1).padStart(2, "0");
          const YYYY = date.getFullYear();
          return `${hh}:${minutes} ${ampm} ${DD}:${MM}:${YYYY}`;
        })()}
      </div>
    </div>
  </div>

  {/* Ticket Image */}
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
    <h3 className="text-md font-semibold text-slate-300">Ticket Image</h3>
    <div className="mt-4">
      {t.image ? (
        <img
          src={t.image.startsWith("data:image") ? t.image : `${API_BASE}/images/${t.image}`}
          alt="Ticket"
          onClick={() => setShowImage(true)}
          className="w-full h-[220px] md:h-[180px] object-contain rounded-md bg-slate-800 p-3 cursor-pointer"

        />
      ) : (
        <div className="text-slate-500">No Image</div>
      )}
    </div>
  </div>

  {/* Lightbox Modal */}
  {/* {showImage && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      onClick={() => setShowImage(false)} // click anywhere closes modal
    >
      <img
        src={t.image.startsWith("data:image") ? t.image : `${API_BASE}/images/${t.image}`}
        alt="Ticket"
        className="max-w-[92%] max-h-[92%] rounded-lg cursor-pointer"
        onClick={(e) => e.stopPropagation()} 
      />
      
    </div>
  )} */}
    </div>
      {/* Description */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Description</h4>
        <div className="text-sm text-slate-300 whitespace-pre-wrap">{t.issuedescription || t.description || "-"}</div>
      </div>

      {/* Notes Panel */}
     <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
     <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">


  {/* Left Title */}
  <h4 className="text-sm font-semibold text-slate-300">Notes</h4>

  {/* Right: Refresh + Filters */}
  <div className="flex flex-wrap items-center gap-3">

    {/* Refresh Button */}
    <button
      onClick={loadConversation}
      className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-200"
    >
      {loadingConvo ? "Refreshing..." : "Refresh"}
    </button>

    {/* Filter Buttons Block (All / User / Member) */}
    <div className="flex items-center gap-2 bg-[#0b1020] p-1 rounded-lg">

      <button
        onClick={() => setFilter("ALL")}
        className={`px-3 py-1 rounded-md text-sm font-semibold ${
          filter === "ALL"
            ? "bg-orange-400 text-black"
            : "text-slate-400"
        }`}
      >
        All
      </button>

      <button
        onClick={() => setFilter("PUBLIC")}
        className={`px-3 py-1 rounded-md text-sm font-semibold ${
          filter === "PUBLIC"
            ? "bg-orange-400 text-black"
            : "text-slate-400"
        }`}
      >
        User
      </button>

      <button
        onClick={() => setFilter("INTERNAL")}
        className={`px-3 py-1 rounded-md text-sm font-semibold ${
          filter === "INTERNAL"
            ? "bg-orange-400 text-black"
            : "text-slate-400"
        }`}
      >
        Member
      </button>
    </div>
  </div>

{showDeleteConfirm && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(6px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        background: "#0f0f0f",
        borderRadius: 16,
        padding: "24px 28px",
        width: "90%",
        maxWidth: 380,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
        animation: "pop 0.2s ease-out",
      }}
    >
      <h3 style={{ margin: 0, color: "#fff", fontSize: 18 }}>
        Delete Ticket?
      </h3>

      <p style={{ color: "#aaa", marginTop: 10, fontSize: 14 }}>
        Do you want to delete this ticket permanently?
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 20,
        }}
      >
        <button
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteConfirmed}
          disabled={deleting}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: "#dc2626",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            opacity: deleting ? 0.6 : 1,
          }}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>

    <style>{`
      @keyframes pop {
        0% { transform: scale(0.85); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
)}  
</div>

  {/* Conversation List */}
  <div ref={scrollRef} className="max-h-60 overflow-y-auto pr-3">
    {loadingConvo ? (
      <div className="text-slate-400">Loading conversation...</div>
    ) : visibleConversations().length === 0 ? (
      <div className="text-slate-400">No conversation yet</div>
    ) : (
      visibleConversations().map((c, idx) => <ConvoItem key={idx} c={c} />)
    )}
  </div>

  {/* New Note */}
  {!isClosed && (
  <div className="mt-4 border-t border-slate-800 pt-4">

    <div className="flex justify-between items-center mb-2">
      <label className="text-sm text-slate-300 font-medium">Technical team message</label>
      <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-md border border-slate-700">
        <button
          onClick={() => setIsPublic(true)}
          className={`px-3 py-1 text-sm font-semibold rounded-md ${
            isPublic ? "bg-orange-400 text-black" : "text-slate-400"
          }`}
        >
          Public
        </button>
        <button
          onClick={() => setIsPublic(false)}
          className={`px-3 py-1 text-sm font-semibold rounded-md ${
            !isPublic ? "bg-orange-400 text-black" : "text-slate-400"
          }`}
        >
          Private
        </button>
      </div>
    </div>

    <textarea
      value={noteText}
      onChange={(e) => handleNoteChange(e.target.value)}
      placeholder={isPublic ? "Message visible to user..." : "Internal note for team members..."}
      className="w-full min-h-[120px] p-3 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-200 resize-vertical"
    />

   <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-3">

  {/* LEFT SIDE → Status + SAVE */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

  {/* Status Dropdown */}
  <div className="relative">
    <select
      className="appearance-none pr-10 pl-4 py-2 rounded-lg bg-gray-900 border border-orange-500 text-orange-300 font-semibold focus:outline-none"
      value={localStatus.toUpperCase()}
      onChange={(e) => setLocalStatus(e.target.value)}
    >
      <option value="NEW">NEW</option>
      <option value="IN_PROGRESS">IN_PROGRESS</option>
      <option value="ON_HOLD">ON_HOLD</option>
      <option value="CLOSED">CLOSED</option>
    </select>

    {/* Down arrow */}
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-400">
      <svg
        className="w-4 h-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
      </svg>
    </span>
  </div>

  {/* Save button */}
  <button
    onClick={handleMainSave}
    className="px-4 py-2 rounded-md bg-green-500 text-black font-bold text-sm hover:bg-green-400"
  >
    Save Status
  </button>

</div>

  {/* RIGHT SIDE → Clear + Add */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

    <button
      onClick={() => setNoteText("")}
      className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-200"
    >
      Clear
    </button>

    <button
  onClick={() => {
    const autoStatuses = ["NEW", "IN_PROGRESS"];

    doSaveNoteAndMaybeStatusChange(
      autoStatuses.includes(localStatus) ? localStatus : null
    );
  }}
  disabled={sending}
  className={`px-5 py-2 rounded-md font-extrabold ${
    sending ? "bg-amber-300 text-black" : "bg-orange-400 text-black"
  } text-sm`}
>
  {sending ? "Adding" : "Add"}
</button>

 </div>
</div>
  </div>
)}
      </div>

{showImage && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
  
    <button
      onClick={() => setShowImage(false)}
      className="absolute top-28 right-6 z-50 bg-red-600 text-white px-3 py-2 rounded-md font-semibold"
    >
      ✕
    </button>
    <div className="relative w-full max-w-[90vmin] aspect-square bg-black rounded-lg flex items-center justify-center">

      <img
        src={t.image.startsWith("data:image") ? t.image : `${API_BASE}/images/${t.image}`}
        alt="Ticket"
        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
      />
    </div>
  </div>
)}

{showClosePopup && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[350px] text-center">
      <h2 className="text-lg font-bold text-orange-400 mb-3">
        Close Ticket?
      </h2>

      <p className="text-slate-300 mb-6">
        Do you want to close this ticket?
      </p>

      <div className="flex justify-center gap-4">
        {/* CANCEL */}
        <button
          onClick={() => setShowClosePopup(false)}
          className="px-4 py-2 bg-slate-700 text-white rounded-md"
          
        >
          Cancel
        </button>

        {/* CLOSE */}
    <button
  onClick={() => {
    if (!noteText.trim()) {
      showToast("Please enter a closing note");
      return;
    }
    doSaveNoteAndMaybeStatusChange("CLOSED");
  }}
  className="px-4 py-2 bg-red-500 text-white font-bold rounded-md" 
>
  Close
</button>
   </div>
  </div>
  </div>
)}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-sm text-slate-200 px-4 py-2 rounded-md shadow">
          {toast}
        </div>
      )}
    </div>
  );
}

  function AddCommentBox({ ticketId, onAdded }) {
    const [text, setText] = useState("");
    async function add() {
      if (!text.trim()) return;
      try {
        const res = await fetch(`${API_BASE}/${ticketId}`);
        if (!res.ok) throw new Error("fetch ticket failed");
        const t = await res.json();
        const comments = Array.isArray(t.comments) ? [...t.comments, { by: "You", text: text.trim(), time: new Date().toISOString() }] : [{ by: "You", text: text.trim(), time: new Date().toISOString() }];
        await updateTicket(ticketId, { comments: JSON.stringify(comments) });
        setText("");
        onAdded && onAdded();
      } catch (err) {
        alert("Add comment failed: " + (err.message || err));
      }
    }

    return (
      <div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add internal note" rows={3} style={{ width: "100%", padding: 8, borderRadius: 8, background: "#071018", color: THEME.text, border: `1px solid ${THEME.border}` }} />
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button onClick={add} style={{ background: THEME.accent, color: THEME.text, padding: "8px 12px", borderRadius: 8 }}>Add Comment</button>
          <button onClick={() => setText("")} style={{ padding: "8px 12px", borderRadius: 8, background: "transparent", color: THEME.text, border: `1px solid ${THEME.border}` }}>Cancel</button>
        </div>
      </div>
    );
  }

 const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);
 
 return (
  <div
    style={{
      display: "flex",
      minHeight: "100vh",
      background: THEME.background,
      color: THEME.text,
    }}
  >
    <aside
      style={{
        width: isMobile ? 70 : 250, // 👈 collapse on mobile
        minHeight: "100vh",
        background: "rgba(13, 17, 23, 0.85)",
        backdropFilter: "blur(8px)",
        padding: isMobile ? "18px 10px" : 22,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 30,
        boxShadow: "4px 0 20px rgba(0,0,0,0.25)",
        transition: "all 0.3s ease",
        flexShrink: 0,
      }}
    >
      {/* HEADER / BRAND */}
      <div style={{ textAlign: isMobile ? "center" : "left" }}>
        <div
          style={{
            color: THEME.accent,
            fontSize: isMobile ? 16 : 22,
            fontWeight: 200,
            marginBottom: 5,
          }}
        >
          {isMobile ? "TS" : "Ticket System"}
        </div>

        {!isMobile && (
          <div style={{ color: "#8b9bb5", fontSize: 13, opacity: 0.7 }}>
            Admin Panel
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  {[
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "raise", label: "Raise ticket", icon: PlusCircle },
    { id: "list", label: "All tickets", icon: Ticket },
  ].map((item) => (
    <button
      key={item.id}
      onClick={() => setScreen(item.id)}
      title={isMobile ? item.label : ""}
      style={{
        ...sideButton,
        ...(screen === item.id ? activeSideButton : {}),
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "center" : "flex-start",
        gap: isMobile ? 0 : 10,
      }}
    >
      {/* ICON */}
      <item.icon
        size={20}
        strokeWidth={2}
        color={screen === item.id ? THEME.accent : "#9aa4b2"}
      />

      {/* LABEL */}
      {!isMobile && (
        <span style={{ whiteSpace: "nowrap" }}>
          {item.label}
        </span>
      )}
    </button>
  ))}
</nav>
    </aside>


    {/* CONTENT */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, overflow: "auto" }}>
        {error && (
          <div style={{ padding: 12, color: "salmon" }}>
            Error: {error}
          </div>
        )}

        {screen === "dashboard" && <DashboardPage />}
        {screen === "list" && (
          <TicketsListPage
            tickets={tickets}
            setTickets={setTickets}
            setSelected={setSelected}
            setScreen={setScreen}
            
          />
        )}
        {screen === "view" && <TicketViewPage  selected={selected}
    setSelected={setSelected}
    tickets={tickets}
    setTickets={setTickets}
    setScreen={setScreen}  />}
        {screen === "raise" && (
          <RaiseTicketForm
            form={form}
            handleFormChange={handleFormChange}
            submitForm={submitForm}
            isEditing={isEditing}
            setForm={setForm}
            emptyForm={emptyForm}
            setScreen={setScreen}
            setSelected={setSelected}
            cardStyle={cardStyle}
          />
        )}
      </main>
    </div>

    <ConfirmPopup
      show={popup.show}
      message={popup.message}
      type={popup.type}
      onClose={() => setPopup({ ...popup, show: false })}
    />
  </div>
);
}

export default React.memo(TicketUi);

