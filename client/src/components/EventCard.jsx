import React from "react";
import { useNavigate } from "react-router-dom";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {navigate(`/event/${event._id}`); window.scrollTo(0, 0);}}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 cursor-pointer w-full">

      {/* Image Section */}
      <div className="relative">
        <img src={event.image} alt={event.title} className="h-48 w-full object-cover"/>

        {/* Badge */}
        {event.badge && (
          <span className="absolute top-3 left-3 bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
            {event.badge}
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm text-gray-700 mt-2">
            {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            })}{" "}
            •{" "}
            {new Date(event.date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            })}
        </p>


        <p className="text-sm text-gray-500">
          {event.location}
        </p>

        <p className="text-sm font-semibold text-gray-800 mt-2">
          {event.price === 0 ? "Free" : `From $${event.price}`}
        </p>
      </div>
      
    </div>
  );
};

export default EventCard;
