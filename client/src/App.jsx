import React from "react";  
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Footer from "./components/Footer";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import EventInfo from "./pages/EventInfo";


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
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;