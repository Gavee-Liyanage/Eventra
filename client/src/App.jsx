// client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ================== USER SIDE ==================
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Events from "./pages/Events";
import EventInfo from "./pages/EventInfo";
import Profile from "./pages/Profile";

// ================== ADMIN ==================
import AdminLayout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import ListBookings from "./pages/admin/ListBookings";
import PendingEvents from "./pages/admin/PendingEvents";
import AllEvents from "./pages/admin/AllEvents";

// ================== ORGANIZER ==================
import OrganizerLayout from "./pages/organizer/Layout";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import MyEvents from "./pages/organizer/MyEvents";
import CreateEvent from "./pages/organizer/CreateEvent";
import EditEvent from "./pages/organizer/EditEvent";

const App = () => {
  const location = useLocation();

  // Hide user Navbar/Footer on admin + organizer pages
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isOrganizerRoute = location.pathname.startsWith("/organizer");
  const hideUserLayout = isAdminRoute || isOrganizerRoute;

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {!hideUserLayout && <Navbar />}

      <Routes>
        {/* ================= USER ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:id" element={<EventInfo />} />
        <Route path="/profile" element={<Profile />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pending-events" element={<PendingEvents />} />
          <Route path="events" element={<AllEvents />} />
          <Route path="list-bookings" element={<ListBookings />} />
          {/* Unknown admin routes → redirect to admin dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* ================= ORGANIZER ROUTES ================= */}
        <Route path="/organizer" element={<OrganizerLayout />}>
          <Route index element={<OrganizerDashboard />} />
          <Route path="my-events" element={<MyEvents />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="edit-event/:id" element={<EditEvent />} />
          {/* Unknown organizer routes → redirect to organizer dashboard */}
          <Route path="*" element={<Navigate to="/organizer" replace />} />
        </Route>

        {/* ================= GLOBAL FALLBACK ================= */}
        <Route
          path="*"
          element={
            <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
              Page not found
            </div>
          }
        />
      </Routes>

      {!hideUserLayout && <Footer />}
    </>
  );
};

export default App;