import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

const API = "http://127.0.0.1:3000/api";
const SAVED_EMAIL_KEY = "qs_saved_email";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80";


const getStrength = (pw) => {
  const p = pw || "";
  let score = 0;

  if (p.length >= 6) score += 1;
  if (p.length >= 10) score += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
  if (/\d/.test(p)) score += 1;
  if (/[^A-Za-z0-9]/.test(p)) score += 1;

  let label = "Too weak";
  if (score >= 2) label = "Weak";
  if (score >= 3) label = "Okay";
  if (score >= 4) label = "Strong";
  if (score >= 5) label = "Very strong";

  const pct = Math.min(100, (score / 5) * 100);
  return { score, label, pct };
};

const Input = ({ icon: Icon, error, onEnterNext, ...props }) => (
  <div className="relative">
    <Icon
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
    />
    <input
      {...props}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnterNext) {
          e.preventDefault();
          onEnterNext();
        }
        props.onKeyDown?.(e);
      }}
      className={`
        w-full pl-11 pr-4 py-3 rounded-xl
        border bg-white/70 outline-none transition
        focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300
        ${
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-400"
            : "border-gray-200"
        }
      `}
    />
  </div>
);

const StrengthMeter = ({ password }) => {
  const { label, pct } = useMemo(() => getStrength(password), [password]);
  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Password strength</span>
        <span className="font-semibold text-gray-700">{label}</span>
      </div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const isLogin = mode === "login";

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [rememberEmail, setRememberEmail] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const submitBtnRef = useRef(null);

  const mismatch =
    !isLogin &&
    form.confirm.trim().length > 0 &&
    form.password.trim().length > 0 &&
    form.password !== form.confirm;

  useEffect(() => {
    if (!isOpen) return;

    setErrMsg("");
    setShowPassword(false);
    setShowConfirm(false);

    const saved = localStorage.getItem(SAVED_EMAIL_KEY) || "";
    setForm((p) => ({ ...p, email: saved || p.email }));

    setTimeout(() => {
      if (isLogin) emailRef.current?.focus();
      else nameRef.current?.focus();
    }, 0);
  }, [isOpen, mode, isLogin]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (isOpen) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  const canSubmit = useMemo(() => {
    const emailOk = form.email.trim().length > 3;
    const pwOk = form.password.length >= 6;

    if (isLogin) return emailOk && pwOk;

    const nameOk = form.name.trim().length >= 2;
    const confirmOk = form.password === form.confirm && form.confirm.length > 0;
    return nameOk && emailOk && pwOk && confirmOk;
  }, [form, isLogin]);

  const update =
    (key) =>
    (e) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const focus = (ref) => ref?.current?.focus?.();

  const submit = async (e) => {
  e.preventDefault();
  if (!canSubmit) return;

  setLoading(true);
  setErrMsg("");

  try {
    const payload =
      mode === "login"
        ? { email: form.email.trim(), password: form.password }
        : {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
          };

    const url =
      mode === "login" ? `${API}/auth/login` : `${API}/auth/register`;

    // inside submit() success:

    const res = await axios.post(url, payload, { withCredentials: true });
    const { token, user } = res.data;

    localStorage.setItem("qs_token", token);
    localStorage.setItem("qs_user", JSON.stringify(user));

    // tell the whole app "user logged in"
    window.dispatchEvent(new CustomEvent("qs_auth_changed", { detail: user }));

    if (mode === "login") {
      if (rememberEmail) localStorage.setItem(SAVED_EMAIL_KEY, form.email.trim());
      else localStorage.removeItem(SAVED_EMAIL_KEY);
    }

    onAuthSuccess?.(user);
    onClose?.();

    onAuthSuccess?.(user);
    onClose?.();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Server error";

    setErrMsg(msg);
  } finally {
    setLoading(false);
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-2xl animate-fadeIn">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/20 bg-white/80 backdrop-blur-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full bg-white/80 p-2 text-gray-600 hover:text-gray-900 shadow"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT IMAGE */}
            <div className="hidden md:block relative">
              <img
                src={AUTH_IMAGE}
                alt="auth"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/70 via-purple-700/40 to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              <div className="absolute bottom-0 p-8 text-white">
                <p className="inline-flex items-center gap-2 text-sm font-semibold bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                  QuickShow • Sri Lanka
                </p>
                <h3 className="mt-4 text-3xl font-extrabold leading-tight">
                  {isLogin ? "Welcome back." : "Join the crowd."}
                </h3>
                <p className="mt-2 text-white/80 text-sm">
                  {isLogin
                    ? "Login to save favorites, book tickets, and explore events near you."
                    : "Create an account to save favorites and book faster with QuickShow."}
                </p>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                    isLogin
                      ? "bg-indigo-600 text-white shadow"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                    !isLogin
                      ? "bg-indigo-600 text-white shadow"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Sign up
                </button>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                {isLogin ? "Welcome back 👋" : "Create your account ✨"}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {isLogin
                  ? "Login to continue discovering events."
                  : "Sign up to save favorites and book faster."}
              </p>

              {errMsg && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errMsg}
                </div>
              )}

              <form onSubmit={submit} className="mt-5 space-y-4 text-gray-800">
                {!isLogin && (
                  <Input
                    icon={User}
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Full name"
                    autoComplete="name"
                    onEnterNext={() => focus(emailRef)}
                  />
                )}

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    ref={emailRef}
                    value={form.email}
                    onChange={update("email")}
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        focus(passwordRef);
                      }
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 outline-none transition focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                  />
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    ref={passwordRef}
                    value={form.password}
                    onChange={update("password")}
                    placeholder="Password (min 6 chars)"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (isLogin) submitBtnRef.current?.click();
                        else focus(confirmRef);
                      }
                    }}
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 bg-white/70 outline-none transition focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-transform duration-200 ${
                      showPassword ? "rotate-180 scale-110" : "rotate-0 scale-100"
                    }`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <StrengthMeter password={form.password} />

                {!isLogin && (
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      ref={confirmRef}
                      value={form.confirm}
                      onChange={update("confirm")}
                      placeholder="Confirm password"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          submitBtnRef.current?.click();
                        }
                      }}
                      className={`
                        w-full pl-11 pr-12 py-3 rounded-xl border bg-white/70 outline-none transition
                        focus:ring-2 focus:border-indigo-300
                        ${
                          mismatch
                            ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                            : "border-gray-200 focus:ring-indigo-200"
                        }
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-transform duration-200 ${
                        showConfirm ? "rotate-180 scale-110" : "rotate-0 scale-100"
                      }`}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {!isLogin && mismatch && (
                  <p className="text-xs text-red-600 -mt-2">
                    Passwords don’t match.
                  </p>
                )}

                {isLogin && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberEmail}
                      onChange={(e) => setRememberEmail(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Remember my email
                  </label>
                )}

                <button
                  ref={submitBtnRef}
                  type="submit"
                  disabled={!canSubmit || loading}
                  className={`
                    w-full py-3 rounded-xl font-semibold transition
                    ${
                      !canSubmit || loading
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                    }
                  `}
                >
                  {loading
                    ? "Please wait..."
                    : isLogin
                    ? "Login"
                    : "Create account"}
                </button>

                <p className="text-center text-xs text-gray-500">
                  By continuing, you agree to our{" "}
                  <span className="text-indigo-600 cursor-pointer">Terms</span>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
