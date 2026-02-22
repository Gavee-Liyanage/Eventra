import React from "react";  
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Footer from "./components/Footer";
import Events from "./pages/Events";
import EventInfo from "./pages/EventInfo";
import Profile from "./pages/Profile";

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin');
  return (
    <>
    
      {!isAdminRoute && <Navbar />}
      <Routes>
       <Route path="/" element={<Home/>} />
       <Route path="/categories" element={<Categories/>} /> 
        <Route path="/events" element={<Events/>} />
        <Route path="/event/:id" element={<EventInfo/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route
          path="*"
          element={
            <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
              Page not found
            </div>
          }
        />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;