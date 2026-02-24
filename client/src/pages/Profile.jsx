// src/pages/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Save,
  Heart,
  Calendar,
  Camera,
  Lock,
  X,
} from "lucide-react";

const API = "http://localhost:3000/api";

/* ---------- helpers ---------- */
const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  const first = parts[0][0] || "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

/* ---------- Toast ---------- */
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  return (
    <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-2xl shadow-xl 
    ${type === "error" ? "bg-red-500" : "bg-indigo-600"} text-white animate-fadeIn`}>
      {msg}
    </div>
  );
};

/* ---------- Password Modal ---------- */
const PasswordModal = ({ open, onClose, onSubmit }) => {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur">
      <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-md relative text-gray-800">
        <button className="absolute right-5 top-5" onClick={onClose}>
          <X />
        </button>

        <h2 className="text-xl font-bold mb-5">Change password</h2>

        <input
          type="password"
          placeholder="New password"
          className="w-full border rounded-xl px-4 py-3 mb-3"
          onChange={(e) => setPw(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm password"
          className="w-full border rounded-xl px-4 py-3"
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          onClick={() => pw === confirm && onSubmit(pw)}
          className="mt-5 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold"
        >
          Save password
        </button>
      </div>
    </div>
  );
};

const Profile = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("qs_user"));
    } catch {
      return null;
    }
  });

  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  const [showPwModal, setShowPwModal] = useState(false);

  const [wishlist, setWishlist] = useState([]);
  const [bookings, setBookings] = useState([]);

  const initials = useMemo(() => getInitials(user?.name), [user]);

  useEffect(() => {
    fetchWishlist();
    fetchBookings();
  }, []);

  /* ---------- API calls ---------- */

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("qs_token");
      const res = await axios.get(`${API}/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data || []);
    } catch {}
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("qs_token");
      const res = await axios.get(`${API}/users/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data || []);
    } catch {}
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("qs_token");

      const res = await axios.put(
        `${API}/users/me`,
        { name, avatar: image },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("qs_user", JSON.stringify(res.data));
      setUser(res.data);
      showToast("Profile updated ✨");
    } catch {
      showToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (pw) => {
    try {
      const token = localStorage.getItem("qs_token");
      await axios.put(
        `${API}/users/change-password`,
        { password: pw },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Password updated 🔐");
      setShowPwModal(false);
    } catch {
      showToast("Password update failed", "error");
    }
  };

  const showToast = (msg, type = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3000);
  };

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen pt-28 px-6 bg-gradient-to-b from-indigo-50 to-white">
      <Toast msg={toast} type={toastType} />
      <PasswordModal open={showPwModal} onClose={()=>setShowPwModal(false)} onSubmit={changePassword}/>

      <div className="max-w-6xl mx-auto space-y-6 text-gray-700">

        {/* HERO */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl flex items-center gap-6">
          
          {/* Avatar */}
          <label className="relative cursor-pointer">
            {image ? (
              <img src={image} className="w-24 h-24 rounded-2xl object-cover border"/>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
                {initials}
              </div>
            )}
            <Camera className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full"/>
            <input type="file" hidden onChange={(e)=>{
              const file=e.target.files[0];
              if(file) setImage(URL.createObjectURL(file));
            }}/>
          </label>

          <div>
            <h1 className="text-3xl font-extrabold">{user?.name}</h1>
            <p className="text-white/80">{user?.email}</p>
          </div>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* PROFILE FORM */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow border">
            <h2 className="font-bold text-lg mb-5">Profile details</h2>

            <form onSubmit={updateProfile} className="space-y-4">
              <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
                <User className="text-gray-400"/>
                <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full outline-none"/>
              </div>

              <div className="flex items-center gap-3 border rounded-xl px-4 py-3 bg-gray-50">
                <Mail className="text-gray-400"/>
                <input value={user?.email} disabled className="w-full bg-transparent"/>
              </div>

              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl flex justify-center gap-2">
                <Save/> {saving?"Saving...":"Save"}
              </button>

              <button
                type="button"
                onClick={()=>setShowPwModal(true)}
                className="w-full py-3 border rounded-xl flex justify-center gap-2"
              >
                <Lock/> Change password
              </button>
            </form>
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-6">

            {/* WISHLIST */}
            <div className="bg-white rounded-3xl p-6 shadow border">
              <h3 className="font-bold mb-4 flex gap-2"><Heart/> Wishlist</h3>
              <div className="space-y-3">
                {wishlist.slice(0,3).map(ev=>(
                  <div key={ev._id} className="text-sm border rounded-xl p-3">
                    {ev.title}
                  </div>
                ))}
                {!wishlist.length && <p className="text-sm text-gray-500">No favorites yet</p>}
              </div>
            </div>

            {/* BOOKINGS */}
            <div className="bg-white rounded-3xl p-6 shadow border">
              <h3 className="font-bold mb-4 flex gap-2"><Calendar/> Bookings</h3>
              <div className="space-y-3">
                {bookings.slice(0,3).map(b=>(
                  <div key={b._id} className="text-sm border rounded-xl p-3">
                    {b.eventTitle}
                  </div>
                ))}
                {!bookings.length && <p className="text-sm text-gray-500">No bookings yet</p>}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
