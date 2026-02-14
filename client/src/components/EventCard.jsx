import React, {useState}from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon, BookmarkIcon } from "lucide-react";

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

   if (!event) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 cursor-pointer"
      onClick={() => navigate(`/event/${event._id}`)}>

      {/* Image Section */}
      <div className="relative">
        <img
          src={event.image}
          alt={event.title}
          className="h-48 w-full object-cover"
        />

        {/* Wishlist Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 text-xl bg-white rounded-lg px-2 py-1 shadow-md hover:shadow-lg transition">

          {liked ? <BookmarkIcon size={24} className="fill-gray-700"  /> : <BookmarkIcon size={24} className="text-gray-700" />}
        </button>

        
      </div>

      {/* Content Section */}
      <div className="p-4">

        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm text-gray-700 mt-2">
          {new Date(event.date).toLocaleDateString()} •{" "}
          {new Date(event.date).toLocaleTimeString([], {
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

        {/* Book Now Button */}
        <button
          onClick={() => navigate(`/event/${event._id}`)}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Book Now
        </button>

      </div>
    </div>
  );
};

export default EventCard;