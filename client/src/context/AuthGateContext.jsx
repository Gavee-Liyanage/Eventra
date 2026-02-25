import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import AuthModal from "../components/AuthModal";

const AuthGateContext = createContext(null);

const safeGetUser = () => {
  try {
    return JSON.parse(localStorage.getItem("qs_user") || "null");
  } catch {
    return null;
  }
};

export const AuthGateProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [initialMode, setInitialMode] = useState("login");

  // what to do after successful login/signup
  const onSuccessRef = useRef(null);

  const openAuthGate = ({ mode = "login", onSuccess } = {}) => {
    setInitialMode(mode);
    onSuccessRef.current = typeof onSuccess === "function" ? onSuccess : null;
    setOpen(true);
  };

  const closeAuthGate = () => {
    setOpen(false);
    onSuccessRef.current = null;
  };

  const handleAuthSuccess = (user) => {
  setOpen(false);

  // ✅ NEW: broadcast auth change
  window.dispatchEvent(new CustomEvent("qs_auth_changed", { detail: user }));

  const fn = onSuccessRef.current;
  onSuccessRef.current = null;
  fn?.(user);
};

  const value = useMemo(
    () => ({
      openAuthGate,
      closeAuthGate,
      isAuthed: () => !!safeGetUser()?._id,
      getUser: safeGetUser,
    }),
    []
  );

  return (
    <AuthGateContext.Provider value={value}>
      {children}

      {/* ✅ render YOUR modal, unchanged */}
      <AuthModal
        isOpen={open}
        onClose={closeAuthGate}
        onAuthSuccess={handleAuthSuccess}
        initialMode={initialMode} // (only works if you added initialMode support)
      />
    </AuthGateContext.Provider>
  );
};

export const useAuthGate = () => {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error("useAuthGate must be used inside AuthGateProvider");
  return ctx;
};