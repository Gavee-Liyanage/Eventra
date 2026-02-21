import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

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
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pending-events" element={<PendingEvents />} />
          <Route path="events" element={<AllEvents />} />
          <Route path="list-bookings" element={<ListBookings />} />

          {/* Unknown admin routes → redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
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

        {/* Global fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;