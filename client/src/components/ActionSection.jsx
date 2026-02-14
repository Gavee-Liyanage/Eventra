import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Ticket } from "lucide-react";

const ActionSection = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 md:px-16 lg:px-24 py-16 bg-gray-50">
      <div className="grid md:grid-cols-2 gap-8">

        {/* Create Event Card */}
        <div className="relative bg-blue-50 rounded-3xl shadow-md shadow-blue-100 p-8 overflow-hidden hover:shadow-xl transition duration-300">
          
          {/* Decorative Circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full"></div>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500 p-4 rounded-full text-white">
              <CalendarPlus size={28} />
            </div>
            <span className="text-sm text-blue-500 font-semibold uppercase tracking-wide">
              Host your own event
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            Create Event
          </h2>

          <p className="text-gray-600 mb-6">
            Organize concerts, tech talks, workshops, or any event easily. 
            Manage tickets and attendees in one place.
          </p>

          <button
            onClick={() => navigate("/create-event")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Create Now
          </button>
        </div>

        {/* Book Now Card */}
        <div className="relative bg-indigo-50 rounded-3xl shadow-lg shadow-indigo-100 p-8 overflow-hidden hover:shadow-xl transition duration-300">
          
          {/* Decorative Circle */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full"></div>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-indigo-500 p-4 rounded-full text-white">
              <Ticket size={28} />
            </div>
            <span className="text-sm text-indigo-500 font-semibold uppercase tracking-wide">
              Discover amazing events
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            Book Now
          </h2>

          <p className="text-gray-600 mb-6">
            Browse concerts, exhibitions, conferences, and festivals. 
            Reserve your seat in just a few clicks.
          </p>

          <button
            onClick={() => navigate("/events")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Explore Events
          </button>
        </div>

      </div>
    </div>
  );
};

export default ActionSection;
