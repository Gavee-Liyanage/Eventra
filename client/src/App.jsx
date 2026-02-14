import React from "react";  
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";


const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin');
  return (
    <>
    
      {!isAdminRoute && <Navbar />}
      <Routes>
       <Route path="/" element={<Home/>} />
       <Route path="/categories" element={<Categories/>} /> 
        <Route path="/events" element={<Events/>} />
        <Route path="/events/:id" element={<EventDetails/>} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;