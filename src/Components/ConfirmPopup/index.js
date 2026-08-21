import React from "react";

export default function ConfirmPopup({ show, title, message, img, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        width: 340,
        background: "#111",
        padding: 22,
        borderRadius: 12,
        color: "#fff",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)"
      }}>
        {img && (
          <img
            src={img}
            alt=""
            style={{ width: "100%", height: "auto", borderRadius: 10, marginBottom: 12 }}
          />
        )}

        <h3 style={{ marginBottom: 10 }}>{title}</h3>
        <p style={{ opacity: 0.8, fontSize: 14, marginBottom: 20 }}>{message}</p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 14px",
              background: "#333",
              borderRadius: 8,
              border: "none",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: "8px 14px",
              background: "#e63946",
              borderRadius: 8,
              border: "none",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
