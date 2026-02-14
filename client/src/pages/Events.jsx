import React, { useState, useEffect } from "react";
import axios from "axios";
import EventCard from "../components/EventCard";
import { Search } from "lucide-react";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Filter Logic
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/events", {
        params: {
          search,
          category,
          priceFilter,
        },
      });

      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, category, priceFilter]);


  const handleSearch = () => {
    fetchEvents();
  };

  if (loading) return <p className="pt-40 text-center">Loading events...</p>;


  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-6 md:px-16">

      {/* Page Title */}
      <h1 className="text-4xl font-bold text-center mt-5 mb-15 text-gray-900">
        Discover Events
      </h1>

      {/* 🔍 Search Section */}
      <div className="flex flex-col-2 gap-4 mb-20 ">

        {/* Advanced Search Bar */}
        <div className="bg-white rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">

          {/* Keyword Input */}
          <input
            type="text"
            placeholder="What are you looking for?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-6 py-4 w-full md:w-64 outline-none text-gray-700"
          />

          <div className="hidden md:block w-px bg-gray-200"></div>

          {/* Location Select (UI Only for Now) */}
          <select className="px-6 py-4 w-full md:w-48 outline-none text-gray-700">
            <option>Location</option>
            <option>New York</option>
            <option>Los Angeles</option>
            <option>Chicago</option>
          </select>

          <div className="hidden md:block w-px bg-gray-200"></div>

          {/* Date Input (UI Only for Now) */}
          <input
            type="date"
            className="px-6 py-4 w-full md:w-48 outline-none text-gray-700"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-indigo-800 hover:bg-indigo-600 text-white px-8 py-4 font-semibold transition duration-300"
          >
            <Search size={18} />
            Search
          </button>
        </div>

        {/* Category + Price Filters (UNCHANGED) */}
        <div className="flex flex-col md:flex-row gap-4">

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 rounded-xl border text-gray-900"
          >
            <option value="All">All Categories</option>
            <option value="Music">Music</option>
            <option value="Tech">Tech</option>
            <option value="Food">Food</option>
            <option value="Sports">Sports</option>
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="p-3 rounded-xl border text-gray-900"
          >
            <option value="All">All Prices</option>
            <option value="Free">Free</option>
            <option value="Under50">Under $50</option>
          </select>

        </div>
      </div>

      {/* Trending Section */}
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        🔥 Trending This Week
      </h2>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-gray-900">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>

    </div>
  );
};

export default Events;
