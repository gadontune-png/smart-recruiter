import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import Alert from "./Alert";
import "./common.css";

const ToastContext = createContext(null);

let toastCounter = 0;

function ToastItem({ toast, onDismiss }) {
  return (
    <Alert variant={toast.type ?? "info"} role="alert">
      {toast.message}
      <button
        type="button"
        className="modal-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{ marginLeft: "auto" }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </Alert>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      window.clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message, options = {}) => {
      const id = ++toastCounter;
      const type = options.type ?? "info";
      const duration = options.duration ?? 4000;
      setToasts((current) => [...current, { id, message, type }]);
      if (duration > 0) {
        const timeout = window.setTimeout(() => dismiss(id), duration);
        timeoutsRef.current.set(id, timeout);
      }
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      show,
      success: (message, options) => show(message, { ...options, type: "success" }),
      error: (message, options) => show(message, { ...options, type: "danger" }),
      warning: (message, options) => show(message, { ...options, type: "warning" }),
      info: (message, options) => show(message, { ...options, type: "info" }),
      dismiss,
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-container" aria-live="polite" role="status">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- custom hook paired with provider
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}