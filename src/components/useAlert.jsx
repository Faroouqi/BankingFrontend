import { useState, useCallback, useEffect, useRef, createContext, useContext } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────
const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const { alerts, dismiss, success, error } = useAlertState();

  return (
    <AlertContext.Provider value={{ success, error }}>
      <AlertContainer alerts={alerts} onDismiss={dismiss} />
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}

// ─── Internal state hook ──────────────────────────────────────────────────────
function useAlertState() {
  const [alerts, setAlerts] = useState([]);

  const dismiss = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const success = useCallback((title, message) => {
    setAlerts((prev) => [...prev, { id: Date.now(), type: "success", title, message }]);
  }, []);

  const error = useCallback((title, message) => {
    setAlerts((prev) => [...prev, { id: Date.now(), type: "error", title, message }]);
  }, []);

  return { alerts, dismiss, success, error };
}

// ─── Single Alert Item ────────────────────────────────────────────────────────
const DURATION = 4000;

function AlertItem({ alert, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss(alert.id), 300);
  }, [alert.id, onDismiss]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);

    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        timerRef.current = requestAnimationFrame(tick);
      } else {
        dismiss();
      }
    };
    timerRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(timerRef.current);
    };
  }, [dismiss]);

  const isSuccess = alert.type === "success";

  const styles = {
    wrapper: {
      width: 320,
      background: "#ffffff",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
      border: `0.5px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
      borderTop: `3px solid ${isSuccess ? "#16a34a" : "#dc2626"}`,
      transform: visible ? "translateX(0)" : "translateX(110%)",
      opacity: visible ? 1 : 0,
      transition: "transform 0.35s cubic-bezier(0.34,1.3,0.64,1), opacity 0.3s ease",
    },
    body: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "14px 14px 10px 14px",
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      background: isSuccess ? "#dcfce7" : "#fee2e2",
    },
    icon: { width: 16, height: 16, color: isSuccess ? "#16a34a" : "#dc2626" },
    content: { flex: 1, minWidth: 0 },
    title: { fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 2, lineHeight: 1.3 },
    message: { fontSize: 12, color: "#6b7280", lineHeight: 1.5 },
    closeBtn: {
      background: "none", border: "none", cursor: "pointer",
      padding: 2, color: "#9ca3af", fontSize: 16, lineHeight: 1,
      flexShrink: 0, borderRadius: 4,
    },
    progressTrack: { height: 3, background: "#f3f4f6" },
    progressBar: {
      height: "100%",
      width: `${progress}%`,
      background: isSuccess ? "#16a34a" : "#dc2626",
      transition: "width 0.1s linear",
      borderRadius: "0 2px 2px 0",
    },
  };

  return (
    <div style={styles.wrapper} role="alert">
      <div style={styles.body}>
        <div style={styles.iconWrap}>
          {isSuccess ? (
            <svg style={styles.icon} viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg style={styles.icon} viewBox="0 0 16 16" fill="none">
              <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </div>
        <div style={styles.content}>
          <div style={styles.title}>{alert.title}</div>
          {alert.message && <div style={styles.message}>{alert.message}</div>}
        </div>
        <button style={styles.closeBtn} onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>
      <div style={styles.progressTrack}>
        <div style={styles.progressBar} />
      </div>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────
export function AlertContainer({ alerts, onDismiss }) {
  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none",
    }}>
      {alerts.map((a) => (
        <div key={a.id} style={{ pointerEvents: "all" }}>
          <AlertItem alert={a} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
